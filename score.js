// Pure keyword scoring: rank elements by how interesting they look for
// function-level authorization testing. Node-testable.
export const KEYWORDS = [
  'admin', 'delete', 'remove', 'export', 'invite', 'role', 'permission',
  'billing', 'refund', 'approve', 'impersonate', 'settings', 'api', 'apikey',
  'key', 'token', 'owner', 'disable', 'enable', 'promote', 'grant', 'revoke',
  'publish', 'danger', 'sudo', 'internal',
];

const DESTRUCTIVE = ['delete', 'remove', 'refund', 'revoke', 'disable', 'wipe', 'purge'];

export function score(text) {
  const t = (text || '').toLowerCase();
  let s = 0;
  for (const k of KEYWORDS) if (t.includes(k)) s += 2;
  return s;
}

export function isDestructive(text) {
  const t = (text || '').toLowerCase();
  return DESTRUCTIVE.some((k) => t.includes(k));
}

// score an element record using its label, href and action
export function scoreElement(rec) {
  const hay = [rec.label, rec.href, rec.action].filter(Boolean).join(' ');
  return { score: score(hay), destructive: isDestructive(hay) };
}
