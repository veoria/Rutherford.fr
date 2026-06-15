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
