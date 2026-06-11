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
      'Lead Rutherford Academy',
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
      `Photos : ${lead.photoCount} (Supabase Storage → console-validations/${lead.storagePath})`,
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
