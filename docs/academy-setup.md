# Rutherford Academy — auth & payments setup

This is the operator runbook for going from "code deployed" to "users can sign in and pay". Three external services need configuration: **Supabase** (auth + DB), **Stripe** (payments), and **Vercel** (env vars).

## Order of operations

1. Run the SQL migration in Supabase
2. Configure Supabase Auth providers (Google + Apple + Email)
3. Create Stripe products and prices
4. Set environment variables in Vercel
5. Configure the Stripe webhook
6. Smoke test on the production domain

---

## 1. Run the SQL migration in Supabase

1. Open the Supabase dashboard for project `cawumjturiizzhzjtuiy`
2. Go to **SQL Editor** → New query
3. Paste the entire contents of `supabase/migrations/20260513_init.sql`
4. Run

This creates 4 tables (`profiles`, `enrollments`, `pass_subscriptions`, `course_progress`), 1 view (`user_course_access`), and the RLS policies. The trigger `on_auth_user_created` auto-creates a profile row when a new user signs up.

Verify in **Database → Tables** that the 4 tables exist and that RLS is enabled on each.

## 2. Configure Supabase Auth

In the Supabase dashboard → **Authentication → URL Configuration**:

- Site URL: `https://rutherford.fr`
- Redirect URLs (add all of these):
  - `https://rutherford.fr/api/auth/callback`
  - `https://www.rutherford.fr/api/auth/callback`
  - `http://localhost:3002/api/auth/callback` (local dev)

### Email magic link

**Authentication → Providers → Email** — already enabled by default. In the same section, customize the email template if desired (subject, body). The default template works.

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or reuse one)
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: paste the **Callback URL** that Supabase shows under Authentication → Providers → Google (it looks like `https://cawumjturiizzhzjtuiy.supabase.co/auth/v1/callback`)
6. Save → copy the **Client ID** and **Client Secret**
7. Back in Supabase → **Authentication → Providers → Google** → paste the two values and enable

### Apple (optional)

Apple sign-in needs an Apple Developer account (€99/year) and is more involved. Skip for V1 if not strictly required; the button is already there but will error gracefully if not configured. To enable later:

1. Apple Developer → Identifiers → create a Service ID
2. Configure it for Sign In with Apple, add the Supabase callback URL as a Return URL
3. Generate a key, download the `.p8`
4. Supabase → Authentication → Providers → Apple → paste Service ID, Key ID, Team ID, and the `.p8` contents

## 3. Stripe products and prices

In [Stripe Dashboard](https://dashboard.stripe.com) → **Products** → **Add product**. Create 7 products (in test mode first):

| Product name | Price | Mode |
|---|---|---|
| Closed-Loop Color Masterclass | €149 | One-time |
| MeasureColor Production | €119 | One-time |
| MeasureColor Reports | €119 | One-time |
| IntelliTrax2 Mastery | €129 | One-time |
| ColorLoop AI | €99 | One-time |
| Offset360 in Practice | €99 | One-time |
| Rutherford Academy Pass | €399 | One-time (lifetime) |

For each product, after creating, copy the **Price ID** (starts with `price_`).

> If you prefer the Pass as a subscription (e.g., €39/month), set its price to recurring monthly and use `mode: 'subscription'` in the checkout flow. The webhook handler already supports both modes.

## 4. Vercel environment variables

In the Vercel dashboard for project `rutherford-fr` → **Settings → Environment Variables** → add the following for Production:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://cawumjturiizzhzjtuiy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (KEEP SECRET) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys → Publishable key |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | (set later, see step 5) |
| `STRIPE_PRICE_CLOSED_LOOP` | Stripe product page → Price ID |
| `STRIPE_PRICE_MEASURECOLOR_PRODUCTION` | … |
| `STRIPE_PRICE_MEASURECOLOR_REPORTS` | … |
| `STRIPE_PRICE_INTELLITRAX2` | … |
| `STRIPE_PRICE_COLORLOOP_AI` | … |
| `STRIPE_PRICE_OFFSET360` | … |
| `STRIPE_PRICE_ACADEMY_PASS` | … |

Trigger a redeploy after adding all variables.

## 5. Stripe webhook

In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- Endpoint URL: `https://rutherford.fr/api/stripe/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- After saving, click the webhook → reveal **Signing secret** → copy it (starts with `whsec_`)
- Set this as `STRIPE_WEBHOOK_SECRET` in Vercel
- Redeploy

## 6. Smoke test

1. Open `https://rutherford.fr/academy/closed-loop-flagship` in an incognito window
2. You should see the video, syllabus, paywall locked module list, and "Buy this course" + "Get the Academy Pass" buttons
3. Click **Buy this course**
4. You should be redirected to `/account/sign-in?next=...`
5. Sign in with Google or Magic Link
6. After sign-in you land back on the course page
7. Click **Buy this course** again → Stripe Checkout opens
8. Use test card `4242 4242 4242 4242` with any future expiry and any CVC
9. Complete payment
10. You should land back on the course page with the lessons unlocked and a green "✓ Enrolled" badge

If lessons don't unlock, check:
- The webhook fired (Stripe Dashboard → Webhooks → endpoint → recent deliveries should show `checkout.session.completed` with 2xx)
- The webhook secret matches between Stripe and Vercel
- The `enrollments` table in Supabase has a new row for the user/course

## Troubleshooting

- **"sign in required" loop**: env vars likely not set on Vercel. Check `NEXT_PUBLIC_SUPABASE_URL` is present in Production.
- **Webhook 401**: `STRIPE_WEBHOOK_SECRET` doesn't match. Re-copy from Stripe dashboard.
- **Webhook 500**: `SUPABASE_SERVICE_ROLE_KEY` is wrong or missing. The webhook needs the service role to bypass RLS.
- **Pass purchase doesn't unlock courses**: the webhook handler currently grants all 6 premium courses on Academy Pass purchase via `source='pass'`. Check the `enrollments` table; you should see 6 rows after a Pass purchase.

## Going live (test → production)

1. In Stripe, flip the dashboard toggle to **Live mode**
2. Re-create the 7 products with **live** prices (test prices don't carry over)
3. Re-create the webhook endpoint in live mode
4. Replace all `STRIPE_*` env vars in Vercel with the live equivalents
5. Trigger one final smoke test with a real card (you can refund yourself)
