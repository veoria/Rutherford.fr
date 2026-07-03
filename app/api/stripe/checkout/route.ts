import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe, getPriceIdForCourse } from '@/lib/stripe';
import { ALL_COURSES } from '@/data/academy-courses';

export const dynamic = 'force-dynamic';

type Body = { courseSlug?: string; mode?: 'payment' | 'subscription' };

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const courseSlug = body.courseSlug;
  const mode = body.mode ?? 'payment';

  if (!courseSlug) {
    return NextResponse.json({ error: 'missing courseSlug' }, { status: 400 });
  }

  // For per-course purchase, verify the slug exists and is premium
  if (courseSlug !== 'academy-pass') {
    const course = ALL_COURSES.find((c) => c.id === courseSlug);
    if (!course || course.tone !== 'premium') {
      return NextResponse.json({ error: 'invalid course' }, { status: 400 });
    }
  }

  const priceId = getPriceIdForCourse(courseSlug);
  if (!priceId) {
    return NextResponse.json({ error: 'price not configured for this course' }, { status: 500 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'sign in required' }, { status: 401 });
  }

  // Everything below can throw (Stripe API rejections, Supabase errors). Keep it
  // inside a try/catch so the client always receives a JSON error instead of an
  // HTML 500 — otherwise the caller's `res.json()` throws and the buy button
  // fails silently (spinner returns to "Buy" with no feedback).
  try {
    // Fetch / create Stripe customer
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const origin = new URL(request.url).origin;
    const session = await getStripe().checkout.sessions.create({
      mode,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/academy/${courseSlug === 'academy-pass' ? '' : courseSlug}?purchase=success`,
      cancel_url: `${origin}/academy/${courseSlug === 'academy-pass' ? '' : courseSlug}?purchase=cancel`,
      metadata: {
        supabase_user_id: user.id,
        course_slug: courseSlug,
      },
      ...(mode === 'subscription'
        ? {
            subscription_data: {
              metadata: {
                supabase_user_id: user.id,
                course_slug: courseSlug,
              },
            },
          }
        : {}),
    });

    if (!session.url) {
      console.error('[stripe/checkout] session created without a URL', { courseSlug });
      return NextResponse.json({ error: 'could not start checkout' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Log the full detail server-side (visible in Vercel logs) but return a
    // generic, non-leaky error to the client — Stripe messages can reference
    // internal price IDs and test/live-mode state we don't want to expose.
    const message = err instanceof Error ? err.message : 'checkout failed';
    console.error('[stripe/checkout] failed to create session', { courseSlug, mode, message });
    return NextResponse.json({ error: 'could not start checkout' }, { status: 500 });
  }
}
