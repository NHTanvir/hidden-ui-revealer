// Pure helpers for classifying elements. The DOM-dependent parts (scan.js)
// pass already-computed values in, so these stay Node-testable.

export const INTERACTIVE = ['button','a','input','select','textarea','form'];
export const INTERACTIVE_ROLES = ['button','menuitem','tab','link','checkbox','switch'];

// Given a plain description of an element, return the reasons it is hidden
// and/or disabled. `s` is a snapshot of computed style + attributes + rect.
export function reasons(s) {
  const out = [];
  // hidden
  if (s.display === 'none') out.push('display:none');
  if (s.visibility === 'hidden' || s.visibility === 'collapse') out.push('visibility:hidden');
  if (s.hiddenAttr) out.push('[hidden]');
  if (s.ariaHidden === 'true') out.push('aria-hidden');
  if (s.opacity === 0 || s.opacity === '0') out.push('opacity:0');
  if (s.width === 0 || s.height === 0) out.push('zero-size');
  if (s.offscreen) out.push('off-screen');
  if (s.clipped) out.push('clipped');
  // disabled
  if (s.disabledAttr) out.push('disabled');
  if (s.ariaDisabled === 'true') out.push('aria-disabled');
  if (s.pointerEvents === 'none') out.push('pointer-events:none');
  if (s.readOnly) out.push('readonly');
  return out;
}

export function isHiddenOrDisabled(s) {
  return reasons(s).length > 0;
}
