// SERVER-ONLY — admin audit trail (brief § 4.2.6). Records who changed what in
// the back-office and lets the audit viewer read it back. Writes are
// best-effort: an audit failure must NEVER block or fail the mutation it
// describes.

import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type AuditEntry = {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type RecordInput = {
  actorId: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
};

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createSupabaseAdminClient();
}

/** Record one admin action. Best-effort — swallows all errors so a logging
 * hiccup can't break the mutation being logged. */
export async function recordAudit(input: RecordInput): Promise<void> {
  const supabase = admin();
  if (!supabase) return;
  try {
    await supabase.from('admin_audit_log').insert({
      actor_id: input.actorId,
      actor_email: input.actorEmail ?? null,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      summary: input.summary ?? null,
      metadata: input.metadata ?? null,
    });
  } catch {
    /* never throws */
  }
}

/** Most recent audit entries for the viewer tab. Service-role read — the caller
 * must already have verified admin access. Pass `target` to narrow the log to
 * one entity (e.g. { type: 'organization', id } for the org page's Journal). */
export async function listAuditLog(
  limit = 200,
  target?: { type: string; id: string }
): Promise<AuditEntry[]> {
  const supabase = admin();
  if (!supabase) return [];
  try {
    let query = supabase
      .from('admin_audit_log')
      .select('id, actor_id, actor_email, action, target_type, target_id, summary, metadata, created_at');
    if (target) query = query.eq('target_type', target.type).eq('target_id', target.id);
    const { data } = await query
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 1000));
    return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      actorId: (r.actor_id as string | null) ?? null,
      actorEmail: (r.actor_email as string | null) ?? null,
      action: r.action as string,
      targetType: (r.target_type as string | null) ?? null,
      targetId: (r.target_id as string | null) ?? null,
      summary: (r.summary as string | null) ?? null,
      metadata: (r.metadata as Record<string, unknown> | null) ?? null,
      createdAt: r.created_at as string,
    }));
  } catch {
    return [];
  }
}
