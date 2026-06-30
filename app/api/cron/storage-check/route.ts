import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { notifyDiscordStorageAlert } from '@/lib/discord';

export const dynamic = 'force-dynamic';

const GB = 1024 ** 3;
const THRESHOLD_GB = Number(process.env.STORAGE_ALERT_GB) || 20;

/**
 * Monthly storage watchdog (wired via vercel.json crons). Reads the size of the
 * console-validations bucket and, if it crosses STORAGE_ALERT_GB (default 20),
 * pings Discord with a link to the manual cleanup. The Pro plan has no hard
 * wall (100 GB included, then ~$0.021/GB), so this is an early heads-up, not a
 * failure guard. Read-only — never deletes anything.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. CRON_SECRET must
 * be configured in the environment — the endpoint fails closed (401) without it,
 * so it is never anonymously callable.
 */
export async function GET(request: NextRequest) {
  // Fail closed: require CRON_SECRET to be set AND matched. Previously an unset
  // secret skipped the check entirely, leaving the endpoint open to any caller.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc('console_storage_usage');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = Array.isArray(data) ? data[0] : data;
  const bytes = Number(row?.bytes ?? 0);
  const objects = Number(row?.objects ?? 0);
  const usedGb = bytes / GB;

  let alerted = false;
  if (usedGb >= THRESHOLD_GB) {
    await notifyDiscordStorageAlert({
      usedGb,
      thresholdGb: THRESHOLD_GB,
      objects,
      cleanupUrl: `${request.nextUrl.origin}/api/admin/storage?cleanup=1`,
    });
    alerted = true;
  }

  return NextResponse.json({ usedGb: Number(usedGb.toFixed(3)), thresholdGb: THRESHOLD_GB, objects, alerted });
}
