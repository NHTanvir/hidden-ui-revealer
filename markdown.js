// Pure: render findings as a Markdown test list for notes/<program>/.
export function toMarkdown(results, meta = {}) {
  const lines = [`# Hidden / disabled UI${meta.host ? ' — ' + meta.host : ''}`];
  if (meta.when) lines.push(`_${meta.when}_`);
  lines.push('', `Found ${results.length} element(s) hidden or disabled for this role.`, '');
  for (const r of results) {
    const d = r.destructive ? ' ⚠️destructive' : '';
    lines.push(`- **${r.label}** \`<${r.tag}>\`${d} — ${r.reason.join(', ')}`);
    if (r.href) lines.push(`  - href: \`${r.href}\``);
    if (r.action) lines.push(`  - form action: \`${r.action}\``);
  }
  return lines.join('\n');
}
