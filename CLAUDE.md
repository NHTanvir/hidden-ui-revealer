# CLAUDE.md — Hidden UI Revealer

## What this is
MV3 Chrome extension that finds role-hidden/disabled interactive elements,
ranks them, and reveals them locally for BFLA testing. Authorized use only.

## Layout
- `manifest.json` — MV3; storage/sidePanel/scripting/tabs.
- `scope.js` — scope list helpers (shared).
- `background.js` — registers `scan.js` + `reveal.css` for scope hosts only.
- `detect.js` — PURE classification of an element snapshot → reasons[]. Tested.
- `score.js` — PURE keyword scoring + destructive check. Tested.
- `markdown.js` — PURE Markdown export. Tested.
- `scan.js` — ISOLATED world: snapshot elements, score, MutationObserver,
  highlight, local reveal. Observation only; NEVER clicks.
- `reveal.css` — highlight + `.huir-revealed` override classes.
- `panel.html` / `panel.js` — side panel (ES module).
- `testpages/` — local page exercising every reason + late-added nodes.

## Rules
- Keep `detect.js` / `score.js` / `markdown.js` pure and Node-tested.
- Reveal must stay local (DOM/attribute only); never dispatch clicks.
- Destructive controls always warn before reveal.

## Test
`npm test`; manual: serve `testpages/`, scope `localhost`.
