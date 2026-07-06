import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminWrite } from '@/lib/admin-access';
import {
  createSystem,
  deleteSystem,
  getSystemsForOrg,
  isLicenseStatus,
  updateSystem,
  type ClientSystemInput,
} from '@/lib/client-systems';

export const dynamic = 'force-dynamic';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
// A permissive ISO date check — the column is a Postgres `date`.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** List an org's systems (license, AnyDesk, versions) for the org drawer. */
export async function GET(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const orgId = new URL(request.url).searchParams.get('orgId') ?? '';
  if (!orgId) return NextResponse.json({ error: 'missing_org' }, { status: 400 });
  return NextResponse.json({ systems: await getSystemsForOrg(orgId) });
}

function readFields(body: Record<string, unknown>): ClientSystemInput | { error: string } {
  const product = clip(body.product, 120);
  if (!product) return { error: 'missing_product' };
  const licenseStatus = typeof body.licenseStatus === 'string' ? body.licenseStatus : 'active';
  if (!isLicenseStatus(licenseStatus)) return { error: 'bad_status' };
  const expires = clip(body.licenseExpiresAt, 10);
  if (expires && !DATE_RE.test(expires)) return { error: 'bad_date' };
  return {
    product,
    siteId: clip(body.siteId, 40) || null,
    machine: clip(body.machine, 160) || null,
    licenseKey: clip(body.licenseKey, 160) || null,
    licenseStatus,
    licenseExpiresAt: expires || null,
    anydeskId: clip(body.anydeskId, 40) || null,
    installedVersion: clip(body.installedVersion, 60) || null,
    latestVersion: clip(body.latestVersion, 60) || null,
    notes: clip(body.notes, 1000) || null,
  };
}

/** Add a system to an org. */
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

  const created = await createSystem(orgId, fields);
  return created
    ? NextResponse.json({ ok: true, id: created.id })
    : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Update a system. */
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

  const ok = await updateSystem(id, {
    site_id: fields.siteId ?? null,
    product: fields.product,
    machine: fields.machine,
    license_key: fields.licenseKey,
    license_status: fields.licenseStatus,
    license_expires_at: fields.licenseExpiresAt,
    anydesk_id: fields.anydeskId,
    installed_version: fields.installedVersion,
    latest_version: fields.latestVersion,
    notes: fields.notes,
  });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}

/** Remove a system. */
export async function DELETE(request: NextRequest) {
  const gate = await requireAdminWrite();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  const ok = await deleteSystem(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'failed' }, { status: 500 });
}
