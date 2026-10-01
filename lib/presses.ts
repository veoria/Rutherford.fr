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
  created_at: string;
};

const SELECT =
  'id, site_id, name, manufacturer, model, sheet_format, colors, coater, perfecting, production_profile, console, year, notes, created_at';

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
    createdAt: r.created_at,
  };
}

/** All presses of one org, oldest first (the order they were declared). */
export async function getPressesForOrg(orgId: string): Promise<PressRecord[]> {
  const supabase = admin();
  if (!supabase || !orgId) return [];
  try {
    const { data } = await supabase.from('presses').select(SELECT).eq('org_id', orgId).order('created_at');
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
    const rows = Array.from({ length: n }, (_, i) => ({
      ...base,
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
