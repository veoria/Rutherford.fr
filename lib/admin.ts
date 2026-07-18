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

export type AdminSupportTicket = {
  id: string;
  createdAt: string;
  name: string | null;
  email: string;
  status: string;
  assignee: string | null;
  asanaUrl: string | null;
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

  const [authRes, profRes, progRes, quizRes, enrollRes, passRes] = await Promise.all([
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
