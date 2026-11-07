import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score, isDestructive, scoreElement } from '../score.js';

test('keyword hits raise the score', () => {
  assert.ok(score('Admin settings') > score('Save'));
  assert.equal(score('Save profile'), 0);
});

test('destructive words detected', () => {
  assert.ok(isDestructive('Delete account'));
  assert.ok(!isDestructive('View profile'));
});

test('scoreElement uses label/href/action', () => {
  const r = scoreElement({ label: 'Export', href: '/admin/export', action: null });
  assert.ok(r.score >= 4);
  assert.equal(r.destructive, false);
});

import { toMarkdown } from '../markdown.js';
test('markdown lists findings with reasons', () => {
  const md = toMarkdown([{ label: 'Delete', tag: 'button', destructive: true, reason: ['disabled'], href: null, action: null }], { host: 'x.com' });
  assert.ok(md.includes('Delete'));
  assert.ok(md.includes('destructive'));
  assert.ok(md.includes('disabled'));
});
