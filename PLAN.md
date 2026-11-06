# Hidden UI Revealer — Plan

## Goal
Find buttons, links, menu items and forms that exist in the page but are **hidden or disabled for your role**, list them, and let you reveal / enable them so you can try the action — to find functions the server doesn't actually protect.

**Roadmap fit:** spine #3 function-level authorization / BFLA (admin endpoint with a user token, tier escalation), and #13 RBAC vs ABAC confusion.

**Why Burp can't:** Burp only sees requests you actually make. It can't see what the UI renders but hides from your role.

## Features
### v1 (MVP)
- Scan the page (and changes, via `MutationObserver`) for interactive elements — `button`, `a[href]`, `input`, `select`, `form`, `[role=button|menuitem|tab]`, `[onclick]` — that are:
  - hidden: `display:none`, `visibility:hidden`, `hidden` attribute, `aria-hidden`, zero size, `opacity:0`, off-screen, clipped;
  - disabled: `disabled`, `aria-disabled="true"`, `pointer-events:none`, `readonly` on inputs.
- **Interesting first:** sort by keywords in text / labels / ids / hrefs — admin, delete, export, invite, role, billing, refund, approve, impersonate, settings, api key…
- **Panel:** list with element label, why it's hidden/disabled, href or form action, a "show me" highlight.
- **Reveal (local only):** per element or all — remove `hidden`, override display/visibility via an added stylesheet class, remove `disabled` / `aria-disabled`. **Never clicks anything by itself.**
- Scope list; off everywhere else.

### Later
- Capture the request a revealed control sends (via the click you make) and label it "made with a hidden control" in the panel, to copy into notes.
- Remember findings per target and page path.
- Feed into Role UI Diff (shared export format).

## Design
| File | Role |
|---|---|
| `manifest.json` | MV3. `storage`, `sidePanel`, `scripting`, `tabs`; host permissions per scope host. |
| `scan.js` | Content script (isolated world): scanning, `getComputedStyle` checks, keyword scoring, MutationObserver (debounced), highlight + reveal. |
| `reveal.css` | Injected class overrides used by Reveal (`!important` display/visibility/pointer-events). |
| `background.js` | Scope + content-script registration, per-tab results in `chrome.storage.session`. |
| `panel.html/.js` | Side panel. |

**Data:** `{ selector, tag, label, reason[], href|action, score, revealed }` per element, per tab.

## Safety and scope
- Reveal changes only your local page; the server decides whether the action works. Only test actions on your own test accounts and objects (the roadmap's non-destructive rule).
- Never auto-clicks; destructive-sounding actions (delete, refund…) shown with a warning.
- In-scope hosts only.

## Testing
- Test page with: a hidden admin menu, a disabled "Export" button, an `aria-hidden` link, a `pointer-events:none` button, elements added later by JS, and normal visible buttons (must not be listed).
- CDP + **error watcher**, 0 errors. Check detection, scoring order, reveal / un-reveal, no listing of visible elements, no automatic clicks.

## Issues → commits
1. Scaffold: manifest, worker, scope
2. Detector for hidden and disabled interactive elements
3. Keyword scoring and MutationObserver
4. Side panel list + highlight
5. Reveal / enable (local) with warnings
6. Test page + README/FEATURES/CLAUDE.md
