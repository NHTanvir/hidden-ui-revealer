# Hidden UI Revealer

A Chrome (MV3) extension that finds buttons, links, menu items and forms that
exist in the page but are **hidden or disabled for your role**, ranks the
interesting ones (admin/delete/export/role/billing…), and lets you reveal or
enable them **locally** so you can try the action — to find functions the
server doesn't actually protect (BFLA / function-level authorization).

> **Authorized testing only.** Revealing changes only your local page; the
> server decides whether the action works. Test actions only on your own test
> accounts and objects, and never let the tool click for you — it doesn't.
> With an empty scope it does nothing anywhere.

## Why not Burp
A proxy only sees requests you actually make. It can't see what the UI renders
but hides from your role.

## Install (unpacked)
1. `chrome://extensions` → Developer mode → **Load unpacked** → this folder.
2. Options → add host(s) you are authorized to test.
3. Reload the tab, open the side panel from the toolbar icon.

## Try it
```
cd testpages && python3 -m http.server 8000
```
Open `http://localhost:8000/` with `localhost` in scope. The panel lists the
hidden/disabled controls interesting-first, highlights them, and reveals them
on request (destructive ones ask first).

## Tests
```
npm test
```
See [FEATURES.md](FEATURES.md) and [PLAN.md](PLAN.md).
