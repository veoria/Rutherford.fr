/**
 * Streams a photo that lives outside /public so the cover editor can show it.
 * Dev only, and strictly limited to the folders declared in ../roots.
 */

import { NextResponse } from 'next/server';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

import { IMAGE_EXTENSIONS, MIME_BY_EXTENSION, isInsideARoot } from '../roots';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const raw = new URL(request.url).searchParams.get('p');
  if (!raw) return new NextResponse('Missing p', { status: 400 });

  const path = decodeURIComponent(raw);
  if (!IMAGE_EXTENSIONS.test(path) || !isInsideARoot(path)) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  if (!existsSync(path) || !statSync(path).isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = extname(path).slice(1).toLowerCase();
  const body = readFileSync(path);

  return new NextResponse(body, {
    headers: {
      'content-type': MIME_BY_EXTENSION[ext] ?? 'application/octet-stream',
      // Same bytes for the same path during a session; the editor never mutates
      // these originals, it only writes crops into public/images/blog/covers.
      'cache-control': 'private, max-age=3600',
    },
  });
}
