// PipeDrive lead sync — SERVER-ONLY.
//
// Dormant until configured: if PIPEDRIVE_API_TOKEN is unset, every call is a
// no-op, so this is safe to ship before the token exists. On the first
// onboarding completion we create/find the Person (by email) + Organization
// (by company) and attach a Note with the lead context.
//
// Env:
//   PIPEDRIVE_API_TOKEN   (required to activate)
//   PIPEDRIVE_DOMAIN      (optional, e.g. "veoria" → https://veoria.pipedrive.com/api/v1)
//   PIPEDRIVE_BASE_URL    (optional, overrides the base entirely)

const TOKEN = process.env.PIPEDRIVE_API_TOKEN;
const BASE =
  process.env.PIPEDRIVE_BASE_URL ||
  (process.env.PIPEDRIVE_DOMAIN
    ? `https://${process.env.PIPEDRIVE_DOMAIN}.pipedrive.com/api/v1`
    : 'https://api.pipedrive.com/v1');

const TIMEOUT_MS = 8000;

export type Lead = {
  email: string;
  name: string | null;
  company: string;
  country: string;
  jobTitle: string;
  /** Where the lead came from — used as the Note header. Defaults to "Rutherford Academy". */
  source?: string;
};

export function pipedriveEnabled(): boolean {
  return Boolean(TOKEN);
}

async function pd(path: string, init?: RequestInit): Promise<any> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}api_token=${TOKEN}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PipeDrive ${init?.method ?? 'GET'} ${path} → ${res.status}`);
  return res.json();
}

// Pipedrive API v2 — used for deals, because the Zapier "Create/Update Deal"
// actions the team relies on are deprecating (July 31 2026). Same token, same
// host, /api/v2 prefix.
const HOST = process.env.PIPEDRIVE_DOMAIN
  ? `https://${process.env.PIPEDRIVE_DOMAIN}.pipedrive.com`
  : 'https://api.pipedrive.com';

/** Deal UI URL for the admin back-office — null when no company domain is set
 * (the generic api.pipedrive.com host isn't a usable UI link). */
export function pipedriveDealUrl(id: number | null): string | null {
  if (!id || !process.env.PIPEDRIVE_DOMAIN) return null;
  return `https://${process.env.PIPEDRIVE_DOMAIN}.pipedrive.com/deal/${id}`;
}

const PIPELINE_ID = process.env.PIPEDRIVE_PIPELINE_ID ? Number(process.env.PIPEDRIVE_PIPELINE_ID) : undefined;
const STAGE_ID = process.env.PIPEDRIVE_STAGE_ID ? Number(process.env.PIPEDRIVE_STAGE_ID) : undefined;
const OWNER_ID = process.env.PIPEDRIVE_OWNER_ID ? Number(process.env.PIPEDRIVE_OWNER_ID) : undefined;

async function pdv2(path: string, init?: RequestInit): Promise<any> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${HOST}/api/v2${path}${sep}api_token=${TOKEN}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PipeDrive v2 ${init?.method ?? 'GET'} ${path} → ${res.status}`);
  return res.json();
}

export type ConsoleValidationDealInput = {
  company: string;
  country: string;
  machine: string;
};

/**
 * Create the console-validation Deal and stamp its own id into the title
 * (`Country - Company - Machine - ID{id}`). That id is the spine of the whole
 * workflow — the Asana task name and Dropbox folder reuse this title, and the
 * downstream notes/emails resolve the deal back from it. Returns null when not
 * configured or on failure, so the caller can carry on without an id.
 */
export async function createConsoleValidationDeal(
  input: ConsoleValidationDealInput
): Promise<{ id: number; title: string } | null> {
  if (!TOKEN) return null;
  try {
    const baseTitle = [input.country, input.company, input.machine]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' - ');

    const created = await pdv2('/deals', {
      method: 'POST',
      body: JSON.stringify({
        title: baseTitle || 'Console validation',
        ...(PIPELINE_ID ? { pipeline_id: PIPELINE_ID } : {}),
        ...(STAGE_ID ? { stage_id: STAGE_ID } : {}),
        ...(OWNER_ID ? { owner_id: OWNER_ID } : {}),
      }),
    });

    const id = created?.data?.id as number | undefined;
    if (!id) return null;

    const title = `${baseTitle} - ID${id}`;
    await pdv2(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }).catch(() => {});
    return { id, title };
  } catch (error) {
    console.error('PipeDrive deal create failed:', error);
    return null;
  }
}

/** Attach a Note to a deal. No-op without a token or deal id; never throws. */
export async function addDealNote(dealId: number | null, content: string): Promise<void> {
  if (!TOKEN || !dealId) return;
  try {
    await pd('/notes', { method: 'POST', body: JSON.stringify({ content, deal_id: dealId }) });
  } catch (error) {
    console.error('PipeDrive deal note failed:', error);
  }
}

async function findOrgId(name: string): Promise<number | null> {
  const r = await pd(
    `/organizations/search?term=${encodeURIComponent(name)}&fields=name&exact_match=true&limit=1`
  );
  const existing = r?.data?.items?.[0]?.item?.id;
  if (existing) return existing as number;
  const created = await pd('/organizations', { method: 'POST', body: JSON.stringify({ name }) });
  return (created?.data?.id as number) ?? null;
}

async function findPersonId(email: string): Promise<number | null> {
  const r = await pd(
    `/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&limit=1`
  );
  return (r?.data?.items?.[0]?.item?.id as number) ?? null;
}

/**
 * Create/find the lead in PipeDrive (Person + Organization + Note). Never
 * throws — a CRM hiccup must not break onboarding. No-op when not configured.
 */
export async function syncLeadToPipedrive(lead: Lead): Promise<void> {
  if (!TOKEN || !lead.email) return;
  try {
    const orgId = lead.company ? await findOrgId(lead.company) : null;

    let personId = await findPersonId(lead.email);
    if (!personId) {
      const created = await pd('/persons', {
        method: 'POST',
        body: JSON.stringify({
          name: lead.name || lead.email,
          email: [lead.email],
          ...(orgId ? { org_id: orgId } : {}),
        }),
      });
      personId = (created?.data?.id as number) ?? null;
    } else if (orgId) {
      // Best-effort: link the existing person to the org.
      await pd(`/persons/${personId}`, { method: 'PUT', body: JSON.stringify({ org_id: orgId }) }).catch(
        () => {}
      );
    }

    const lines = [
      `Lead ${lead.source ?? 'Rutherford Academy'}`,
      lead.company ? `Société : ${lead.company}` : null,
      lead.country ? `Pays : ${lead.country}` : null,
      lead.jobTitle ? `Poste : ${lead.jobTitle.replace(/_/g, ' ')}` : null,
    ].filter(Boolean);

    await pd('/notes', {
      method: 'POST',
      body: JSON.stringify({
        content: lines.join('<br>'),
        ...(personId ? { person_id: personId } : {}),
        ...(orgId ? { org_id: orgId } : {}),
      }),
    });
  } catch (error) {
    console.error('PipeDrive lead sync failed:', error);
  }
}

export type ConsoleValidationLead = {
  email: string;
  company: string;
  country: string;
  machine: string;
  notes: string;
  photoCount: number;
  storagePath: string;
  photosLink?: string | null;
};

/**
 * Console-validation request → PipeDrive (Person + Organization + Note).
 * Same dormant-safe contract as syncLeadToPipedrive: never throws, no-op
 * without a token.
 */
export async function syncConsoleValidationToPipedrive(lead: ConsoleValidationLead): Promise<void> {
  if (!TOKEN || !lead.email) return;
  try {
    const orgId = lead.company ? await findOrgId(lead.company) : null;

    let personId = await findPersonId(lead.email);
    if (!personId) {
      const created = await pd('/persons', {
        method: 'POST',
        body: JSON.stringify({
          name: lead.email,
          email: [lead.email],
          ...(orgId ? { org_id: orgId } : {}),
        }),
      });
      personId = (created?.data?.id as number) ?? null;
    } else if (orgId) {
      await pd(`/persons/${personId}`, { method: 'PUT', body: JSON.stringify({ org_id: orgId }) }).catch(
        () => {}
      );
    }

    const lines = [
      '<b>Demande de validation console</b>',
      lead.company ? `Société : ${lead.company}` : null,
      lead.country ? `Pays : ${lead.country}` : null,
      lead.machine ? `Machine : ${lead.machine}` : null,
      lead.notes ? `Notes : ${lead.notes}` : null,
      `Photos : ${lead.photoCount}${lead.photosLink ? ` — <a href="${lead.photosLink}">voir les photos</a>` : ` (${lead.storagePath})`}`,
    ].filter(Boolean);

    await pd('/notes', {
      method: 'POST',
      body: JSON.stringify({
        content: lines.join('<br>'),
        ...(personId ? { person_id: personId } : {}),
        ...(orgId ? { org_id: orgId } : {}),
      }),
    });
  } catch (error) {
    console.error('PipeDrive console-validation sync failed:', error);
  }
}

// Person "label" field options (id → name), cached for the process lifetime.
let _labelNames: Map<number, string> | null = null;
async function personLabelNames(): Promise<Map<number, string>> {
  if (_labelNames) return _labelNames;
  const map = new Map<number, string>();
  try {
    const res = await pd('/personFields');
    const fields = Array.isArray(res?.data) ? res.data : [];
    const labelField = fields.find((f: any) => f?.key === 'label');
    for (const opt of labelField?.options ?? []) {
      if (typeof opt?.id === 'number') map.set(opt.id, String(opt.label ?? ''));
    }
  } catch {
    /* leave empty → undecidable */
  }
  _labelNames = map;
  return map;
}

/**
 * Best-effort: read a person's CRM label by email and map it to an account
 * type. Returns 'reseller' | 'client' | null (null = not found / undecidable).
 * Never throws; no-op (null) when PipeDrive isn't configured.
 */
export async function getPersonLabelByEmail(
  email: string
): Promise<'reseller' | 'client' | null> {
  if (!TOKEN || !email) return null;
  try {
    const search = await pd(
      `/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&limit=1`
    );
    const person = search?.data?.items?.[0]?.item;
    if (!person?.id) return null;

    let labelIds: number[] = Array.isArray(person.label_ids) ? person.label_ids : [];
    if (!labelIds.length) {
      const full = await pd(`/persons/${person.id}`);
      const data = full?.data ?? {};
      if (Array.isArray(data.label_ids)) labelIds = data.label_ids;
      else if (typeof data.label === 'number') labelIds = [data.label];
    }
    if (!labelIds.length) return null;

    const names = await personLabelNames();
    const labels = labelIds.map((id) => (names.get(id) ?? '').toLowerCase());
    // Pipedrive only decides reseller vs client — the 'distributor' type is
    // reserved for X-Rite (matched by email domain). Reseller / OEM / Distributor
    // labels are all partner (reseller) relationships; Customer is a direct client.
    if (
      labels.some(
        (l) =>
          l.includes('reseller') ||
          l.includes('revendeur') ||
          l.includes('oem') ||
          l.includes('distributor') ||
          l.includes('distributeur')
      )
    )
      return 'reseller';
    if (labels.some((l) => l.includes('customer') || l.includes('client'))) return 'client';
    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Won deals → the Asana "Install" board (replaces the last remaining Zap).
//
// A won deal has to reach the Install board with the same description block the
// team has read for years, so everything below exists to rebuild that block from
// the deal. The awkward part is that the values live in Pipedrive *custom*
// fields, whose API keys are 40-char hashes with no meaning — so we resolve them
// by their human name at runtime (/dealFields) instead of hard-coding hashes
// that would silently rot the day someone renames a field.

/** Accent/case/punctuation-insensitive form, so "SO Number" matches "so_number". */
const normalizeFieldName = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

type DealField = { key: string; name: string; fieldType: string; options: Map<string, string> };

// Field definitions change about once a year — cache for the process lifetime.
let _dealFields: Map<string, DealField> | null = null;

async function dealFields(): Promise<Map<string, DealField>> {
  if (_dealFields) return _dealFields;
  const byName = new Map<string, DealField>();
  try {
    const res = await pd('/dealFields');
    for (const field of Array.isArray(res?.data) ? res.data : []) {
      if (!field?.key || !field?.name) continue;
      const options = new Map<string, string>();
      for (const option of field.options ?? []) {
        if (option?.id !== undefined) options.set(String(option.id), String(option.label ?? ''));
      }
      byName.set(normalizeFieldName(field.name), {
        key: field.key,
        name: field.name,
        fieldType: String(field.field_type ?? ''),
        options,
      });
    }
  } catch (error) {
    console.error('PipeDrive dealFields fetch failed:', error);
    return byName; // don't cache a failure — the next won deal retries
  }
  _dealFields = byName;
  return byName;
}

// Escape hatch: PIPEDRIVE_DEAL_FIELDS={"PO":"<40-char key>"} pins a label to a
// key when the Pipedrive field is named differently from what we expect.
const FIELD_OVERRIDES: Record<string, string> = (() => {
  try {
    const parsed = JSON.parse(process.env.PIPEDRIVE_DEAL_FIELDS || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    console.error('PIPEDRIVE_DEAL_FIELDS is not valid JSON — ignored');
    return {};
  }
})();

/** Render whatever a custom field holds: option ids → labels, sets → joined
 * labels, money/address objects → their scalar, everything else → text. */
function renderFieldValue(value: unknown, field: DealField | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) {
    return value.map((v) => renderFieldValue(v, field)).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const scalar = record.value ?? record.name ?? record.formatted_address ?? record.id;
    return scalar === undefined || scalar === null ? '' : String(scalar);
  }
  return field?.options.get(String(value)) ?? String(value);
}

/**
 * The description block of an Install task, in the order the team reads it.
 * Each entry is a label plus the Pipedrive field names that may carry it — the
 * first name that exists wins, and a label nobody matches simply stays blank
 * (the block already ships with blank placeholders the team fills in by hand).
 */
// Names taken from the Zap's own field mapping — the block's label and the
// Pipedrive field behind it rarely match ("PO" is fed by *Order number*, "SO" by
// *SO XRite*, "Delivery" by *To ship*). The alternatives after each are
// tolerated in case a field is renamed.
//
// Not listed, deliberately: Screen mount is a constant in the Zap ("Desk or
// Wall"), and Computer / AnyDesk / Tracking / RGP are blank placeholders the
// team fills in by hand. They're not Pipedrive fields at all.
const INSTALL_FIELDS: { label: string; names: string[] }[] = [
  { label: 'PO', names: ['order number', 'po', 'po number', 'purchase order'] },
  { label: 'SO', names: ['so xrite', 'so', 'so number', 'sales order'] },
  { label: 'Press interface', names: ['pupi', 'press interface', 'interface'] },
  { label: 'Press', names: ['press', 'press type'] },
  { label: 'Numbers of units', names: ['number of units', 'numbers of units', 'units'] },
  { label: 'Keys', names: ['number of keys', 'keys', 'nb keys'] },
];

const DELIVERY_NAMES = ['to ship', 'delivery', 'delivery date', 'date de livraison', 'livraison'];

const ALL_INSTALL_FIELDS = [...INSTALL_FIELDS, { label: 'Delivery', names: DELIVERY_NAMES }];

export type InstallFieldMapping = {
  configured: boolean;
  /** One row per line of the Install description block. */
  mapping: { label: string; matchedName: string | null; key: string | null; type: string | null; source: 'name' | 'override' | null; lookedFor: string[] }[];
  /** Labels no Pipedrive field satisfies — their line comes out blank. */
  unmatched: string[];
  /** Every deal field, so the exact spelling can be read off and pinned. */
  dealFields: { name: string; key: string; type: string }[];
};

/**
 * Which Pipedrive field ends up on which line of the Install block. This is a
 * read-only report for the back-office: field names are the one thing this
 * integration can't verify from a developer's machine, so it has to be
 * answerable from production in one request.
 */
export async function describeInstallFields(): Promise<InstallFieldMapping> {
  if (!TOKEN) return { configured: false, mapping: [], unmatched: [], dealFields: [] };
  const defs = await dealFields();
  const byKey = new Map([...defs.values()].map((f) => [f.key, f]));

  const mapping = ALL_INSTALL_FIELDS.map(({ label, names }) => {
    const overrideKey = FIELD_OVERRIDES[label];
    const field = overrideKey ? byKey.get(overrideKey) : names.map((n) => defs.get(normalizeFieldName(n))).find(Boolean);
    return {
      label,
      matchedName: field?.name ?? null,
      key: field?.key ?? overrideKey ?? null,
      type: field?.fieldType ?? null,
      source: (overrideKey ? 'override' : field ? 'name' : null) as 'name' | 'override' | null,
      lookedFor: names,
    };
  });

  return {
    configured: true,
    mapping,
    // Delivery falls back to the deal's expected close date, so a miss there
    // isn't a blank line — don't report it as one.
    unmatched: mapping.filter((m) => !m.key && m.label !== 'Delivery').map((m) => m.label),
    dealFields: [...defs.values()]
      .map((f) => ({ name: f.name, key: f.key, type: f.fieldType }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export type WonDeal = {
  id: number;
  title: string;
  ownerName: string | null;
  orgName: string | null;
  personName: string | null;
  /** YYYY-MM-DD — the Delivery field, or the deal's expected close date. */
  delivery: string | null;
  productNames: string[];
  productCodes: string[];
  /** Label → rendered value, for the labels listed in INSTALL_FIELDS. */
  fields: Record<string, string>;
};

/** A related record's name, whether the payload inlined it (`{name}`) or only
 * carries its id. Best-effort: an unresolvable name leaves the line blank. */
async function relatedName(value: unknown, path: (id: number) => Promise<any>): Promise<string | null> {
  if (value && typeof value === 'object') return (value as any).name ?? null;
  const id = Number(value);
  if (!id) return null;
  try {
    const res = await path(id);
    return (res?.data?.name as string) ?? null;
  } catch {
    return null;
  }
}

/** Product names + codes on the deal, deduplicated in order. Best-effort. */
async function dealProducts(dealId: number): Promise<{ names: string[]; codes: string[] }> {
  const names: string[] = [];
  const codes: string[] = [];
  try {
    const res = await pdv2(`/deals/${dealId}/products`);
    for (const item of Array.isArray(res?.data) ? res.data : []) {
      let name = (item?.name as string) ?? null;
      let code = (item?.product?.code as string) ?? (item?.code as string) ?? null;
      // v2 attaches the product by id only — resolve the catalogue entry.
      if ((!name || !code) && item?.product_id) {
        const product = await pdv2(`/products/${item.product_id}`).catch(() => null);
        name = name || ((product?.data?.name as string) ?? null);
        code = code || ((product?.data?.code as string) ?? null);
      }
      if (name && !names.includes(name)) names.push(name);
      if (code && !codes.includes(code)) codes.push(code);
    }
  } catch (error) {
    console.error('PipeDrive deal products fetch failed:', error);
  }
  return { names, codes };
}

/**
 * Everything an Install task needs about a won deal. `payload` is the webhook's
 * own copy of the deal, used when it already inlines a value so we spend fewer
 * API calls; the deal is re-fetched regardless, because a webhook can be
 * replayed and the live record is the one that matters.
 * Returns null when Pipedrive isn't configured or the deal can't be read.
 */
export async function getWonDeal(dealId: number, payload?: any): Promise<WonDeal | null> {
  if (!TOKEN || !dealId) return null;
  let deal: any = payload ?? null;
  try {
    const res = await pdv2(`/deals/${dealId}`);
    if (res?.data) deal = { ...(payload ?? {}), ...res.data };
  } catch (error) {
    console.error('PipeDrive deal fetch failed:', error);
    if (!deal) return null;
  }

  const defs = await dealFields();
  // v2 nests custom fields under `custom_fields`; v1 payloads flatten them onto
  // the deal itself. Look in both.
  const custom = (deal.custom_fields && typeof deal.custom_fields === 'object' ? deal.custom_fields : {}) as Record<string, unknown>;
  // An override pins a label to a key; keep the field's real definition so enum
  // ids still render as their labels.
  const byKey = new Map([...defs.values()].map((f) => [f.key, f]));
  const read = (names: string[], label?: string): string => {
    const overrideKey = label ? FIELD_OVERRIDES[label] : undefined;
    const candidates = overrideKey
      ? [byKey.get(overrideKey) ?? { key: overrideKey, name: label ?? '', fieldType: '', options: new Map<string, string>() }]
      : names.map((n) => defs.get(normalizeFieldName(n))).filter(Boolean as unknown as (v: DealField | undefined) => v is DealField);
    for (const field of candidates) {
      const raw = custom[field.key] ?? deal[field.key];
      const rendered = renderFieldValue(raw, field);
      if (rendered) return rendered;
    }
    return '';
  };

  const fields: Record<string, string> = {};
  for (const { label, names } of INSTALL_FIELDS) fields[label] = read(names, label);

  // A label nobody matches is a configuration miss, not an empty deal — say so
  // once per deal rather than shipping a silently truncated block.
  const unmatched = INSTALL_FIELDS.filter(
    ({ label, names }) => !FIELD_OVERRIDES[label] && !names.some((n) => defs.get(normalizeFieldName(n)))
  ).map((f) => f.label);
  if (unmatched.length) {
    console.warn(
      `[pipedrive] deal ${dealId}: no Pipedrive field matches ${unmatched.join(', ')} — those lines stay blank. See /api/admin/pipedrive-fields.`
    );
  }

  const [ownerName, orgName, personName, products] = await Promise.all([
    relatedName(deal.user_id ?? deal.owner_id, (id) => pd(`/users/${id}`)),
    relatedName(deal.org_id ?? deal.organization_id, (id) => pdv2(`/organizations/${id}`)),
    relatedName(deal.person_id, (id) => pdv2(`/persons/${id}`)),
    dealProducts(dealId),
  ]);

  const delivery = read(DELIVERY_NAMES, 'Delivery') || (deal.expected_close_date ? String(deal.expected_close_date) : '');

  return {
    id: dealId,
    title: String(deal.title ?? '').trim(),
    ownerName,
    orgName: orgName ?? (deal.org_name ? String(deal.org_name) : null),
    personName: personName ?? (deal.person_name ? String(deal.person_name) : null),
    // Pipedrive dates are already YYYY-MM-DD; anything else is dropped rather
    // than guessed, since Asana rejects a malformed due_on outright.
    delivery: /^\d{4}-\d{2}-\d{2}$/.test(delivery) ? delivery : null,
    productNames: products.names,
    productCodes: products.codes,
    fields,
  };
}

const PARTNER_LABEL_RE = /reseller|revendeur|oem|distributor|distributeur/;

/**
 * Walk every Pipedrive person carrying a partner label (Reseller / OEM /
 * Distributor) and collect their e-mail domains, deduplicated + lowercased.
 * Feeds the partner_domains table (brief § 2.3.b) so colleagues of a known
 * reseller are classified at sign-in without a per-person CRM call.
 * Returns Map<domain, label>. Throws on API failure (the cron reports it).
 */
export async function listPartnerEmailDomains(): Promise<Map<string, string>> {
  if (!TOKEN) return new Map();
  const names = await personLabelNames();
  const partnerLabelIds = new Set(
    [...names.entries()].filter(([, n]) => PARTNER_LABEL_RE.test(n.toLowerCase())).map(([id]) => id)
  );
  const domains = new Map<string, string>();
  if (!partnerLabelIds.size) return domains;

  let start = 0;
  for (let page = 0; page < 40; page++) {
    const res = await pd(`/persons?start=${start}&limit=500`);
    const rows = Array.isArray(res?.data) ? res.data : [];
    for (const person of rows) {
      const ids: number[] = Array.isArray(person?.label_ids)
        ? person.label_ids
        : typeof person?.label === 'number'
          ? [person.label]
          : [];
      const hit = ids.find((id) => partnerLabelIds.has(id));
      if (hit === undefined) continue;
      const emails: { value?: string }[] = Array.isArray(person?.email) ? person.email : [];
      for (const e of emails) {
        const at = (e?.value ?? '').lastIndexOf('@');
        if (at === -1) continue;
        const domain = (e.value as string).slice(at + 1).trim().toLowerCase();
        if (domain.includes('.')) domains.set(domain, names.get(hit) ?? 'partner');
      }
    }
    const pagination = res?.additional_data?.pagination;
    if (!pagination?.more_items_in_collection) break;
    start = Number(pagination.next_start ?? start + 500);
  }
  return domains;
}
