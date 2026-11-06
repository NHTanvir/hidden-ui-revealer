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
    const rec = {
      id: idx++,
      tag: el.tagName.toLowerCase(),
      label: label(el),
      reason: rs,
      href: el.getAttribute('href') || null,
      action: el.getAttribute('action') || (el.form && el.form.action) || null,
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

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'huir-rescan') { publish(); sendResponse({ results: latest }); return true; }
  if (msg && msg.type === 'huir-get') { sendResponse({ results: latest }); return true; }
});

publish();
globalThis.__huirScan = scanDocument;
