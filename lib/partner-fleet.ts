// Partner fleet ("Parc clients") — SERVER-ONLY.
//
// What a reseller (or the distributor) sees of its clients' pressrooms. Rules
// (brief § 2.6, decided 01/10/2026):
//   - Client orgs in scope: those attributed to the partner
//     (organizations.reseller_org_id / distributor_org_id = partner org), plus
//     any org where the partner sold a system (client_systems.sold_by_org_id).
//   - Systems/devices are visible only when the partner sold them.
//   - A declared press (Mon atelier) is visible when the partner equipped it,
//     or — for attributed clients only — when nothing is installed on it yet
//     (an opportunity). A press equipped through another channel is hidden.
// Read-only: the client keeps its pressroom up to date.

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { hasUpdateAvailable } from '@/lib/client-systems';
import { isSheetFormat, isSystemKind, type SheetFormat, type SystemKind } from '@/data/press-config';

export type FleetEquipment = {
  id: string;
  kind: SystemKind;
  product: string;
  serialNumber: string | null;
  licenseStatus: string;
  licenseExpiresAt: string | null;
  installedVersion: string | null;
  latestVersion: string | null;
  updateAvailable: boolean;
};

export type FleetPress = {
  id: string;
  title: string;
  machine: string;
  sheetFormat: SheetFormat;
  colors: number;
  coater: boolean;
  perfecting: boolean;
  siteName: string | null;
  status: 'equipped' | 'opportunity';
  equipment: FleetEquipment[];
};

export type FleetClient = {
  orgId: string;
  name: string;
  country: string | null;
  attributed: boolean;
  presses: FleetPress[];
  /** Systems the partner sold that aren't linked to a declared press yet. */
  unplaced: FleetEquipment[];
};

export type PartnerFleet = {
  clients: FleetClient[];
  totals: { clients: number; equipped: number; opportunities: number; updates: number; expiringSoon: number };
};

const EMPTY: PartnerFleet = { clients: [], totals: { clients: 0, equipped: 0, opportunities: 0, updates: 0, expiringSoon: 0 } };

type SysRow = {
  id: string;
  org_id: string;
  press_id: string | null;
  kind: string;
  product: string;
  serial_number: string | null;
  license_status: string;
  license_expires_at: string | null;
  installed_version: string | null;
  latest_version: string | null;
  sold_by_org_id: string | null;
};

type PressRow = {
  id: string;
  org_id: string;
  site_id: string | null;
  name: string | null;
  manufacturer: string;
  model: string | null;
  sheet_format: string;
  colors: number;
  coater: boolean;
  perfecting: boolean;
};

function toEquipment(s: SysRow): FleetEquipment {
  return {
    id: s.id,
    kind: isSystemKind(s.kind) ? s.kind : 'software',
    product: s.product,
    serialNumber: s.serial_number,
    licenseStatus: s.license_status,
    licenseExpiresAt: s.license_expires_at,
    installedVersion: s.installed_version,
    latestVersion: s.latest_version,
    updateAvailable: hasUpdateAvailable({ installedVersion: s.installed_version, latestVersion: s.latest_version }),
  };
}

export async function getPartnerFleet(userId: string): Promise<PartnerFleet> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return EMPTY;
  const db = createSupabaseAdminClient();
  try {
    const { data: prof } = await db.from('profiles').select('organization_id').eq('id', userId).maybeSingle();
    const myOrg = (prof?.organization_id as string | null) ?? null;
    if (!myOrg) return EMPTY;
    const { data: me } = await db.from('organizations').select('type').eq('id', myOrg).maybeSingle();
    const myType = (me as { type?: string } | null)?.type;
    if (myType !== 'reseller' && myType !== 'distributor') return EMPTY;
    const attribColumn = myType === 'reseller' ? 'reseller_org_id' : 'distributor_org_id';

    const [{ data: attributedRows }, { data: soldRows }] = await Promise.all([
      db.from('organizations').select('id').eq(attribColumn, myOrg).eq('type', 'client'),
      db.from('client_systems').select('org_id').eq('sold_by_org_id', myOrg),
    ]);
    const attributed = new Set(((attributedRows ?? []) as { id: string }[]).map((r) => r.id));
    const orgIds = [...new Set([...attributed, ...((soldRows ?? []) as { org_id: string }[]).map((r) => r.org_id)])];
    if (!orgIds.length) return EMPTY;

    const [{ data: orgs }, { data: presses }, { data: systems }, { data: sites }] = await Promise.all([
      db.from('organizations').select('id, name, country').in('id', orgIds).order('name'),
      db
        .from('presses')
        .select('id, org_id, site_id, name, manufacturer, model, sheet_format, colors, coater, perfecting')
        .in('org_id', orgIds)
        .order('position')
        .order('created_at'),
      db
        .from('client_systems')
        .select(
          'id, org_id, press_id, kind, product, serial_number, license_status, license_expires_at, installed_version, latest_version, sold_by_org_id'
        )
        .in('org_id', orgIds),
      db.from('sites').select('id, name').in('org_id', orgIds),
    ]);

    const siteName = new Map(((sites ?? []) as { id: string; name: string }[]).map((s) => [s.id, s.name] as const));
    const sysRows = (systems ?? []) as SysRow[];
    const sysByPress = new Map<string, SysRow[]>();
    for (const s of sysRows) {
      if (!s.press_id) continue;
      sysByPress.set(s.press_id, [...(sysByPress.get(s.press_id) ?? []), s]);
    }

    const now = Date.now();
    const soon = now + 90 * 86_400_000;
    const totals = { clients: 0, equipped: 0, opportunities: 0, updates: 0, expiringSoon: 0 };
    const countEquipment = (list: FleetEquipment[]) => {
      for (const e of list) {
        if (e.updateAvailable) totals.updates += 1;
        const t = e.licenseExpiresAt ? new Date(e.licenseExpiresAt).getTime() : NaN;
        if (!Number.isNaN(t) && t >= now && t <= soon) totals.expiringSoon += 1;
      }
    };

    const clients: FleetClient[] = [];
    for (const o of (orgs ?? []) as { id: string; name: string; country: string | null }[]) {
      const isAttributed = attributed.has(o.id);
      const fleetPresses: FleetPress[] = [];
      for (const p of ((presses ?? []) as PressRow[]).filter((x) => x.org_id === o.id)) {
        const onPress = sysByPress.get(p.id) ?? [];
        const mine = onPress.filter((s) => s.sold_by_org_id === myOrg);
        let status: FleetPress['status'];
        if (mine.length) status = 'equipped';
        else if (!onPress.length && isAttributed) status = 'opportunity';
        else continue; // equipped through another channel, or not my client
        const equipment = mine.map(toEquipment);
        countEquipment(equipment);
        if (status === 'equipped') totals.equipped += 1;
        else totals.opportunities += 1;
        fleetPresses.push({
          id: p.id,
          title: (p.name ?? '').trim() || [p.manufacturer, p.model].filter(Boolean).join(' '),
          machine: [p.manufacturer, p.model].filter(Boolean).join(' '),
          sheetFormat: isSheetFormat(p.sheet_format) ? p.sheet_format : 'b1',
          colors: p.colors,
          coater: p.coater,
          perfecting: p.perfecting,
          siteName: p.site_id ? siteName.get(p.site_id) ?? null : null,
          status,
          equipment,
        });
      }
      const unplaced = sysRows
        .filter((s) => s.org_id === o.id && !s.press_id && s.sold_by_org_id === myOrg)
        .map(toEquipment);
      countEquipment(unplaced);
      if (!fleetPresses.length && !unplaced.length && !isAttributed) continue;
      clients.push({ orgId: o.id, name: o.name, country: o.country, attributed: isAttributed, presses: fleetPresses, unplaced });
    }
    totals.clients = clients.length;
    return { clients, totals };
  } catch {
    return EMPTY;
  }
}
