// Pure keyword scoring: rank elements by how interesting they look for
// function-level authorization (BFLA) testing. Tiered per the research notes
// (Tier 1 destructive/privilege-granting > Tier 2 data-egress/tenant-scope >
// Tier 3 generic state change). Node-testable.
export const TIER1 = ['delete', 'remove', 'drop', 'purge', 'refund', 'chargeback',
  'impersonate', 'sudo', 'grant', 'promote', 'role', 'permission', 'admin',
  'superuser', 'elevate', 'approve', 'publish', 'deactivate', 'ban',
  'reset-password', 'takeover', 'revoke', 'disable'];
export const TIER2 = ['export', 'download', 'invite', 'billing', 'invoice',
  'payout', 'transfer', 'api-key', 'apikey', 'token', 'secret', 'settings',
  'config', 'webhook', 'audit', 'report', 'key'];
export const TIER3 = ['edit', 'update', 'create', 'assign', 'moderate'];

const DESTRUCTIVE = ['delete', 'remove', 'refund', 'revoke', 'disable', 'wipe', 'purge', 'ban', 'deactivate'];

export function score(text) {
  const t = (text || '').toLowerCase();
  let s = 0;
  for (const k of TIER1) if (t.includes(k)) s += 3;
  for (const k of TIER2) if (t.includes(k)) s += 2;
  for (const k of TIER3) if (t.includes(k)) s += 1;
  return s;
}

export function isDestructive(text) {
  const t = (text || '').toLowerCase();
  return DESTRUCTIVE.some((k) => t.includes(k));
}

// score an element record using its label, href, action and the HTTP method
// of the request it would fire (mutating verbs on mutating paths rank higher).
export function scoreElement(rec) {
  const hay = [rec.label, rec.href, rec.action].filter(Boolean).join(' ');
  let s = score(hay);
  const method = (rec.method || '').toUpperCase();
  if (['DELETE', 'PUT', 'POST', 'PATCH'].includes(method)) s += 1;
  return { score: s, destructive: isDestructive(hay) };
}
