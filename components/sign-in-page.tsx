'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Front-end demo mode: sign-in buttons drop straight into the sample
// dashboard so collaborators can walk the UI without real auth.
// Flip to false (or wire NEXT_PUBLIC_AUTH_DEMO) to restore real Supabase auth.
const DEMO_AUTH = false;
const DEMO_DASHBOARD = '/account/demo';

export function SignInPage() {
  const search = useSearchParams();
  const next = search.get('next') ?? '/account';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Show "magic link sent" message after redirect back from email link
  useEffect(() => {
    if (search.get('check_email') === '1') setStatus('sent');
  }, [search]);

  const handleGoogle = async () => {
    if (DEMO_AUTH) {
      setStatus('sending');
      window.location.href = DEMO_DASHBOARD;
      return;
    }
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    }
  };

  const handleApple = async () => {
    if (DEMO_AUTH) {
      setStatus('sending');
      window.location.href = DEMO_DASHBOARD;
      return;
    }
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    }
  };

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    if (DEMO_AUTH) {
      setStatus('sending');
      window.location.href = DEMO_DASHBOARD;
      return;
    }
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const emailRedirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo, shouldCreateUser: true },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="signin-section section">
        <div className="container signin-shell">
          <header className="signin-head">
            <p className="section-kicker">Rutherford Academy</p>
            <h1>Sign in or create an account</h1>
            <p>
              Sign in to track your progress, access your enrolled masterclasses, and manage your Academy Pass
              subscription.
            </p>
          </header>

          <div className="signin-card">
            <button
              type="button"
              className="signin-provider signin-provider-google"
              onClick={handleGoogle}
              disabled={status === 'sending'}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              className="signin-provider signin-provider-apple"
              onClick={handleApple}
              disabled={status === 'sending'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.46 1.58-1.5 3.14-.92 1.36-1.88 2.71-3.39 2.74-1.49.03-1.95-.88-3.66-.88-1.71 0-2.22.85-3.63.91-1.45.06-2.55-1.47-3.48-2.83-1.87-2.71-3.32-7.68-1.38-11.05.97-1.66 2.7-2.71 4.57-2.74 1.43-.03 2.78.96 3.66.96.88 0 2.53-1.18 4.27-1.01.73.03 2.77.29 4.08 2.21-.11.07-2.44 1.42-2.41 4.24.03 3.37 2.96 4.49 2.99 4.5z" />
              </svg>
              Continue with Apple
            </button>

            <div className="signin-divider">
              <span>or</span>
            </div>

            <form className="signin-form" onSubmit={handleMagicLink}>
              <label htmlFor="signin-email" className="signin-label">
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                className="signin-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'sending'}
              />
              <button
                type="submit"
                className="button button-accent signin-submit"
                disabled={status === 'sending' || !email}
              >
                {status === 'sending' ? 'Sending…' : 'Send magic link'}
              </button>
            </form>

            {status === 'sent' ? (
              <p className="signin-message signin-message-success">
                Check your inbox at <strong>{email || 'your address'}</strong>. The sign-in link expires in 1 hour.
              </p>
            ) : null}
            {status === 'error' && errorMsg ? (
              <p className="signin-message signin-message-error">{errorMsg}</p>
            ) : null}

            <p className="signin-fine">
              By continuing you agree to our terms. We use your email only to sign you in and to send course-related
              notifications.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
