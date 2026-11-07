// ISOLATED world. Scans interactive elements and reports those hidden or
// disabled for the current role. Observation only — never clicks anything.
import * as detect from './detect.js';
import { scoreElement } from './score.js';

const SELECTOR = [
  'button', 'a[href]', 'input', 'select', 'textarea', 'form',
  '[role=button]', '[role=menuitem]', '[role=tab]', '[role=link]',
  '[role=checkbox]', '[role=switch]', '[onclick]',
].join(',');

function snapshot(el) {
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const offscreen = r.bottom < 0 || r.right < 0 || r.left > (innerWidth + 2000) || r.top > (innerHeight + 2000);
  const clipped = cs.clip === 'rect(0px, 0px, 0px, 0px)' || (cs.clipPath && cs.clipPath.includes('inset(100%)'));
  return {
    display: cs.display, visibility: cs.visibility, opacity: parseFloat(cs.opacity),
    pointerEvents: cs.pointerEvents, width: r.width, height: r.height,
    offscreen, clipped,
    hiddenAttr: el.hasAttribute('hidden'),
    ariaHidden: el.getAttribute('aria-hidden'),
    disabledAttr: el.hasAttribute('disabled'),
    ariaDisabled: el.getAttribute('aria-disabled'),
    readOnly: el.matches('input[readonly], textarea[readonly]'),
  };
}

function label(el) {
  return (el.getAttribute('aria-label') || el.textContent || el.value ||
          el.getAttribute('title') || el.name || el.id || el.tagName).trim().slice(0, 80);
}

export function scanDocument() {
  const found = [];
  let idx = 0;
  document.querySelectorAll(SELECTOR).forEach((el) => {
    const s = snapshot(el);
    const rs = detect.reasons(s);
    if (!rs.length) return;
    el.setAttribute('data-huir-id', String(idx));
    const form = el.tagName === 'FORM' ? el : el.form;
    const dataAttrs = {};
    for (const a of el.attributes) if (a.name.startsWith('data-')) dataAttrs[a.name] = a.value.slice(0, 120);
    let method = null, hiddenFields = null;
    if (form) {
      method = (form.getAttribute('method') || 'GET').toUpperCase();
      hiddenFields = {};
      for (const inp of form.querySelectorAll('input[type=hidden][name], input[name][hidden]')) {
        hiddenFields[inp.getAttribute('name')] = (inp.value || '').slice(0, 120);
      }
    }
    const rec = {
      id: idx++,
      tag: el.tagName.toLowerCase(),
      label: label(el),
      reason: rs,
      href: el.getAttribute('href') || null,
      action: el.getAttribute('action') || (form && form.getAttribute('action')) || null,
      method,
      dataAttrs: Object.keys(dataAttrs).length ? dataAttrs : null,
      hiddenFields: hiddenFields && Object.keys(hiddenFields).length ? hiddenFields : null,
      mounted: true, // scanned from the live DOM, so handler/endpoint are recoverable now
    };
    const sc = scoreElement(rec);
    rec.score = sc.score;
    rec.destructive = sc.destructive;
    found.push(rec);
  });
  found.sort((a, b) => b.score - a.score);
  return found;
}

// Debounced rescans on DOM changes + messaging to the panel.
let timer = null;
let latest = [];

function publish() {
  latest = scanDocument();
  try { chrome.runtime.sendMessage({ type: 'huir-results', results: latest }); } catch {}
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(publish, 300);
}

const observer = new MutationObserver(schedule);
observer.observe(document.documentElement, {
  childList: true, subtree: true, attributes: true,
  attributeFilter: ['hidden', 'disabled', 'aria-hidden', 'aria-disabled', 'style', 'class'],
});

function elById(id) { return document.querySelector(`[data-huir-id="${id}"]`); }

function highlight(id) {
  const el = elById(id);
  if (!el) return;
  el.classList.add('huir-highlight');
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  setTimeout(() => el.classList.remove('huir-highlight'), 2000);
}

function reveal(id, on) {
  const el = elById(id);
  if (!el) return false;
  if (on) {
    el.classList.add('huir-revealed');
    el.removeAttribute('hidden');
    el.removeAttribute('aria-hidden');
    el.removeAttribute('disabled');
    el.setAttribute('aria-disabled', 'false');
  } else {
    el.classList.remove('huir-revealed');
  }
  return true;
}

function revealAll(on) {
  let n = 0;
  for (const r of latest) if (reveal(r.id, on)) n++;
  return n;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'huir-rescan') { publish(); sendResponse({ results: latest }); return true; }
  if (msg && msg.type === 'huir-get') { sendResponse({ results: latest }); return true; }
  if (msg && msg.type === 'huir-highlight') { highlight(msg.id); sendResponse({ ok: true }); return true; }
  if (msg && msg.type === 'huir-reveal') { sendResponse({ ok: reveal(msg.id, msg.on !== false) }); return true; }
  if (msg && msg.type === 'huir-reveal-all') { sendResponse({ n: revealAll(msg.on !== false) }); return true; }
});

publish();
globalThis.__huirScan = scanDocument;
