// Feature flags, read once at build time (NEXT_PUBLIC_* are inlined).
//
// ACCOUNT_ENABLED — the whole account area (/account/*, sign-in, onboarding).
//   Historically this was gated by NEXT_PUBLIC_ACADEMY_ENABLED, because the
//   account area started as the Academy LMS. That variable keeps working so
//   existing deployments don't lose the account area; NEXT_PUBLIC_ACCOUNT_ENABLED
//   is the explicit name going forward.
//
// ACADEMY_ENABLED — the training surfaces (/academy, /account/academy, hub tile,
//   XP/ranks, course links). Off unless NEXT_PUBLIC_ACADEMY_VISIBLE=true: the
//   current courses are withdrawn while new trainings are prepared. Progress,
//   certificates and Stripe purchases stay in the database untouched.
export const ACCOUNT_ENABLED =
  process.env.NEXT_PUBLIC_ACCOUNT_ENABLED === 'true' || process.env.NEXT_PUBLIC_ACADEMY_ENABLED === 'true';

export const ACADEMY_ENABLED = ACCOUNT_ENABLED && process.env.NEXT_PUBLIC_ACADEMY_VISIBLE === 'true';
