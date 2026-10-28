// Day / evening resolution. Evening 18:00 to 05:59 local time. The demo override wins.

import * as store from './store.js';

let current = null;

export function resolve() {
  const o = store.get().settings.themeOverride;
  if (o === 'day' || o === 'evening') return o;
  const h = new Date().getHours();
  return h >= 18 || h < 6 ? 'evening' : 'day';
}

export function currentTheme() { return current || resolve(); }

export function apply({ animate = true } = {}) {
  const next = resolve();
  if (next === current) return false;
  const phone = document.getElementById('phone');
  if (animate && current) {
    phone.classList.add('is-theming');
    window.setTimeout(() => phone.classList.remove('is-theming'), 420);
  }
  current = next;
  if (next === 'evening') phone.setAttribute('data-theme', 'evening');
  else phone.removeAttribute('data-theme');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'evening' ? '#2A1B5C' : '#FFFFFF');
  return true;
}

export function start(onChange) {
  apply({ animate: false });
  window.setInterval(() => { if (apply()) onChange?.(); }, 60 * 1000);
  store.subscribe(() => { if (apply()) onChange?.(); });
}
