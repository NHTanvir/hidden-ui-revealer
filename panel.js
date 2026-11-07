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
      ${r.action ? `<div class="url">form → ${esc(r.action)}</div>` : ''}
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

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'huir-results') { results = msg.results; render(); }
});

chrome.tabs.onActivated.addListener(refresh);
refresh();
