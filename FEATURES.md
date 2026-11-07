# Features

## Detect
- Interactive elements (`button`, `a[href]`, `input`, `select`, `textarea`,
  `form`, `[role=button|menuitem|tab|link|checkbox|switch]`, `[onclick]`) that are:
  - hidden: `display:none`, `visibility:hidden`, `[hidden]`, `aria-hidden`,
    `opacity:0`, zero size, off-screen, clipped;
  - disabled: `disabled`, `aria-disabled`, `pointer-events:none`, `readonly`.
- Re-scans on DOM changes via a debounced `MutationObserver`.

## Rank
- Three-tier keyword scoring (Tier 1 destructive/privilege-granting, Tier 2
  data-egress/tenant-scope, Tier 3 generic state change) plus an HTTP-method
  weight for mutating verbs surfaces the riskiest controls first.
- Destructive-sounding controls are marked.

## Request metadata (turns a control into a test)
- Form method, hidden-field defaults (privilege-bearing: `role`, `profile`,
  `tenant_id`), and `data-*` attributes (often the real id/action/endpoint)
  are captured and shown, so a revealed control is a ready-to-run test.

## Panel
- List with label, tag, reasons, href/form action.
- "Show me" highlight; per-element Reveal and Reveal-all (local).
- Copy findings as a Markdown test list.

## Safety
- Reveal is local only; the server still decides the outcome.
- Never auto-clicks; destructive controls require a confirm.
- Scope-gated; results per tab in `chrome.storage.session`.
