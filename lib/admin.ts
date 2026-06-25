import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { AccountType } from '@/data/account-types';
import { ALL_COURSES } from '@/data/academy-courses';
import { courseHasQuiz } from '@/data/academy-quizzes';
import { currentStreakFromDays, type ProgressRow } from '@/lib/progress';
import { levelForXp, XP_PER_MODULE, XP_PER_COURSE, XP_PER_CERTIFICATE } from '@/lib/gamification';
import { pipedriveDealUrl } from '@/lib/pipedrive';
import { asanaTaskUrl } from '@/lib/asana';

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  country: string | null;
  jobTitle: string | null;
  isAdmin: boolean;
  accountType: AccountType;
  suspended: boolean;
  onboarded: boolean;
  signupAt: string | null;
  lastActiveAt: string | null;
  modulesCompleted: number;
  coursesCompleted: number;
  certificates: number;
  xp: number;
  level: number;
  streak: number;
  activePass: boolean;
  purchases: number;
};

export type AdminCourseStat = {
  slug: string;
  title: string;
  tone: 'free' | 'premium';
  hasQuiz: boolean;
  learners: number; // users with >= 1 completed module
  certified: number; // users who earned the certificate
  avgQuizPct: number | null; // average best score among users who attempted
};

export type AdminConsoleValidation = {
  id: string;
  createdAt: string;
  company: string | null;
  country: string | null;
  machine: string | null;
  status: string;
  email: string;
  refCode: string | null;
  pipedriveDealId: number | null;
  pipedriveUrl: string | null;
  asanaUrl: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  assignee: string | null;
  followers: string[];
  userEmail: string | null;
};

export type AdminOverview = {
  users: AdminUser[];
  courses: AdminCourseStat[];
  consoleValidations: AdminConsoleValidation[];
  totals: {
    users: number;
    onboarded: number;
    certificates: number;
    activePass: number;
    consoleOpen: number;
  };
};

const moduleCountBySlug = new Map(ALL_COURSES.map((c) => [c.id, c.modules] as const));

/** Assemble the full back-office overview. Service-role reads — callers MUST
 * verify the requester is an admin before invoking this. */
export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createSupabaseAdminClient();

  const [authRes, profilesRes, progressRes, quizRes, enrollRes, passRes, cvRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('profiles').select('id, full_name, company, country, job_title, onboarded_at, is_admin, account_type'),
    admin.from('course_progress').select('user_id, course_slug, lesson_index, completed_at'),
    admin.from('quiz_attempts').select('user_id, course_slug, passed, score, total, created_at'),
    admin.from('enrollments').select('user_id, course_slug, source'),
    admin.from('pass_subscriptions').select('user_id, status'),
    admin
      .from('console_validations')
      .select(
        'id, created_at, company, country, machine, status, email, ref_code, pipedrive_deal_id, asana_task_gid, reviewed_by, reviewed_at, assignee, followers, user_id'
      )
      .order('created_at', { ascending: false }),
  ]);

  type AuthUser = {
    id: string;
    email?: string | null;
    created_at?: string;
    last_sign_in_at?: string | null;
    banned_until?: string | null;
  };
  const authUsers = (authRes.data?.users ?? []) as AuthUser[];
  const profiles = (profilesRes.data ?? []) as {
    id: string;
    full_name: string | null;
    company: string | null;
    country: string | null;
    job_title: string | null;
    onboarded_at: string | null;
    is_admin: boolean;
    account_type: string;
  }[];
  const progress = (progressRes.data ?? []) as (ProgressRow & { user_id: string })[];
  const quiz = (quizRes.data ?? []) as {
    user_id: string;
    course_slug: string;
    passed: boolean;
    score: number;
    total: number;
    created_at: string;
  }[];
  const enroll = (enrollRes.data ?? []) as { user_id: string; course_slug: string; source: string }[];
  const pass = (passRes.data ?? []) as { user_id: string; status: string }[];

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const activePassByUser = new Set(pass.filter((p) => p.status === 'active').map((p) => p.user_id));
  const purchasesByUser = new Map<string, number>();
  for (const e of enroll) {
    if (e.source === 'purchase') purchasesByUser.set(e.user_id, (purchasesByUser.get(e.user_id) ?? 0) + 1);
  }

  // Completed modules per (user, course), clamped to the course's module count.
  const doneByUserCourse = new Map<string, Set<number>>();
  for (const r of progress) {
    const max = moduleCountBySlug.get(r.course_slug) ?? 0;
    if (r.lesson_index < 0 || r.lesson_index >= max) continue;
    const key = `${r.user_id}::${r.course_slug}`;
    (doneByUserCourse.get(key) ?? doneByUserCourse.set(key, new Set()).get(key)!).add(r.lesson_index);
  }
  // Best quiz score + pass per (user, course).
  const quizByUserCourse = new Map<string, { passed: boolean; bestPct: number }>();
  for (const q of quiz) {
    const key = `${q.user_id}::${q.course_slug}`;
    const cur = quizByUserCourse.get(key) ?? { passed: false, bestPct: 0 };
    if (q.passed) cur.passed = true;
    if (q.total > 0) cur.bestPct = Math.max(cur.bestPct, Math.round((q.score / q.total) * 100));
    quizByUserCourse.set(key, cur);
  }
  // Activity days per user (modules + passed quizzes) for the streak.
  const daysByUser = new Map<string, Set<string>>();
  const addDay = (uid: string, iso: string) => {
    (daysByUser.get(uid) ?? daysByUser.set(uid, new Set()).get(uid)!).add(iso);
  };
  for (const r of progress) addDay(r.user_id, r.completed_at.slice(0, 10));
  for (const q of quiz) if (q.passed) addDay(q.user_id, q.created_at.slice(0, 10));
  // Latest activity timestamp per user.
  const lastActivityByUser = new Map<string, string>();
  const bumpActivity = (uid: string, ts: string) => {
    const cur = lastActivityByUser.get(uid);
    if (!cur || ts > cur) lastActivityByUser.set(uid, ts);
  };
  for (const r of progress) bumpActivity(r.user_id, r.completed_at);
  for (const q of quiz) bumpActivity(q.user_id, q.created_at);

  const isCertified = (uid: string, slug: string): boolean => {
    const modules = moduleCountBySlug.get(slug) ?? 0;
    const done = doneByUserCourse.get(`${uid}::${slug}`)?.size ?? 0;
    const complete = modules > 0 && done >= modules;
    return courseHasQuiz(slug) ? Boolean(quizByUserCourse.get(`${uid}::${slug}`)?.passed) : complete;
  };

  const users: AdminUser[] = authUsers.map((u) => {
    const p = profileById.get(u.id);
    let modulesCompleted = 0;
    let coursesCompleted = 0;
    let certificates = 0;
    for (const c of ALL_COURSES) {
      const done = doneByUserCourse.get(`${u.id}::${c.id}`)?.size ?? 0;
      modulesCompleted += done;
      if (c.modules > 0 && done >= c.modules) coursesCompleted += 1;
      if (isCertified(u.id, c.id)) certificates += 1;
    }
    const xp = modulesCompleted * XP_PER_MODULE + coursesCompleted * XP_PER_COURSE + certificates * XP_PER_CERTIFICATE;
    const lastProgress = lastActivityByUser.get(u.id) ?? null;
    const lastSignIn = u.last_sign_in_at ?? null;
    const lastActiveAt =
      lastProgress && lastSignIn ? (lastProgress > lastSignIn ? lastProgress : lastSignIn) : lastProgress ?? lastSignIn;
    return {
      id: u.id,
      name: p?.full_name ?? null,
      email: u.email ?? '',
      company: p?.company ?? null,
      country: p?.country ?? null,
      jobTitle: p?.job_title ?? null,
      isAdmin: Boolean(p?.is_admin),
      accountType: (p?.account_type as AccountType) ?? 'client',
      suspended: Boolean(u.banned_until) && new Date(u.banned_until as string).getTime() > Date.now(),
      onboarded: Boolean(p?.onboarded_at),
      signupAt: u.created_at ?? null,
      lastActiveAt,
      modulesCompleted,
      coursesCompleted,
      certificates,
      xp,
      level: levelForXp(xp).level,
      streak: currentStreakFromDays(daysByUser.get(u.id) ?? new Set()),
      activePass: activePassByUser.has(u.id),
      purchases: purchasesByUser.get(u.id) ?? 0,
    };
  });
  users.sort((a, b) => (b.signupAt ?? '').localeCompare(a.signupAt ?? ''));

  const courses: AdminCourseStat[] = ALL_COURSES.map((c) => {
    let learners = 0;
    let certified = 0;
    const scores: number[] = [];
    for (const u of authUsers) {
      const done = doneByUserCourse.get(`${u.id}::${c.id}`)?.size ?? 0;
      if (done > 0) learners += 1;
      if (isCertified(u.id, c.id)) certified += 1;
      const q = quizByUserCourse.get(`${u.id}::${c.id}`);
      if (q) scores.push(q.bestPct);
    }
    return {
      slug: c.id,
      title: c.title,
      tone: c.tone,
      hasQuiz: courseHasQuiz(c.id),
      learners,
      certified,
      avgQuizPct: scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : null,
    };
  });

  const emailByUserId = new Map(authUsers.map((u) => [u.id, u.email ?? null] as const));
  const cvRows = (cvRes.data ?? []) as {
    id: string;
    created_at: string;
    company: string | null;
    country: string | null;
    machine: string | null;
    status: string;
    email: string;
    ref_code: string | null;
    pipedrive_deal_id: number | null;
    asana_task_gid: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    assignee: string | null;
    followers: string[] | null;
    user_id: string | null;
  }[];
  const consoleValidations: AdminConsoleValidation[] = cvRows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    company: r.company,
    country: r.country,
    machine: r.machine,
    status: r.status,
    email: r.email,
    refCode: r.ref_code,
    pipedriveDealId: r.pipedrive_deal_id,
    pipedriveUrl: pipedriveDealUrl(r.pipedrive_deal_id),
    asanaUrl: asanaTaskUrl(r.asana_task_gid),
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    assignee: r.assignee,
    followers: r.followers ?? [],
    userEmail: r.user_id ? emailByUserId.get(r.user_id) ?? null : null,
  }));
  const consoleOpen = consoleValidations.filter((c) =>
    ['submitted', 'in_review', 'changes_requested'].includes(c.status)
  ).length;

  return {
    users,
    courses,
    consoleValidations,
    totals: {
      users: authUsers.length,
      onboarded: users.filter((u) => u.onboarded).length,
      certificates: users.reduce((s, u) => s + u.certificates, 0),
      activePass: users.filter((u) => u.activePass).length,
      consoleOpen,
    },
  };
}
