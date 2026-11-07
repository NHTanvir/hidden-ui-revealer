# Features

## Detect
- Interactive elements (`button`, `a[href]`, `input`, `select`, `textarea`,
  `form`, `[role=button|menuitem|tab|link|checkbox|switch]`, `[onclick]`) that are:
  - hidden: `display:none`, `visibility:hidden`, `[hidden]`, `aria-hidden`,
    `opacity:0`, zero size, off-screen, clipped;
  - disabled: `disabled`, `aria-disabled`, `pointer-events:none`, `readonly`.
- Re-scans on DOM changes via a debounced `MutationObserver`.

## Rank
- Keyword scoring surfaces admin/delete/export/invite/role/billing/refund/
  approve/impersonate/settings/api-key controls first.
- Destructive-sounding controls are marked.

## Panel
- List with label, tag, reasons, href/form action.
- "Show me" highlight; per-element Reveal and Reveal-all (local).
- Copy findings as a Markdown test list.

## Safety
- Reveal is local only; the server still decides the outcome.
- Never auto-clicks; destructive controls require a confirm.
- Scope-gated; results per tab in `chrome.storage.session`.
