import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getWorkshopAccess } from '@/lib/presses';
import { createSite, deleteSite, getSitesForOrg, updateSite } from '@/lib/sites';
import { isKnownCountry } from '@/data/onboarding-options';

export const dynamic = 'force-dynamic';

// "Mon atelier" — a client org's owners/admins manage their own sites (plants):
// location and the plant's AnyDesk support number. Internal notes stay with
// the Rutherford team (admin org page).

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function access() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) } as const;
  const acc = await getWorkshopAccess(user.id);
  if (!acc || acc.orgType !== 'client' || !acc.canManageSites) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) } as const;
  }
  return { acc } as const;
}

function readFields(body: Record<string, unknown>) {
  const name = clip(body.name, 160);
  if (!name) return { error: 'missing_name' } as const;
  const country = clip(body.country, 80);
  if (country && !isKnownCountry(country)) return { error: 'bad_country' } as const;
  return {
    name,
    country: country || null,
    city: clip(body.city, 120) || null,
    address: clip(body.address, 300) || null,
    postalCode: clip(body.postalCode, 40) || null,
    anydeskId: clip(body.anydeskId, 40) || null,
  };
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function ownsSite(orgId: string, id: string) {
  return (await getSitesForOrg(orgId)).some((s) => s.id === id);
}

/** Create a site in the caller's org. */
export async function POST(request: NextRequest) {
  const a = await access();
  if ('error' in a) return a.error;
  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: 'bad_body' }, { status: 400 });
  const fields = readFields(body);
  if ('error' in fields) return NextResponse.json({ error: fields.error }, { status: 400 });
  const created = await createSite(a.acc.orgId, fields);
  return created ? NextResponse.json({ id: created.id }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Update a site (?id=) of the caller's org. */
export async function PATCH(request: NextRequest) {
  const a = await access();
  if ('error' in a) return a.error;
  const id = new URL(request.url).searchParams.get('id') ?? '';
  const body = await readBody(request);
  if (!id || !body) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (!(await ownsSite(a.acc.orgId, id))) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const fields = readFields(body);
  if ('error' in fields) return NextResponse.json({ error: fields.error }, { status: 400 });
  const ok = await updateSite(id, {
    name: fields.name,
    country: fields.country,
    city: fields.city,
    address: fields.address,
    postal_code: fields.postalCode,
    anydesk_id: fields.anydeskId,
  });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Delete a site (?id=). Its presses and systems stay, unplaced (FK set null). */
export async function DELETE(request: NextRequest) {
  const a = await access();
  if ('error' in a) return a.error;
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (!(await ownsSite(a.acc.orgId, id))) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const ok = await deleteSite(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
