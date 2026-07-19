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
  jobRoles: string[] | null;
  isAdmin: boolean;
  accountType: AccountType;
  /** How account_type was decided ('unqualified' = à qualifier queue). NULL =
   * legacy row classified before the qualification migration. */
  accountTypeSource: string | null;
  suspended: boolean;
  onboarded: boolean;
  signupAt: string | null;
  lastActiveAt: string | null;
  lastSignInAt: string | null;
  orgId: string | null;
  modulesCompleted: number;
  coursesCompleted: number;
  certificates: number;
  xp: number;
  level: number;
  streak: number;
  activePass: boolean;
  purchases: number;
};

export type AdminCourseLearner = {
  userId: string;
  modulesDone: number;
  bestQuizPct: number | null;
  certified: boolean;
};

export type AdminCourseStat = {
  slug: string;
  title: string;
  tone: 'free' | 'premium';
  hasQuiz: boolean;
  learners: number; // users with >= 1 completed module
  certified: number; // users who earned the certificate
  avgQuizPct: number | null; // average best score among users who attempted
  // Per-course learner rows for the drill-down (brief § 4.2.2). Identity is
  // joined UI-side from the overview's users list by userId — no duplication.
  learnerDetails: AdminCourseLearner[];
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
  userId: string | null;
  userEmail: string | null;
};

export type AdminSupportTicket = {
  id: string;
  createdAt: string;
  name: string | null;
  email: string;
  status: string;
  assignee: string | null;
  asanaUrl: string | null;
  userId: string | null;
  userEmail: string | null;
  customerReplyAt: string | null;
};

export type AdminOverview = {
  users: AdminUser[];
  courses: AdminCourseStat[];
  consoleValidations: AdminConsoleValidation[];
  supportTickets: AdminSupportTicket[];
  totals: {
    users: number;
    onboarded: number;
    certificates: number;
    activePass: number;
    consoleOpen: number;
    supportOpen: number;
  };
};

const moduleCountBySlug = new Map(ALL_COURSES.map((c) => [c.id, c.modules] as const));

/** Assemble the full back-office overview. Service-role reads — callers MUST
 * verify the requester is an admin before invoking this. */
export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createSupabaseAdminClient();

  const [authRes, profilesRes, progressRes, quizRes, enrollRes, passRes, cvRes, supportRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from('profiles')
      .select(
        'id, full_name, company, country, job_title, job_roles, onboarded_at, is_admin, account_type, account_type_source, organization_id'
      ),
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
    admin
      .from('support_tickets')
      .select('id, created_at, name, email, status, assignee_name, asana_task_gid, user_id, customer_reply_at')
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
    job_roles: string[] | null;
    onboarded_at: string | null;
    is_admin: boolean;
    account_type: string;
    account_type_source: string | null;
    organization_id: string | null;
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
      jobRoles: p?.job_roles ?? null,
      isAdmin: Boolean(p?.is_admin),
      accountType: (p?.account_type as AccountType) ?? 'client',
      accountTypeSource: p?.account_type_source ?? null,
      suspended: Boolean(u.banned_until) && new Date(u.banned_until as string).getTime() > Date.now(),
      onboarded: Boolean(p?.onboarded_at),
      signupAt: u.created_at ?? null,
      lastActiveAt,
      lastSignInAt: lastSignIn,
      orgId: p?.organization_id ?? null,
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
    const learnerDetails: AdminCourseLearner[] = [];
    for (const u of authUsers) {
      const done = doneByUserCourse.get(`${u.id}::${c.id}`)?.size ?? 0;
      const q = quizByUserCourse.get(`${u.id}::${c.id}`);
      const isCert = isCertified(u.id, c.id);
      if (done > 0) learners += 1;
      if (isCert) certified += 1;
      if (q) scores.push(q.bestPct);
      // A learner row for anyone who has engaged with the course (a module done
      // or a quiz attempt) — the drill-down "who follows this course".
      if (done > 0 || q) {
        learnerDetails.push({
          userId: u.id,
          modulesDone: done,
          bestQuizPct: q ? q.bestPct : null,
          certified: isCert,
        });
      }
    }
    return {
      slug: c.id,
      title: c.title,
      tone: c.tone,
      hasQuiz: courseHasQuiz(c.id),
      learners,
      certified,
      avgQuizPct: scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : null,
      learnerDetails,
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
    userId: r.user_id,
    userEmail: r.user_id ? emailByUserId.get(r.user_id) ?? null : null,
  }));
  const consoleOpen = consoleValidations.filter((c) =>
    ['submitted', 'in_review', 'changes_requested'].includes(c.status)
  ).length;

  const supportRows = (supportRes.data ?? []) as {
    id: string;
    created_at: string;
    name: string | null;
    email: string;
    status: string;
    assignee_name: string | null;
    asana_task_gid: string | null;
    user_id: string | null;
    customer_reply_at: string | null;
  }[];
  const supportTickets: AdminSupportTicket[] = supportRows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    name: r.name,
    email: r.email,
    status: r.status,
    assignee: r.assignee_name,
    asanaUrl: asanaTaskUrl(r.asana_task_gid),
    userId: r.user_id,
    userEmail: r.user_id ? emailByUserId.get(r.user_id) ?? null : null,
    customerReplyAt: r.customer_reply_at,
  }));
  const supportOpen = supportTickets.filter((t) =>
    ['new', 'in_progress', 'waiting_customer'].includes(t.status)
  ).length;

  return {
    users,
    courses,
    consoleValidations,
    supportTickets,
    totals: {
      users: authUsers.length,
      onboarded: users.filter((u) => u.onboarded).length,
      certificates: users.reduce((s, u) => s + u.certificates, 0),
      activePass: users.filter((u) => u.activePass).length,
      consoleOpen,
      supportOpen,
    },
  };
}

/** Option du sélecteur d'organisation admin (brief § 3.2.1). */
export type AdminOrgOption = { id: string; name: string; type: string };

export type AdminUserCourse = {
  slug: string;
  title: string;
  tone: 'free' | 'premium';
  modulesDone: number;
  modulesTotal: number;
  certified: boolean;
  bestQuizPct: number | null;
};

export type AdminUserDetail = {
  id: string;
  name: string | null;
  email: string;
  notificationEmail: string | null;
  company: string | null;
  country: string | null;
  jobTitle: string | null;
  jobRoles: string[] | null;
  accountType: AccountType;
  /** See AdminUser.accountTypeSource. */
  accountTypeSource: string | null;
  isAdmin: boolean;
  suspended: boolean;
  onboarded: boolean;
  signupAt: string | null;
  lastSignInAt: string | null;
  org: { id: string; name: string; type: string; role: string | null; logoUrl: string | null } | null;
  /** Toutes les organisations {id, name, type}, pour le sélecteur d'org de la
   * fiche (l'org est la source de vérité pour « la société », brief § 3.2.1). */
  orgOptions: AdminOrgOption[];
  level: number;
  xp: number;
  modulesCompleted: number;
  coursesCompleted: number;
  certificates: number;
  activePass: boolean;
  purchases: number;
  courses: AdminUserCourse[];
  validations: AdminConsoleValidation[];
  supportTickets: AdminSupportTicket[];
};

/** Everything the back-office shows for ONE account: identity, org/role, the
 * Academy breakdown, and the person's console validations (owned by the account
 * OR matched by their login email, so pre-account requests show up too).
 * Service-role reads — the caller MUST verify the requester is an admin. */
export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const admin = createSupabaseAdminClient();

  const [authRes, profRes, progRes, quizRes, enrollRes, passRes, orgListRes] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin
      .from('profiles')
      .select(
        'full_name, company, country, job_title, job_roles, onboarded_at, is_admin, account_type, account_type_source, organization_id, notification_email'
      )
      .eq('id', userId)
      .maybeSingle(),
    admin.from('course_progress').select('course_slug, lesson_index').eq('user_id', userId),
    admin.from('quiz_attempts').select('course_slug, passed, score, total').eq('user_id', userId),
    admin.from('enrollments').select('source').eq('user_id', userId),
    admin.from('pass_subscriptions').select('status').eq('user_id', userId),
    // Toutes les orgs pour le sélecteur d'organisation de la fiche.
    admin.from('organizations').select('id, name, type').order('name'),
  ]);

  const authUser = authRes.data?.user as
    | { id: string; email?: string | null; created_at?: string; last_sign_in_at?: string | null; banned_until?: string | null }
    | undefined;
  if (!authUser) return null;
  const p = (profRes.data ?? null) as {
    full_name: string | null;
    company: string | null;
    country: string | null;
    job_title: string | null;
    job_roles: string[] | null;
    onboarded_at: string | null;
    is_admin: boolean;
    account_type: string;
    account_type_source: string | null;
    organization_id: string | null;
    notification_email: string | null;
  } | null;
  const email = authUser.email ?? '';
  const orgOptions = ((orgListRes.data ?? []) as AdminOrgOption[]).map((o) => ({
    id: o.id,
    name: o.name,
    type: o.type,
  }));

  // Org membership + role.
  let org: AdminUserDetail['org'] = null;
  if (p?.organization_id) {
    const [{ data: o }, { data: mem }] = await Promise.all([
      admin.from('organizations').select('id, name, type, logo_url').eq('id', p.organization_id).maybeSingle(),
      admin
        .from('organization_members')
        .select('role')
        .eq('org_id', p.organization_id)
        .eq('user_id', userId)
        .maybeSingle(),
    ]);
    if (o) {
      const oo = o as { id: string; name: string; type: string; logo_url: string | null };
      org = {
        id: oo.id,
        name: oo.name,
        type: oo.type,
        role: ((mem as { role?: string } | null)?.role as string | null) ?? null,
        logoUrl: oo.logo_url ?? null,
      };
    }
  }

  // Academy, per course (mirrors getAdminOverview's logic for a single user).
  const progress = (progRes.data ?? []) as { course_slug: string; lesson_index: number }[];
  const quiz = (quizRes.data ?? []) as { course_slug: string; passed: boolean; score: number; total: number }[];
  const enroll = (enrollRes.data ?? []) as { source: string }[];
  const pass = (passRes.data ?? []) as { status: string }[];

  const doneByCourse = new Map<string, Set<number>>();
  for (const r of progress) {
    const max = moduleCountBySlug.get(r.course_slug) ?? 0;
    if (r.lesson_index < 0 || r.lesson_index >= max) continue;
    (doneByCourse.get(r.course_slug) ?? doneByCourse.set(r.course_slug, new Set()).get(r.course_slug)!).add(r.lesson_index);
  }
  const quizByCourse = new Map<string, { passed: boolean; bestPct: number }>();
  for (const q of quiz) {
    const cur = quizByCourse.get(q.course_slug) ?? { passed: false, bestPct: 0 };
    if (q.passed) cur.passed = true;
    if (q.total > 0) cur.bestPct = Math.max(cur.bestPct, Math.round((q.score / q.total) * 100));
    quizByCourse.set(q.course_slug, cur);
  }

  let modulesCompleted = 0;
  let coursesCompleted = 0;
  let certificates = 0;
  const courses: AdminUserCourse[] = ALL_COURSES.map((c) => {
    const done = doneByCourse.get(c.id)?.size ?? 0;
    const complete = c.modules > 0 && done >= c.modules;
    const certified = courseHasQuiz(c.id) ? Boolean(quizByCourse.get(c.id)?.passed) : complete;
    modulesCompleted += done;
    if (complete) coursesCompleted += 1;
    if (certified) certificates += 1;
    return {
      slug: c.id,
      title: c.title,
      tone: c.tone,
      modulesDone: done,
      modulesTotal: c.modules,
      certified,
      bestQuizPct: quizByCourse.get(c.id)?.bestPct ?? null,
    };
  });
  const xp = modulesCompleted * XP_PER_MODULE + coursesCompleted * XP_PER_COURSE + certificates * XP_PER_CERTIFICATE;
  const activePass = pass.some((s) => s.status === 'active');
  const purchases = enroll.filter((e) => e.source === 'purchase').length;

  // Console validations owned by the account OR matched by the login email.
  const CV_SEL =
    'id, created_at, company, country, machine, status, email, ref_code, pipedrive_deal_id, asana_task_gid, reviewed_by, reviewed_at, assignee, followers, user_id';
  const [byId, byEmail] = await Promise.all([
    admin.from('console_validations').select(CV_SEL).eq('user_id', userId),
    email
      ? admin.from('console_validations').select(CV_SEL).ilike('email', email)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);
  const cvMap = new Map<string, Record<string, unknown>>();
  for (const r of [...((byId.data ?? []) as Record<string, unknown>[]), ...((byEmail.data ?? []) as Record<string, unknown>[])]) {
    cvMap.set(r.id as string, r);
  }
  const validations: AdminConsoleValidation[] = Array.from(cvMap.values())
    .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))
    .map((r) => ({
      id: r.id as string,
      createdAt: r.created_at as string,
      company: (r.company as string | null) ?? null,
      country: (r.country as string | null) ?? null,
      machine: (r.machine as string | null) ?? null,
      status: r.status as string,
      email: r.email as string,
      refCode: (r.ref_code as string | null) ?? null,
      pipedriveDealId: (r.pipedrive_deal_id as number | null) ?? null,
      pipedriveUrl: pipedriveDealUrl((r.pipedrive_deal_id as number | null) ?? null),
      asanaUrl: asanaTaskUrl((r.asana_task_gid as string | null) ?? null),
      reviewedBy: (r.reviewed_by as string | null) ?? null,
      reviewedAt: (r.reviewed_at as string | null) ?? null,
      assignee: (r.assignee as string | null) ?? null,
      followers: (r.followers as string[] | null) ?? [],
      userId: (r.user_id as string | null) ?? null,
      userEmail: email || null,
    }));

  // Support tickets owned by the account OR matched by the login email.
  const SUPPORT_SEL = 'id, created_at, name, email, status, assignee_name, asana_task_gid, customer_reply_at, user_id';
  const [supById, supByEmail] = await Promise.all([
    admin.from('support_tickets').select(SUPPORT_SEL).eq('user_id', userId),
    email
      ? admin.from('support_tickets').select(SUPPORT_SEL).ilike('email', email)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);
  const supMap = new Map<string, Record<string, unknown>>();
  for (const r of [...((supById.data ?? []) as Record<string, unknown>[]), ...((supByEmail.data ?? []) as Record<string, unknown>[])]) {
    supMap.set(r.id as string, r);
  }
  const supportTickets: AdminSupportTicket[] = Array.from(supMap.values())
    .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))
    .map((r) => ({
      id: r.id as string,
      createdAt: r.created_at as string,
      name: (r.name as string | null) ?? null,
      email: r.email as string,
      status: r.status as string,
      assignee: (r.assignee_name as string | null) ?? null,
      asanaUrl: asanaTaskUrl((r.asana_task_gid as string | null) ?? null),
      userId: (r.user_id as string | null) ?? null,
      userEmail: email || null,
      customerReplyAt: (r.customer_reply_at as string | null) ?? null,
    }));

  return {
    id: authUser.id,
    name: p?.full_name ?? null,
    email,
    notificationEmail: p?.notification_email ?? null,
    company: p?.company ?? null,
    country: p?.country ?? null,
    jobTitle: p?.job_title ?? null,
    jobRoles: p?.job_roles ?? null,
    accountType: (p?.account_type as AccountType) ?? 'client',
    accountTypeSource: p?.account_type_source ?? null,
    isAdmin: Boolean(p?.is_admin),
    suspended: Boolean(authUser.banned_until) && new Date(authUser.banned_until as string).getTime() > Date.now(),
    onboarded: Boolean(p?.onboarded_at),
    signupAt: authUser.created_at ?? null,
    lastSignInAt: authUser.last_sign_in_at ?? null,
    org,
    orgOptions,
    level: levelForXp(xp).level,
    xp,
    modulesCompleted,
    coursesCompleted,
    certificates,
    activePass,
    purchases,
    courses,
    validations,
    supportTickets,
  };
}

// ── Fiche organisation — /admin/orgs/[id] (brief § 4.2.3 : les organisations
// deviennent de vraies pages, plus seulement un tiroir) ──

export type AdminOrgMemberRow = {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
};

export type AdminOrgInviteRow = { id: string; email: string; role: string; createdAt: string };

export type AdminOrgSiteRow = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  anydeskId: string | null;
};

export type AdminOrgSystemRow = {
  id: string;
  product: string;
  machine: string | null;
  siteName: string | null;
  licenseKey: string | null;
  licenseStatus: string;
  licenseExpiresAt: string | null;
  installedVersion: string | null;
  latestVersion: string | null;
  anydeskId: string | null;
  /** Org qui a porté la COMMANDE (§ 2.6.2) — null = vente directe Rutherford. */
  soldByOrgName: string | null;
};

export type AdminOrgAttributedRow = {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  systemsCount: number;
};

// Métriques d'une organisation (brief § 4.2 — retours du 19/07/2026). Le
// « périmètre » = les membres de l'org + (pour un revendeur/distributeur) les
// membres de ses clients attribués. Les validations sont scopées précisément
// via user_id OU reseller_id ; le support via user_id (pas de reseller_id sur
// support_tickets). La conversion validation→install est APPROXIMATIVE (pas de
// lien dur validation↔presse équipée aujourd'hui) : ratio presses équipées /
// validations soumises dans le périmètre.
export type AdminOrgMetrics = {
  consoleTotal: number;
  consoleByStatus: { status: string; count: number }[];
  consoleCompatible: number; // status 'can_be_connected'
  supportTotal: number;
  equippedSystems: number; // presses équipées du périmètre (propres + clients attribués)
  conversionPct: number | null; // equippedSystems / consoleTotal, approx.
  licensesExpiringSoon: number; // échéance ≤ 90 jours
  nextLicenseExpiry: string | null;
  lastValidationAt: string | null;
  lastInstallAt: string | null;
  lastMemberSignInAt: string | null;
};

export type AdminOrgDetail = {
  id: string;
  name: string;
  type: string;
  logoUrl: string | null;
  country: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  resellerOrgId: string | null;
  resellerName: string | null;
  distributorOrgId: string | null;
  distributorName: string | null;
  pipedriveOrgId: number | null;
  createdAt: string | null;
  members: AdminOrgMemberRow[];
  pendingInvites: AdminOrgInviteRow[];
  sites: AdminOrgSiteRow[];
  systems: AdminOrgSystemRow[];
  /** Orgs revendeur/distributeur : les organisations qui leur sont attribuées
   * (reseller_org_id resp. distributor_org_id = cette org). */
  attributedOrgs: AdminOrgAttributedRow[];
  metrics: AdminOrgMetrics;
  /** Membre pour l'aperçu « voir la vue du client » — le propriétaire actif de
   * l'org (fallback : premier membre actif), ou null si aucun. */
  previewUserId: string | null;
};

/** Tout ce que la page /admin/orgs/[id] affiche pour UNE organisation :
 * identité + attribution, membres (noms via profiles, e-mails via auth —
 * même approche que getTeamForUser), invitations en attente, usines et
 * systèmes (orgs clientes), et organisations attribuées (orgs revendeur /
 * distributeur). Lectures service-role — l'appelant DOIT avoir vérifié
 * l'accès admin avant d'invoquer. */
export async function getAdminOrgDetail(orgId: string): Promise<AdminOrgDetail | null> {
  const admin = createSupabaseAdminClient();

  const { data: orgRow } = await admin
    .from('organizations')
    .select(
      'id, name, type, logo_url, country, address, postal_code, city, reseller_org_id, distributor_org_id, pipedrive_org_id, created_at'
    )
    .eq('id', orgId)
    .maybeSingle();
  if (!orgRow) return null;
  const o = orgRow as {
    id: string;
    name: string;
    type: string;
    logo_url: string | null;
    country: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
    reseller_org_id: string | null;
    distributor_org_id: string | null;
    pipedrive_org_id: number | null;
    created_at: string | null;
  };

  // Organisations attribuées : celles dont reseller_org_id (org revendeur)
  // resp. distributor_org_id (org distributeur) pointe vers cette org.
  const attributionColumn =
    o.type === 'reseller' ? 'reseller_org_id' : o.type === 'distributor' ? 'distributor_org_id' : null;

  const [memRes, invRes, sitesRes, sysRes, attribRes] = await Promise.all([
    admin.from('organization_members').select('user_id, role, status').eq('org_id', orgId),
    admin.from('invitations').select('id, email, role, created_at').eq('org_id', orgId).eq('status', 'pending'),
    admin
      .from('sites')
      .select('id, name, country, city, address, postal_code, anydesk_id')
      .eq('org_id', orgId)
      .order('name'),
    admin
      .from('client_systems')
      .select(
        'id, product, machine, site_id, license_key, license_status, license_expires_at, installed_version, latest_version, anydesk_id, sold_by_org_id, created_at'
      )
      .eq('org_id', orgId)
      .order('created_at', { ascending: true }),
    attributionColumn
      ? admin.from('organizations').select('id, name, type').eq(attributionColumn, orgId).order('name')
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);

  const memberRows = (memRes.data ?? []) as { user_id: string; role: string; status: string }[];
  const siteRows = (sitesRes.data ?? []) as {
    id: string;
    name: string;
    country: string | null;
    city: string | null;
    address: string | null;
    postal_code: string | null;
    anydesk_id: string | null;
  }[];
  const sysRows = (sysRes.data ?? []) as {
    id: string;
    product: string;
    machine: string | null;
    site_id: string | null;
    license_key: string | null;
    license_status: string;
    license_expires_at: string | null;
    installed_version: string | null;
    latest_version: string | null;
    anydesk_id: string | null;
    sold_by_org_id: string | null;
    created_at: string | null;
  }[];
  const attribRows = (attribRes.data ?? []) as { id: string; name: string; type: string }[];

  // Noms (profiles) + e-mails (auth listUsers) des membres.
  const memberIds = memberRows.map((m) => m.user_id).filter(Boolean);
  const [profsRes, { data: authList }] = await Promise.all([
    admin
      .from('profiles')
      .select('id, full_name')
      .in('id', memberIds.length ? memberIds : ['00000000-0000-0000-0000-000000000000']),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const nameById = new Map(
    ((profsRes.data ?? []) as { id: string; full_name: string | null }[]).map((p) => [p.id, p.full_name])
  );
  const emailById = new Map(
    ((authList?.users ?? []) as { id: string; email?: string | null }[]).map((u) => [u.id, u.email ?? ''])
  );

  const roleRank: Record<string, number> = { owner: 0, admin: 1, member: 2 };
  const members: AdminOrgMemberRow[] = memberRows
    .map((m) => ({
      userId: m.user_id,
      name: nameById.get(m.user_id) ?? null,
      email: emailById.get(m.user_id) ?? '',
      role: m.role,
      status: m.status,
    }))
    .sort((a, b) => (roleRank[a.role] ?? 9) - (roleRank[b.role] ?? 9));

  // Compteurs (membres actifs, systèmes) des orgs attribuées + noms des orgs
  // liées (revendeur, distributeur, « vendu par ») en un aller-retour chacun.
  const attribIds = attribRows.map((a) => a.id);
  const relatedOrgIds = Array.from(
    new Set(
      [o.reseller_org_id, o.distributor_org_id, ...sysRows.map((s) => s.sold_by_org_id)].filter(
        (id): id is string => Boolean(id)
      )
    )
  );
  const [attribMemRes, attribSysRes, relatedRes, cvRes, supRes] = await Promise.all([
    attribIds.length
      ? admin.from('organization_members').select('org_id, user_id').in('org_id', attribIds).eq('status', 'active')
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    attribIds.length
      ? admin.from('client_systems').select('org_id, created_at, license_expires_at').in('org_id', attribIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    relatedOrgIds.length
      ? admin.from('organizations').select('id, name').in('id', relatedOrgIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    // Périmètre validations/support : filtrées en JS par les ids de membres
    // (peu de lignes ; le filtre .or serait fragile avec des listes d'uuid).
    admin.from('console_validations').select('user_id, reseller_id, status, created_at'),
    admin.from('support_tickets').select('user_id, created_at'),
  ]);
  const attribMemberRows = (attribMemRes.data ?? []) as { org_id: string; user_id: string }[];
  const memberCountByOrg = new Map<string, number>();
  for (const r of attribMemberRows) {
    memberCountByOrg.set(r.org_id, (memberCountByOrg.get(r.org_id) ?? 0) + 1);
  }
  const attribSysRows = (attribSysRes.data ?? []) as {
    org_id: string;
    created_at: string | null;
    license_expires_at: string | null;
  }[];
  const systemsCountByOrg = new Map<string, number>();
  for (const r of attribSysRows) {
    systemsCountByOrg.set(r.org_id, (systemsCountByOrg.get(r.org_id) ?? 0) + 1);
  }

  // --- Métriques du périmètre (org + membres des clients attribués) ---------
  const inScopeUserIds = new Set<string>(
    [...memberRows.map((m) => m.user_id), ...attribMemberRows.map((m) => m.user_id)].filter(Boolean)
  );
  const cvAll = (cvRes.data ?? []) as {
    user_id: string | null;
    reseller_id: string | null;
    status: string;
    created_at: string;
  }[];
  const cvScoped = cvAll.filter(
    (c) =>
      (c.user_id && inScopeUserIds.has(c.user_id)) || (c.reseller_id && inScopeUserIds.has(c.reseller_id))
  );
  const supAll = (supRes.data ?? []) as { user_id: string | null; created_at: string }[];
  const supScoped = supAll.filter((t) => t.user_id && inScopeUserIds.has(t.user_id));

  // Presses équipées du périmètre = les systèmes propres (org cliente) + ceux
  // des clients attribués (un revendeur pilote le parc de SES clients).
  const scopedSystems = [
    ...sysRows.map((s) => ({ createdAt: s.created_at, expires: s.license_expires_at })),
    ...attribSysRows.map((s) => ({ createdAt: s.created_at, expires: s.license_expires_at })),
  ];
  const cvByStatus = new Map<string, number>();
  for (const c of cvScoped) cvByStatus.set(c.status, (cvByStatus.get(c.status) ?? 0) + 1);

  const now = Date.now();
  const soonCutoff = now + 90 * 86_400_000;
  let licensesExpiringSoon = 0;
  let nextLicenseExpiry: string | null = null;
  for (const s of scopedSystems) {
    if (!s.expires) continue;
    const t = new Date(s.expires).getTime();
    if (Number.isNaN(t) || t < now) continue;
    if (t <= soonCutoff) licensesExpiringSoon += 1;
    if (!nextLicenseExpiry || s.expires < nextLicenseExpiry) nextLicenseExpiry = s.expires;
  }
  const maxOf = (vals: (string | null)[]): string | null =>
    vals.filter((v): v is string => Boolean(v)).sort().at(-1) ?? null;
  const lastSignInByUser = (authList?.users ?? []) as { id: string; last_sign_in_at?: string | null }[];
  const lastMemberSignInAt = maxOf(
    lastSignInByUser.filter((u) => inScopeUserIds.has(u.id)).map((u) => u.last_sign_in_at ?? null)
  );

  const metrics: AdminOrgMetrics = {
    consoleTotal: cvScoped.length,
    consoleByStatus: [...cvByStatus.entries()].map(([status, count]) => ({ status, count })),
    consoleCompatible: cvByStatus.get('can_be_connected') ?? 0,
    supportTotal: supScoped.length,
    equippedSystems: scopedSystems.length,
    conversionPct: cvScoped.length ? Math.round((scopedSystems.length / cvScoped.length) * 100) : null,
    licensesExpiringSoon,
    nextLicenseExpiry,
    lastValidationAt: maxOf(cvScoped.map((c) => c.created_at)),
    lastInstallAt: maxOf(scopedSystems.map((s) => s.createdAt)),
    lastMemberSignInAt,
  };
  const previewUserId =
    memberRows.find((m) => m.role === 'owner' && m.status === 'active')?.user_id ??
    memberRows.find((m) => m.status === 'active')?.user_id ??
    null;
  const relatedNameById = new Map(
    ((relatedRes.data ?? []) as { id: string; name: string }[]).map((r) => [r.id, r.name])
  );
  const siteNameById = new Map(siteRows.map((s) => [s.id, s.name] as const));

  return {
    id: o.id,
    name: o.name,
    type: o.type,
    logoUrl: o.logo_url ?? null,
    country: o.country,
    address: o.address,
    postalCode: o.postal_code,
    city: o.city,
    resellerOrgId: o.reseller_org_id,
    resellerName: o.reseller_org_id ? relatedNameById.get(o.reseller_org_id) ?? null : null,
    distributorOrgId: o.distributor_org_id,
    distributorName: o.distributor_org_id ? relatedNameById.get(o.distributor_org_id) ?? null : null,
    pipedriveOrgId: o.pipedrive_org_id ?? null,
    createdAt: o.created_at ?? null,
    members,
    pendingInvites: (
      (invRes.data ?? []) as { id: string; email: string; role: string; created_at: string }[]
    ).map((i) => ({ id: i.id, email: i.email, role: i.role, createdAt: i.created_at })),
    sites: siteRows.map((s) => ({
      id: s.id,
      name: s.name,
      country: s.country,
      city: s.city,
      address: s.address,
      postalCode: s.postal_code,
      anydeskId: s.anydesk_id,
    })),
    systems: sysRows.map((s) => ({
      id: s.id,
      product: s.product,
      machine: s.machine,
      siteName: s.site_id ? siteNameById.get(s.site_id) ?? null : null,
      licenseKey: s.license_key,
      licenseStatus: s.license_status,
      licenseExpiresAt: s.license_expires_at,
      installedVersion: s.installed_version,
      latestVersion: s.latest_version,
      anydeskId: s.anydesk_id,
      soldByOrgName: s.sold_by_org_id ? relatedNameById.get(s.sold_by_org_id) ?? null : null,
    })),
    attributedOrgs: attribRows.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      memberCount: memberCountByOrg.get(a.id) ?? 0,
      systemsCount: systemsCountByOrg.get(a.id) ?? 0,
    })),
    metrics,
    previewUserId,
  };
}
