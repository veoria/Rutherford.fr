-- Harden the user_course_access view.
-- Without security_invoker the view runs with its owner's privileges and bypasses
-- the RLS on enrollments / pass_subscriptions, exposing every user's course access
-- to any authenticated (or anon) caller via the API. Running it as the invoker makes
-- the underlying "self read" RLS apply, so each user only sees their own rows.

alter view public.user_course_access set (security_invoker = on);

-- The view is only ever read server-side for the signed-in user; anon never needs it.
revoke all on public.user_course_access from anon;
