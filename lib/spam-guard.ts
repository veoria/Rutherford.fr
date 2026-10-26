// Server-side spam guards shared by the public forms (contact, newsletter, ROI,
// console validation).
//
// 1. Disposable inboxes: a lead on a throwaway address can never be answered,
//    and they are the bots' favourite (26/10/2026: "Otelium" on
//    northmail.web.id with a link-spam URL). The list is the community-kept
//    disposable-email-domains package, plus our own sightings below.
// 2. Vercel BotID: the invisible challenge mounted in app/layout.tsx; a request
//    that skipped it (scripted POST) or failed it is a bot.

import { checkBotId } from 'botid/server';

// Seen on our forms, not (yet) in the package list.
const EXTRA_DISPOSABLE = ['northmail.web.id'];

let domains: Set<string> | null = null;
function disposableDomains(): Set<string> {
  if (!domains) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const list: string[] = require('disposable-email-domains');
    domains = new Set([...list, ...EXTRA_DISPOSABLE]);
  }
  return domains;
}

/** True when the address is on a disposable domain (or a subdomain of one). */
export function isDisposableEmail(email: string): boolean {
  const host = email.split('@').pop()?.trim().toLowerCase() ?? '';
  if (!host) return false;
  const set = disposableDomains();
  const parts = host.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    if (set.has(parts.slice(i).join('.'))) return true;
  }
  return false;
}

/**
 * True when Vercel BotID classifies the request as a bot. Never throws: if the
 * check itself fails (outage, local dev), the visitor is given the benefit of
 * the doubt so a real lead is never lost to our own tooling.
 */
export async function isBotRequest(): Promise<boolean> {
  try {
    const verification = await checkBotId();
    return verification.isBot;
  } catch (error) {
    console.error('[spam-guard] BotID check failed', error);
    return false;
  }
}
