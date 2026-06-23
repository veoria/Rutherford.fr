import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(
  request: NextRequest,
  opts?: { rewriteUrl?: URL; requestHeaders?: Headers },
) {
  const init = () => ({ request: { headers: opts?.requestHeaders ?? request.headers } });
  const makeResponse = () =>
    opts?.rewriteUrl ? NextResponse.rewrite(opts.rewriteUrl, init()) : NextResponse.next(init());

  let response = makeResponse();

  // No-op when Supabase is not yet configured (during initial deploy)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = makeResponse();
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = makeResponse();
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // refresh the session if expired
  await supabase.auth.getUser();

  return response;
}
