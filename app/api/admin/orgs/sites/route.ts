import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminWrite } from '@/lib/admin-access';
import { createSite, deleteSite, getSitesForOrg, updateSite, type SiteInput } from '@/lib/sites';
import { isKnownCountry } from '@/data/onboarding-options';

export const dynamic = 'force-dynamic';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** List an org's sites (usines) for the org drawer. */
export async function GET(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const orgId = new URL(request.url).searchParams.get('orgId') ?? '';
  if (!orgId) return NextResponse.json({ error: 'missing_org' }, { status: 400 });
  return NextResponse.json({ sites: await getSitesForOrg(orgId) });
}

function readFields(body: Record<string, unknown>): SiteInput | { error: string } {
  const name = clip(body.name, 160);
  if (!name) return { error: 'missing_name' };
  const country = clip(body.country, 80);
  if (country && !isKnownCountry(country)) return { error: 'bad_country' };
  return {
    name,
    country: country || null,
    city: clip(body.city, 120) || null,
    address: clip(body.address, 300) || null,
    postalCode: clip(body.postalCode, 40) || null,
    anydeskId: clip(body.anydeskId, 40) || null,
    notes: clip(body.notes, 1000) || null,
  };
}

/** Create a site under an org. */
export async function POST(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const orgId = typeof body.orgId === 'string' ? body.orgId : '';
  if (!orgId) return NextResponse.json({ error: 'missing_org' }, { status: 400 });
  const fields = readFields(body);
  if ('error' in fields) return NextResponse.json({ error: fields.error }, { status: 400 });

  const created = await createSite(orgId, fields);
  return created
    ? NextResponse.json({ ok: true, id: created.id })
    : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Update a site. */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  const fields = readFields(body);
  if ('error' in fields) return NextResponse.json({ error: fields.error }, { status: 400 });

  const ok = await updateSite(id, {
    name: fields.name,
    country: fields.country ?? null,
    city: fields.city ?? null,
    address: fields.address ?? null,
    postal_code: fields.postalCode ?? null,
    anydesk_id: fields.anydeskId ?? null,
    notes: fields.notes ?? null,
  });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Remove a site (its systems fall back to site_id = null). */
export async function DELETE(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  const ok = await deleteSite(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
