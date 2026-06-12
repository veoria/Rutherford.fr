import { NextResponse, type NextRequest } from 'next/server';
import { countryNameFromCode } from '@/lib/countries';

// Lightweight geo lookup for the console-validation form: it reads Vercel's
// edge IP-country header and returns a matching country name so the form can
// pre-select the visitor's country. Falls back to null when the header is
// absent (local dev, non-Vercel hosting) — the form just leaves the field empty.
export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const code =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    '';
  return NextResponse.json(
    { country: countryNameFromCode(code) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
