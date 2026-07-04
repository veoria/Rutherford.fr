// SERVER-ONLY: build the AccountHub props for an ARBITRARY user, via the admin
// (service-role) client, so the back-office can render a read-only "view as
// client" preview. Mirrors app/account/page.tsx, but every read is filtered by
// the target user id (admin bypasses RLS) and the team is read-only.
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { ALL_COURSES } from '@/data/academy-courses';
import { courseHasQuiz } from '@/data/academy-quizzes';
import { getLessonsForCourse } from '@/data/academy-lessons';
import { overallStats, type CourseStat } from '@/lib/gamification';
import type { AccountType } from '@/data/account-types';
import type { MemberRole, Team } from '@/lib/organizations';
import type { AccountHubProps } from '@/components/account-hub';
import type { ClientSystem } from '@/components/account-systems';
import { getSystemsForOrg, toAccountInstallation } from '@/lib/client-systems';

const OPEN_CV = ['submitted', 'in_review', 'changes_requested'];

export async function getAccountHubPreview(userId: string): Promise<Omit<AccountHubProps, 'preview'> | null> {
  const admin = createSupabaseAdminClient();

  const [authRes, profRes, progRes, quizRes, cvRes, stRes] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin
      .from('profiles')
      .select('full_name, avatar_url, country, company, job_title, account_type, organization_id')
      .eq('id', userId)
      .maybeSingle(),
    admin.from('course_progress').select('course_slug, lesson_index').eq('user_id', userId),
    admin.from('quiz_attempts').select('course_slug, passed').eq('user_id', userId),
    admin
      .from('console_validations')
      .select('machine, country, company, status, created_at, pipedrive_deal_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    admin.from('support_tickets').select('id, status, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }),
  ]);

  const authUser = authRes.data?.user as { id: string; email?: string | null; created_at?: string } | undefined;
  if (!authUser) return null;
  const p = (profRes.data ?? null) as {
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    company: string | null;
    job_title: string | null;
    account_type: string;
    organization_id: string | null;
  } | null;
  const email = authUser.email ?? '';
  const accountType = ((p?.account_type as AccountType) ?? 'client') as AccountType;

  // ── Academy progress (mirrors app/account/page.tsx) ──
  const progress = (progRes.data ?? []) as { course_slug: string; lesson_index: number }[];
  const passedSlugs = new Set(
    ((quizRes.data ?? []) as { course_slug: string; passed: boolean }[]).filter((q) => q.passed).map((q) => q.course_slug)
  );
  const doneByCourse = new Map<string, Set<number>>();
  for (const r of progress) {
    const set = doneByCourse.get(r.course_slug) ?? new Set<number>();
    set.add(r.lesson_index);
    doneByCourse.set(r.course_slug, set);
  }
  const courseStats: CourseStat[] = ALL_COURSES.map((c) => {
    const done = [...(doneByCourse.get(c.id) ?? [])].filter((i) => i >= 0 && i < c.modules).length;
    const certified = courseHasQuiz(c.id) ? passedSlugs.has(c.id) : c.modules > 0 && done >= c.modules;
    return { completedCount: done, total: c.modules, certified };
  });
  const stats = overallStats(courseStats);

  let resume: Omit<AccountHubProps, 'preview'>['resume'] = null;
  for (const c of ALL_COURSES) {
    const done = doneByCourse.get(c.id);
    if (!done || done.size === 0 || done.size >= c.modules) continue;
    let next = 0;
    while (next < c.modules && done.has(next)) next += 1;
    const lessons = getLessonsForCourse(c.id);
    resume = { slug: c.id, title: c.title, moduleIndex: next, moduleTitle: lessons?.[next]?.title ?? `Module ${next + 1}` };
    break;
  }

  // ── Systems (presses) + console stat ──
  const ownRows = (cvRes.data ?? []) as {
    machine: string | null;
    country: string | null;
    company: string | null;
    status: string;
    created_at: string;
    pipedrive_deal_id: number | null;
  }[];
  const ownStatuses = ownRows.map((r) => r.status);
  const cvEligible = ownStatuses.filter((s) => s === 'can_be_connected').length;
  const cvOpen = ownStatuses.filter((s) => OPEN_CV.includes(s)).length;
  const sysByMachine = new Map<string, ClientSystem>();
  for (const r of ownRows) {
    const machine = (r.machine ?? '').trim();
    if (!machine) continue;
    const key = machine.toLowerCase();
    const ex = sysByMachine.get(key);
    if (ex) ex.count += 1;
    else sysByMachine.set(key, { machine, company: r.company, country: r.country, status: r.status, dealId: r.pipedrive_deal_id, count: 1 });
  }
  const systems = [...sysByMachine.values()];

  // ── Support tile (best-effort) ──
  let supportStatus: string | null = null;
  let supportNewMessage = false;
  try {
    const stRows = (stRes.data ?? []) as { id: string; status: string }[];
    const openTickets = stRows.filter((r) => ['new', 'in_progress', 'waiting_customer'].includes(r.status));
    if (openTickets.length) {
      supportStatus = openTickets.find((r) => r.status === 'waiting_customer')?.status ?? openTickets[0].status;
      const { data: msgRows } = await admin
        .from('support_messages')
        .select('ticket_id, author, created_at')
        .in('ticket_id', openTickets.map((r) => r.id))
        .order('created_at', { ascending: false });
      const seen = new Set<string>();
      for (const m of (msgRows ?? []) as { ticket_id: string; author: string }[]) {
        if (seen.has(m.ticket_id)) continue;
        seen.add(m.ticket_id);
        if (m.author === 'team') supportNewMessage = true;
      }
    }
  } catch {
    /* support tables optional */
  }

  // ── Team (org + the member themselves), read-only + installed systems ──
  let org: Team['org'] = null;
  let memberRole: MemberRole = 'member';
  let installations: Omit<AccountHubProps, 'preview'>['installations'] = [];
  if (p?.organization_id) {
    const [{ data: o }, { data: mem }, orgSystems] = await Promise.all([
      admin.from('organizations').select('id, name, type, logo_url').eq('id', p.organization_id).maybeSingle(),
      admin.from('organization_members').select('role').eq('org_id', p.organization_id).eq('user_id', userId).maybeSingle(),
      getSystemsForOrg(p.organization_id),
    ]);
    installations = orgSystems.map(toAccountInstallation);
    if (o) {
      const oo = o as { id: string; name: string; type: string; logo_url: string | null };
      org = { id: oo.id, name: oo.name, type: oo.type, logoUrl: oo.logo_url ?? null };
    }
    memberRole = (((mem as { role?: string } | null)?.role as MemberRole) ?? 'member') as MemberRole;
  }
  const team: Team = {
    org,
    members: [{ userId, name: p?.full_name ?? null, email, role: memberRole }],
    pending: [],
    myRole: null, // read-only — disables every management control in the hub
  };

  return {
    accountType,
    team,
    selfId: userId,
    networkResellers: [],
    email,
    memberSince: authUser.created_at ?? null,
    profile: {
      fullName: p?.full_name ?? null,
      avatarUrl: p?.avatar_url ?? null,
      country: p?.country ?? null,
      company: p?.company ?? null,
      jobTitle: p?.job_title ?? null,
    },
    academy: {
      level: stats.level.level,
      percentIntoLevel: stats.level.percentIntoLevel,
      xp: stats.xp,
      xpToNext: stats.level.xpToNext,
      isMax: stats.level.isMax,
      completedModules: stats.completedModules,
      totalModules: stats.totalModules,
      certificates: stats.certifiedCount,
    },
    consoleStat: { eligible: cvEligible, open: cvOpen },
    supportStat: { status: supportStatus, newMessage: supportNewMessage },
    resume,
    resellerClients: [],
    systems,
    installations,
  };
}
