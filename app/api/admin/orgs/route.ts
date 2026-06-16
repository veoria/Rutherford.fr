import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminWrite } from '@/lib/admin-access';
import { createOrg, updateOrg } from '@/lib/organizations';
import { isAccountType } from '@/data/account-types';
import { isKnownCountry } from '@/data/onboarding-options';

export const dynamic = 'force-dynamic';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const orgRef = (v: unknown) => (typeof v === 'string' && v ? v : null);

/** Create an organization (client / reseller / distributor / team). */
export async function POST(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  }

  const name = clip(body.name, 200);
  if (!name) return NextResponse.json({ error: 'missing_name' }, { status: 400 });
  const type = typeof body.type === 'string' && isAccountType(body.type) ? body.type : 'client';
  const country = clip(body.country, 80);
  if (country && !isKnownCountry(country)) return NextResponse.json({ error: 'bad_country' }, { status: 400 });

  const created = await createOrg({
    name,
    type,
    country: country || null,
    address: clip(body.address, 300) || null,
    postalCode: clip(body.postal_code, 40) || null,
    city: clip(body.city, 120) || null,
    resellerOrgId: orgRef(body.reseller_org_id),
    distributorOrgId: orgRef(body.distributor_org_id),
  });
  return created
    ? NextResponse.json({ ok: true, id: created.id })
    : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Update an organization's fields (incl. reseller/distributor attribution). */
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

  const patch: Record<string, unknown> = {};
  if (typeof body.name === 'string') {
    const n = body.name.trim().slice(0, 200);
    if (!n) return NextResponse.json({ error: 'missing_name' }, { status: 400 });
    patch.name = n;
  }
  if (typeof body.type === 'string') {
    if (!isAccountType(body.type)) return NextResponse.json({ error: 'bad_type' }, { status: 400 });
    patch.type = body.type;
  }
  if (typeof body.country === 'string') {
    const c = body.country.trim();
    if (c && !isKnownCountry(c)) return NextResponse.json({ error: 'bad_country' }, { status: 400 });
    patch.country = c || null;
  }
  if (typeof body.address === 'string') patch.address = body.address.trim().slice(0, 300) || null;
  if (typeof body.postal_code === 'string') patch.postal_code = body.postal_code.trim().slice(0, 40) || null;
  if (typeof body.city === 'string') patch.city = body.city.trim().slice(0, 120) || null;
  if ('reseller_org_id' in body) {
    const v = orgRef(body.reseller_org_id);
    if (v === id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
    patch.reseller_org_id = v;
  }
  if ('distributor_org_id' in body) {
    const v = orgRef(body.distributor_org_id);
    if (v === id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
    patch.distributor_org_id = v;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }
  const ok = await updateOrg(id, patch);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
