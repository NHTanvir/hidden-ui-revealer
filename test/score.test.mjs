import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score, isDestructive, scoreElement } from '../score.js';

test('higher tiers score higher; neutral words score zero', () => {
  assert.ok(score('Admin settings') > score('Edit name')); // tier1+2 > tier3
  assert.ok(score('Delete user') > score('Export list'));   // tier1 > tier2
  assert.equal(score('View profile'), 0);
});

test('destructive words detected', () => {
  assert.ok(isDestructive('Delete account'));
  assert.ok(!isDestructive('View profile'));
});

test('scoreElement uses label/href/action and method weight', () => {
  const r = scoreElement({ label: 'Export', href: '/admin/export', action: null });
  assert.ok(r.score >= 4);
  assert.equal(r.destructive, false);
  const withMethod = scoreElement({ label: 'Delete', href: '/x', method: 'DELETE' });
  assert.ok(withMethod.score > scoreElement({ label: 'Delete', href: '/x', method: 'GET' }).score);
  assert.ok(withMethod.destructive);
});

import { toMarkdown } from '../markdown.js';
test('markdown lists findings with reasons', () => {
  const md = toMarkdown([{ label: 'Delete', tag: 'button', destructive: true, reason: ['disabled'], href: null, action: null }], { host: 'x.com' });
  assert.ok(md.includes('Delete'));
  assert.ok(md.includes('destructive'));
  assert.ok(md.includes('disabled'));
});
