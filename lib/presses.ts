// Presses ("Mon atelier") — SERVER-ONLY.
//
// The client's own press inventory, placed on the org's sites. Reads and writes
// use the service-role client; the API layer resolves the caller's membership
// first (getWorkshopAccess) and only ever touches rows of that org.
// Dormant-safe: returns empty/no-op when Supabase isn't configured.

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import {
  MAX_COLORS,
  MIN_COLORS,
  isProductionProfile,
  isSheetFormat,
  type ProductionProfile,
  type SheetFormat,
} from '@/data/press-config';
import type { MemberRole } from '@/lib/organizations';
import { pressTitle, SYSTEM_KIND_LABELS, isSystemKind } from '@/data/press-config';

export type PressRecord = {
  id: string;
  siteId: string | null;
  name: string | null;
  manufacturer: string;
  model: string | null;
  sheetFormat: SheetFormat;
  colors: number;
  coater: boolean;
  perfecting: boolean;
  productionProfile: ProductionProfile | null;
  console: string | null;
  year: number | null;
  notes: string | null;
  anydeskId: string | null;
  createdAt: string;
};

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

/** The caller's org + role, for workshop reads/writes. Null when not a member. */
export type WorkshopAccess = { orgId: string; role: MemberRole; orgType: string | null; canManageSites: boolean };

export async function getWorkshopAccess(userId: string): Promise<WorkshopAccess | null> {
  const supabase = admin();
  if (!supabase || !userId) return null;
  try {
    const { data: prof } = await supabase.from('profiles').select('organization_id').eq('id', userId).maybeSingle();
    const orgId = (prof?.organization_id as string | null) ?? null;
    if (!orgId) return null;
    const [{ data: member }, { data: org }] = await Promise.all([
      supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', orgId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle(),
      supabase.from('organizations').select('type').eq('id', orgId).maybeSingle(),
    ]);
    const role = (member?.role as MemberRole | undefined) ?? null;
    if (!role) return null;
    return {
      orgId,
      role,
      orgType: (org?.type as string | null) ?? null,
      canManageSites: role === 'owner' || role === 'admin',
    };
  } catch {
    return null;
  }
}

type Row = {
  id: string;
  site_id: string | null;
  name: string | null;
  manufacturer: string;
  model: string | null;
  sheet_format: string;
  colors: number;
  coater: boolean;
  perfecting: boolean;
  production_profile: string | null;
  console: string | null;
  year: number | null;
  notes: string | null;
  anydesk_id: string | null;
  created_at: string;
};

const SELECT =
  'id, site_id, name, manufacturer, model, sheet_format, colors, coater, perfecting, production_profile, console, year, notes, anydesk_id, created_at';

function toRecord(r: Row): PressRecord {
  return {
    id: r.id,
    siteId: r.site_id,
    name: r.name,
    manufacturer: r.manufacturer,
    model: r.model,
    sheetFormat: isSheetFormat(r.sheet_format) ? r.sheet_format : 'b1',
    colors: r.colors,
    coater: r.coater,
    perfecting: r.perfecting,
    productionProfile: isProductionProfile(r.production_profile) ? r.production_profile : null,
    console: r.console,
    year: r.year,
    notes: r.notes,
    anydeskId: r.anydesk_id ?? null,
    createdAt: r.created_at,
  };
}

/** All presses of one org, in the order the client arranged them. */
export async function getPressesForOrg(orgId: string): Promise<PressRecord[]> {
  const supabase = admin();
  if (!supabase || !orgId) return [];
  try {
    const { data } = await supabase
      .from('presses')
      .select(SELECT)
      .eq('org_id', orgId)
      .order('position')
      .order('created_at');
    return ((data ?? []) as Row[]).map(toRecord);
  } catch {
    return [];
  }
}

// ── Input validation (shared by create + update) ──

export type PressInput = {
  siteId: string | null;
  name: string | null;
  manufacturer: string;
  model: string | null;
  sheetFormat: SheetFormat;
  colors: number;
  coater: boolean;
  perfecting: boolean;
  productionProfile: ProductionProfile | null;
  console: string | null;
  year: number | null;
  notes: string | null;
  anydeskId: string | null;
};

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};

/** Parse an API body into a press input, or return the first invalid field. */
export function parsePressInput(body: Record<string, unknown>): { ok: true; input: PressInput } | { ok: false; field: string } {
  const manufacturer = text(body.manufacturer, 80);
  if (!manufacturer) return { ok: false, field: 'manufacturer' };
  if (!isSheetFormat(body.sheetFormat)) return { ok: false, field: 'sheetFormat' };
  const colors = Number(body.colors);
  if (!Number.isInteger(colors) || colors < MIN_COLORS || colors > MAX_COLORS) return { ok: false, field: 'colors' };
  const profile = body.productionProfile == null || body.productionProfile === '' ? null : body.productionProfile;
  if (profile !== null && !isProductionProfile(profile)) return { ok: false, field: 'productionProfile' };
  let year: number | null = null;
  if (body.year != null && body.year !== '') {
    year = Number(body.year);
    if (!Number.isInteger(year) || year < 1950 || year > 2100) return { ok: false, field: 'year' };
  }
  return {
    ok: true,
    input: {
      siteId: text(body.siteId, 64),
      name: text(body.name, 80),
      manufacturer,
      model: text(body.model, 120),
      sheetFormat: body.sheetFormat,
      colors,
      coater: body.coater === true,
      perfecting: body.perfecting === true,
      productionProfile: profile as ProductionProfile | null,
      console: text(body.console, 120),
      year,
      notes: text(body.notes, 1000),
      anydeskId: text(body.anydeskId, 40),
    },
  };
}

function toRow(input: PressInput) {
  return {
    site_id: input.siteId,
    name: input.name,
    manufacturer: input.manufacturer,
    model: input.model,
    sheet_format: input.sheetFormat,
    colors: input.colors,
    coater: input.coater,
    perfecting: input.perfecting,
    production_profile: input.productionProfile,
    console: input.console,
    year: input.year,
    notes: input.notes,
    anydesk_id: input.anydeskId,
  };
}

/** A site id is only accepted when it belongs to the org (else: unplaced). */
async function siteInOrg(orgId: string, siteId: string | null): Promise<string | null> {
  if (!siteId) return null;
  const supabase = admin();
  if (!supabase) return null;
  const { data } = await supabase.from('sites').select('id').eq('id', siteId).eq('org_id', orgId).maybeSingle();
  return data ? siteId : null;
}

/** Create `quantity` identical presses (a pressroom often runs twins). */
export async function createPresses(
  orgId: string,
  userId: string,
  input: PressInput,
  quantity = 1
): Promise<PressRecord[] | null> {
  const supabase = admin();
  if (!supabase || !orgId) return null;
  const n = Math.max(1, Math.min(20, Math.floor(quantity)));
  try {
    const siteId = await siteInOrg(orgId, input.siteId);
    const base = { ...toRow({ ...input, siteId }), org_id: orgId, created_by: userId };
    // New presses go last in the client's arrangement.
    const { data: last } = await supabase
      .from('presses')
      .select('position')
      .eq('org_id', orgId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    const start = ((last?.position as number | undefined) ?? 0) + 1;
    const rows = Array.from({ length: n }, (_, i) => ({
      ...base,
      position: start + i,
      // Twins get a numbered label so they stay distinguishable in the list.
      name: n > 1 ? `${input.name ?? [input.manufacturer, input.model].filter(Boolean).join(' ')} #${i + 1}`.slice(0, 80) : base.name,
    }));
    const { data, error } = await supabase.from('presses').insert(rows).select(SELECT);
    if (error || !data) return null;
    return (data as Row[]).map(toRecord);
  } catch {
    return null;
  }
}

/** Update one press of the org. */
export async function updatePress(orgId: string, id: string, input: PressInput): Promise<PressRecord | null> {
  const supabase = admin();
  if (!supabase || !orgId || !id) return null;
  try {
    const siteId = await siteInOrg(orgId, input.siteId);
    const { data, error } = await supabase
      .from('presses')
      .update({ ...toRow({ ...input, siteId }), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(SELECT)
      .maybeSingle();
    if (error || !data) return null;
    return toRecord(data as Row);
  } catch {
    return null;
  }
}

/** Delete one press of the org. */
export async function deletePress(orgId: string, id: string): Promise<boolean> {
  const supabase = admin();
  if (!supabase || !orgId || !id) return false;
  try {
    const { error, count } = await supabase
      .from('presses')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('org_id', orgId);
    return !error && (count ?? 0) > 0;
  } catch {
    return false;
  }
}

/** One press of the org (null when it doesn't exist or belongs elsewhere). */
export async function getPressForOrg(orgId: string, id: string): Promise<PressRecord | null> {
  const supabase = admin();
  if (!supabase || !orgId || !id) return null;
  try {
    const { data } = await supabase.from('presses').select(SELECT).eq('id', id).eq('org_id', orgId).maybeSingle();
    return data ? toRecord(data as Row) : null;
  } catch {
    return null;
  }
}

export type PressTicket = {
  id: string;
  reference: string;
  subject: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  /** True when the signed-in user filed it (their /account/support shows it). */
  mine: boolean;
};

/** Support history of one press — every ticket filed on it by the org's members. */
export async function getPressSupportHistory(pressId: string, viewerId: string): Promise<PressTicket[]> {
  const supabase = admin();
  if (!supabase || !pressId) return [];
  try {
    const { data } = await supabase
      .from('support_tickets')
      .select('id, subject, status, created_at, updated_at, user_id')
      .eq('press_id', pressId)
      .order('created_at', { ascending: false });
    return (
      (data ?? []) as {
        id: string;
        subject: string | null;
        status: string;
        created_at: string;
        updated_at: string;
        user_id: string | null;
      }[]
    ).map((t) => ({
      id: t.id,
      reference: t.id.slice(0, 8),
      subject: t.subject,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      mine: t.user_id === viewerId,
    }));
  } catch {
    return [];
  }
}

/** Names of the reseller / distributor attributed to a client org — they see
 *  its declared presses in their « Parc clients » (lib/partner-fleet.ts). */
export async function getAttributedPartnerNames(orgId: string): Promise<string[]> {
  const supabase = admin();
  if (!supabase || !orgId) return [];
  try {
    const { data: org } = await supabase
      .from('organizations')
      .select('reseller_org_id, distributor_org_id')
      .eq('id', orgId)
      .maybeSingle();
    const ids = [org?.reseller_org_id, org?.distributor_org_id].filter((v): v is string => typeof v === 'string');
    if (!ids.length) return [];
    const { data } = await supabase.from('organizations').select('name').in('id', ids);
    return ((data ?? []) as { name: string }[]).map((o) => o.name);
  } catch {
    return [];
  }
}

/**
 * Save the client's arrangement: `ids` is the full press order of the org (ids
 * of other orgs are ignored). Presses missing from the list keep their place
 * after the listed ones.
 */
export async function reorderPresses(orgId: string, ids: string[]): Promise<boolean> {
  const supabase = admin();
  if (!supabase || !orgId) return false;
  try {
    const { data } = await supabase.from('presses').select('id').eq('org_id', orgId).order('position').order('created_at');
    const current = ((data ?? []) as { id: string }[]).map((r) => r.id);
    const known = new Set(current);
    const wanted = [...new Set(ids.filter((id) => known.has(id)))];
    const listed = new Set(wanted);
    const order = [...wanted, ...current.filter((id) => !listed.has(id))];
    const results = await Promise.all(
      order.map((id, i) => supabase.from('presses').update({ position: i + 1 }).eq('id', id).eq('org_id', orgId))
    );
    return results.every((r) => !r.error);
  } catch {
    return false;
  }
}

/** Everything the support form needs about one press, so nothing is retyped. */
export type PressSupportContext = {
  pressId: string;
  title: string;
  machine: string;
  config: string;
  siteName: string | null;
  company: string | null;
  anydesk: string | null;
  equipment: string[];
  /** French lines appended to the Asana task (team-facing). */
  teamLines: string[];
};

const FORMAT_FR: Record<string, string> = { b3: 'B3', b2: 'B2', b1: 'B1', vlf: 'Grand format' };

/** Support context of a press of the user's org (null if not theirs). */
export async function getPressSupportContext(userId: string, pressId: string): Promise<PressSupportContext | null> {
  const supabase = admin();
  if (!supabase || !userId || !pressId) return null;
  const access = await getWorkshopAccess(userId);
  if (!access) return null;
  const press = await getPressForOrg(access.orgId, pressId);
  if (!press) return null;
  try {
    const [{ data: site }, { data: org }, { data: systems }] = await Promise.all([
      press.siteId
        ? supabase.from('sites').select('name, city, country, anydesk_id').eq('id', press.siteId).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('organizations').select('name').eq('id', access.orgId).maybeSingle(),
      supabase
        .from('client_systems')
        .select('kind, product, serial_number, installed_version, latest_version, license_status, anydesk_id')
        .eq('press_id', press.id),
    ]);
    const s = site as { name: string; city: string | null; country: string | null; anydesk_id: string | null } | null;
    const sys = (systems ?? []) as {
      kind: string;
      product: string;
      serial_number: string | null;
      installed_version: string | null;
      latest_version: string | null;
      license_status: string;
      anydesk_id: string | null;
    }[];
    const machine = [press.manufacturer, press.model].filter(Boolean).join(' ');
    const config = [
      FORMAT_FR[press.sheetFormat] ?? press.sheetFormat,
      `${press.colors} couleurs`,
      press.coater ? 'vernis' : null,
      press.perfecting ? 'retiration' : null,
    ]
      .filter(Boolean)
      .join(' · ');
    const anydesk = press.anydeskId || s?.anydesk_id || sys.find((x) => x.anydesk_id)?.anydesk_id || null;
    const equipment = sys.map((x) =>
      [
        x.product,
        x.installed_version ? `v${x.installed_version.replace(/^v/i, '')}` : null,
        x.serial_number ? `S/N ${x.serial_number}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    );
    const siteLine = s ? [s.name, s.city, s.country].filter(Boolean).join(', ') : null;
    const teamLines = [
      `Presse : ${pressTitle(press)}${pressTitle(press) !== machine ? ` (${machine})` : ''}`,
      `Configuration : ${config}`,
      siteLine ? `Site : ${siteLine}` : null,
      press.console ? `Console : ${press.console}` : null,
      press.year ? `Année : ${press.year}` : null,
      anydesk ? `AnyDesk presse : ${anydesk}` : null,
      ...sys.map((x) => {
        const kind = isSystemKind(x.kind) ? SYSTEM_KIND_LABELS.fr[x.kind] : x.kind;
        const version = x.installed_version
          ? ` · version ${x.installed_version}${x.latest_version && x.latest_version !== x.installed_version ? ` (dernière ${x.latest_version})` : ''}`
          : '';
        return `${kind} : ${x.product}${version}${x.serial_number ? ` · S/N ${x.serial_number}` : ''}${x.kind === 'software' ? ` · licence ${x.license_status}` : ''}`;
      }),
      !sys.length ? 'Équipement Rutherford : aucun' : null,
    ].filter((l): l is string => Boolean(l));
    return {
      pressId: press.id,
      title: pressTitle(press),
      machine,
      config,
      siteName: s?.name ?? null,
      company: ((org as { name?: string } | null)?.name ?? null) || null,
      anydesk,
      equipment,
      teamLines,
    };
  } catch {
    return null;
  }
}
