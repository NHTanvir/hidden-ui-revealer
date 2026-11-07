import { toMarkdown } from './markdown.js';
let results = [];
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');

function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

async function tabId() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t ? t.id : null;
}

function render() {
  listEl.innerHTML = results.map((r) => `
    <div class="row" data-id="${r.id}">
      <div class="top">
        <span class="tag">&lt;${esc(r.tag)}&gt;</span>
        <span class="lbl ${r.destructive ? 'danger' : ''}">${esc(r.label)}</span>
        ${r.destructive ? '<span class="danger">⚠ destructive</span>' : ''}
      </div>
      <div class="reasons">${r.reason.map(esc).join(' · ')}</div>
      ${r.href ? `<div class="url">${esc(r.href)}</div>` : ''}
      ${r.action ? `<div class="url">${esc(r.method || 'GET')} ${esc(r.action)}</div>` : ''}
      ${r.hiddenFields ? `<div class="meta2">hidden fields: ${esc(Object.entries(r.hiddenFields).map(([k,v])=>k+'='+v).join(', '))}</div>` : ''}
      ${r.dataAttrs ? `<div class="meta2">${esc(Object.entries(r.dataAttrs).map(([k,v])=>k+'='+v).join(' · '))}</div>` : ''}
      <div><button class="reveal" data-id="${r.id}" data-danger="${r.destructive ? 1 : 0}">Reveal</button></div>
    </div>`).join('');
  emptyEl.style.display = results.length ? 'none' : 'block';
}

async function refresh() {
  const id = await tabId();
  if (id == null) return;
  const resp = await chrome.tabs.sendMessage(id, { type: 'huir-get' }).catch(() => null);
  results = (resp && resp.results) || [];
  render();
}

document.getElementById('rescan').addEventListener('click', async () => {
  const id = await tabId();
  const resp = await chrome.tabs.sendMessage(id, { type: 'huir-rescan' }).catch(() => null);
  results = (resp && resp.results) || [];
  render();
});

document.getElementById('copy').addEventListener('click', async () => {
  let host = '';
  try { const [t] = await chrome.tabs.query({ active: true, currentWindow: true }); host = new URL(t.url).host; } catch {}
  navigator.clipboard.writeText(toMarkdown(results, { host, when: new Date().toISOString() })).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'huir-results') { results = msg.results; render(); }
});

listEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('button.reveal');
  const tid = await tabId();
  if (btn) {
    const id = Number(btn.dataset.id);
    if (btn.dataset.danger === '1' &&
        !confirm('This control looks destructive (delete/refund/revoke...). Reveal it anyway? It will NOT be clicked for you.')) return;
    await chrome.tabs.sendMessage(tid, { type: 'huir-reveal', id, on: true }).catch(() => {});
    btn.textContent = 'Revealed';
    return;
  }
  const row = e.target.closest('.row');
  if (row) chrome.tabs.sendMessage(tid, { type: 'huir-highlight', id: Number(row.dataset.id) }).catch(() => {});
});

document.getElementById('revealAll').addEventListener('click', async () => {
  if (!confirm('Reveal all hidden/disabled elements on this page locally? Nothing is clicked for you.')) return;
  const tid = await tabId();
  await chrome.tabs.sendMessage(tid, { type: 'huir-reveal-all', on: true }).catch(() => {});
});

chrome.tabs.onActivated.addListener(refresh);
refresh();
