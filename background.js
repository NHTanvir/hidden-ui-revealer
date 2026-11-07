import { getScope } from './scope.js';

async function syncRegistrations() {
  const hosts = await getScope();
  const existing = await chrome.scripting.getRegisteredContentScripts().catch(() => []);
  if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: existing.map((s) => s.id) }).catch(() => {});
  if (!hosts.length) return;
  const matches = hosts.map((h) => `*://${h}/*`).concat(hosts.map((h) => `*://*.${h}/*`));
  await chrome.scripting.registerContentScripts([
    { id: 'huir-scan', js: ['scan.js'], css: ['reveal.css'], matches, runAt: 'document_idle', allFrames: true, world: 'ISOLATED' },
  ]).catch((e) => console.warn('[huir] register failed', e));
}

chrome.runtime.onInstalled.addListener(syncRegistrations);
chrome.runtime.onStartup.addListener(syncRegistrations);
chrome.storage.onChanged.addListener((c, a) => { if (a === 'local' && c.scopeHosts) syncRegistrations(); });
chrome.action.onClicked.addListener((tab) => { if (tab.windowId != null) chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {}); });
