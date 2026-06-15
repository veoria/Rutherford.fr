// Console-validation client invitations — SERVER-ONLY.
//
// A reseller / distributor / team member invites a client to fill out a console
// validation. The token in the email link is the capability (the client needs
// no account). Created, resolved and completed via the service-role client.
import { randomBytes } from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type CvInvitation = {
  id: string;
  token: string;
  inviterId: string;
  inviterCompany: string | null;
  clientEmail: string;
  company: string | null;
  machine: string | null;
  note: string | null;
  locale: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
  expiresAt: string;
};

function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

type Row = {
  id: string;
  token: string;
  inviter_id: string;
  inviter_company: string | null;
  client_email: string;
  company: string | null;
  machine: string | null;
  note: string | null;
  locale: string;
  status: CvInvitation['status'];
  created_at: string;
  expires_at: string;
};

const toInvitation = (r: Row): CvInvitation => ({
  id: r.id,
  token: r.token,
  inviterId: r.inviter_id,
  inviterCompany: r.inviter_company,
  clientEmail: r.client_email,
  company: r.company,
  machine: r.machine,
  note: r.note,
  locale: r.locale,
  status: r.status,
  createdAt: r.created_at,
  expiresAt: r.expires_at,
});

export async function createCvInvitation(input: {
  inviterId: string;
  inviterCompany: string | null;
  clientEmail: string;
  company: string | null;
  machine: string | null;
  note: string | null;
  locale: string;
}): Promise<CvInvitation | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  const token = randomBytes(24).toString('base64url');
  try {
    const { data, error } = await supabase
      .from('console_validation_invitations')
      .insert({
        token,
        inviter_id: input.inviterId,
        inviter_company: input.inviterCompany,
        client_email: input.clientEmail,
        company: input.company,
        machine: input.machine,
        note: input.note,
        locale: input.locale,
      })
      .select('*')
      .single();
    if (error || !data) {
      console.error('cv invitation insert failed:', error?.message);
      return null;
    }
    return toInvitation(data as Row);
  } catch (e) {
    console.error('cv invitation insert threw:', e);
    return null;
  }
}

/** Resolve a token for the public form / intake. Only pending, non-expired. */
export async function getCvInvitationByToken(token: string): Promise<CvInvitation | null> {
  const supabase = adminClient();
  if (!supabase || !token) return null;
  try {
    const { data } = await supabase
      .from('console_validation_invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    if (!data) return null;
    const inv = toInvitation(data as Row);
    if (inv.status !== 'pending') return null;
    if (new Date(inv.expiresAt).getTime() < Date.now()) return null;
    return inv;
  } catch {
    return null;
  }
}

export async function listCvInvitations(inviterId: string): Promise<CvInvitation[]> {
  const supabase = adminClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from('console_validation_invitations')
      .select('*')
      .eq('inviter_id', inviterId)
      .order('created_at', { ascending: false })
      .limit(100);
    return ((data ?? []) as Row[]).map(toInvitation);
  } catch {
    return [];
  }
}

export async function completeCvInvitation(token: string, validationId: string | null): Promise<void> {
  const supabase = adminClient();
  if (!supabase || !token) return;
  try {
    await supabase
      .from('console_validation_invitations')
      .update({ status: 'completed', validation_id: validationId })
      .eq('token', token);
  } catch {
    /* best-effort */
  }
}
