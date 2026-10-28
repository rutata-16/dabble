// DOM builders for every reusable UI piece. Styles live in css/components.css.

import { icon } from './icons.js';
import * as data from './data.js';
import * as store from './store.js';
import { currentTheme } from './theme.js';

/* ---------- Core helper ---------- */

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'on') Object.entries(v).forEach(([evt, fn]) => node.addEventListener(evt, fn));
    else if (k === 'style') Object.assign(node.style, v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  appendAll(node, children);
  return node;
}

function appendAll(node, children) {
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export function text(tag, cls, content) {
  return el(tag, { class: cls }, content);
}

// Enter/Space activation for non-button elements with role="button".
export function pressable(node, onActivate) {
  node.classList.add('pressable');
  node.addEventListener('click', onActivate);
  if (node.tagName !== 'BUTTON' && node.tagName !== 'A') {
    node.setAttribute('tabindex', '0');
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(e); }
    });
  }
  return node;
}

/* ---------- Button ---------- */

export function button(label, { variant = 'primary', size = 'large', block = true, iconName, iconEnd, onClick, cls = '', ariaLabel } = {}) {
  const b = el('button', {
    type: 'button',
    class: ['btn', `btn--${variant}`, size === 'small' ? 'btn--small' : '', block && variant !== 'ghost' ? 'btn--block' : '', cls].filter(Boolean).join(' '),
    'aria-label': ariaLabel,
  });
  if (iconName) b.append(icon(iconName));
  b.append(el('span', {}, label));
  if (iconEnd) b.append(icon(iconEnd));
  pressable(b, (e) => onClick?.(e));
  return b;
}

/* ---------- Chips ---------- */

// Multi-select chip group. Returns { node, get() }.
export function chipGroup(options, { selected = [], onChange, label, fill: fillCols } = {}) {
  const picked = new Set(selected);
  const group = el('div', { class: 'chip-group' + (fillCols ? ' chip-group--fill' : ''), role: 'group', 'aria-label': label });
  if (fillCols) group.style.setProperty('--cols', fillCols);
  options.forEach((opt) => {
    const id = typeof opt === 'string' ? opt : opt.id;
    const lbl = typeof opt === 'string' ? opt : opt.label;
    const c = el('button', { type: 'button', class: 'chip', 'aria-pressed': String(picked.has(id)) }, lbl);
    pressable(c, () => {
      if (picked.has(id)) picked.delete(id); else picked.add(id);
      c.setAttribute('aria-pressed', String(picked.has(id)));
      onChange?.([...picked]);
    });
    group.append(c);
  });
  return { node: group, get: () => [...picked] };
}

// Single-select chip group (radiogroup).
export function chipRadioGroup(options, { selected = null, onChange, label, fill: fillCols } = {}) {
  let value = selected;
  const group = el('div', { class: 'chip-group' + (fillCols ? ' chip-group--fill' : ''), role: 'radiogroup', 'aria-label': label });
  if (fillCols) group.style.setProperty('--cols', fillCols);
  const chips = options.map((opt) => {
    const id = typeof opt === 'string' ? opt : opt.id;
    const lbl = typeof opt === 'string' ? opt : opt.label;
    const c = el('button', { type: 'button', class: 'chip', role: 'radio', 'aria-checked': String(id === value), 'data-id': id }, lbl);
    pressable(c, () => {
      value = id;
      chips.forEach((x) => x.setAttribute('aria-checked', String(x.dataset.id === String(id))));
      onChange?.(id);
    });
    group.append(c);
    return c;
  });
  radioKeys(group, chips);
  return { node: group, get: () => value };
}

/* ---------- Option rows ---------- */

export function optionGroup(options, { selected = null, onChange, label, grid = false } = {}) {
  let value = selected;
  const group = el('div', { class: grid ? 'option-grid' : 'option-group', role: 'radiogroup', 'aria-label': label });
  const rows = options.map((opt) => {
    const isOn = opt.id === value;
    const row = el('button', { type: 'button', class: 'option-row', role: 'radio', 'aria-checked': String(isOn), 'data-id': String(opt.id) },
      el('span', { class: 'option-row__text' },
        el('span', { class: 't-title' }, opt.title),
        opt.sub ? el('span', { class: grid ? 't-caption option-row__sub' : 't-small option-row__sub' }, opt.sub) : null,
      ),
      grid ? null : el('span', { class: 'option-row__mark' }, icon(isOn ? 'check_circle' : 'radio_button_unchecked', { filled: isOn })),
    );
    pressable(row, () => {
      value = opt.id;
      rows.forEach((r) => {
        const on = r.dataset.id === String(opt.id);
        r.setAttribute('aria-checked', String(on));
        const mark = r.querySelector('.option-row__mark');
        if (mark) { mark.replaceChildren(icon(on ? 'check_circle' : 'radio_button_unchecked', { filled: on })); if (on) mark.firstChild.classList.add('pop-in'); }
      });
      onChange?.(opt.id);
    });
    group.append(row);
    return row;
  });
  radioKeys(group, rows);
  return { node: group, get: () => value };
}

function radioKeys(group, items) {
  group.addEventListener('keydown', (e) => {
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % items.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + items.length) % items.length;
    if (n !== null) { e.preventDefault(); items[n].focus(); items[n].click(); }
  });
}

/* ---------- Fields ---------- */

let fieldSeq = 0;
export function field({ label, value = '', placeholder = '', type = 'text', prefix, helper, inputmode, autocomplete, maxlength, onInput } = {}) {
  const id = `f-${++fieldSeq}`;
  const errId = `${id}-err`;
  const input = el('input', { id, type, value, placeholder, inputmode, autocomplete, maxlength, 'aria-describedby': errId });
  input.value = value;
  input.addEventListener('input', () => onInput?.(input.value));
  const err = el('div', { class: 'inline-error', id: errId, 'aria-live': 'polite' });
  const wrap = el('div', { class: 'field' },
    el('label', { class: 't-overline field__label', for: id }, label),
    el('div', { class: 'field__control' }, prefix ? el('span', { class: 'field__prefix' }, prefix) : null, input),
    helper ? el('div', { class: 't-small field__helper' }, helper) : null,
    err,
  );
  return {
    node: wrap, input,
    setError(msg) {
      wrap.classList.toggle('is-error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.replaceChildren(...(msg ? [icon('error'), el('span', {}, msg)] : []));
    },
  };
}

export function selectField({ label, options, value, helper, onChange } = {}) {
  const id = `f-${++fieldSeq}`;
  const select = el('select', { id });
  options.forEach((o) => select.append(el('option', { value: String(o.value), selected: String(o.value) === String(value) }, o.label)));
  select.addEventListener('change', () => onChange?.(select.value));
  return {
    node: el('div', { class: 'field' },
      el('label', { class: 't-overline field__label', for: id }, label),
      el('div', { class: 'field__control' }, select, el('span', { class: 'field__trail' }, icon('expand_more'))),
      helper ? el('div', { class: 't-small field__helper' }, helper) : null,
    ),
    select,
  };
}

export function inlineError() {
  const node = el('div', { class: 'inline-error', 'aria-live': 'polite' });
  return {
    node,
    set(msg) { node.replaceChildren(...(msg ? [icon('error'), el('span', {}, msg)] : [])); },
  };
}

/* ---------- Banner ---------- */

export function banner({ iconName = 'info', title, body }) {
  return el('div', { class: 'banner', role: 'status' },
    icon(iconName),
    el('div', { class: 'banner__text' },
      el('span', { class: 't-body-strong' }, title),
      body ? el('span', { class: 't-small' }, body) : null,
    ),
  );
}

/* ---------- Progress ---------- */

export function progress(total, done, { label } = {}) {
  const p = el('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(done), 'aria-label': label || `Step ${done} of ${total}` });
  p.style.setProperty('--segments', total);
  for (let i = 0; i < total; i++) {
    const seg = el('span', { class: 'progress__seg' });
    p.append(seg);
    // Fill after mount so the segment animates in.
    if (i < done - 1) seg.classList.add('is-done');
    else if (i === done - 1) requestAnimationFrame(() => requestAnimationFrame(() => seg.classList.add('is-done')));
  }
  return p;
}

/* ---------- Top bar ---------- */

export function topBar({ title, onBack, action, actionLabel, onAction, actionAriaLabel } = {}) {
  const bar = el('header', { class: 'topbar' });
  if (onBack) {
    const back = el('button', { type: 'button', class: 'topbar__back', 'aria-label': 'Back' }, icon('arrow_back'));
    pressable(back, onBack);
    bar.append(back);
  }
  bar.append(el('h1', { class: 't-title topbar__title' }, title || ''));
  if (action) bar.append(action);
  else if (actionLabel) bar.append(button(actionLabel, { variant: 'ghost', onClick: onAction, ariaLabel: actionAriaLabel }));
  return bar;
}

export function greetingBar(title, { action } = {}) {
  return el('header', { class: 'topbar topbar--greeting' },
    el('h1', { class: 't-h2 topbar__title' }, title),
    action || el('span', { class: 'avatar', 'aria-hidden': 'true' }),
  );
}

export function titleBar(title, { actionLabel, onAction } = {}) {
  return el('header', { class: 'topbar topbar--title' },
    el('h1', { class: 't-h2 topbar__title' }, title),
    actionLabel ? button(actionLabel, { variant: 'ghost', onClick: onAction }) : el('span', { class: 'avatar', 'aria-hidden': 'true' }),
  );
}

/* ---------- Bottom nav ---------- */

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'explore', label: 'Explore', icon: 'explore' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
  { id: 'moments', label: 'Moments', icon: 'photo_library' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export function bottomNav(active, onSelect) {
  const nav = el('nav', { class: 'bottom-nav', 'aria-label': 'Main' });
  NAV_ITEMS.forEach((item) => {
    const isActive = item.id === active;
    const b = el('button', { type: 'button', class: 'bottom-nav__item', 'aria-current': isActive ? 'page' : null },
      el('span', { class: 'bottom-nav__pill' }, icon(item.icon, { filled: isActive })),
      el('span', {}, item.label),
    );
    pressable(b, () => onSelect(item.id));
    nav.append(b);
  });
  return nav;
}

/* ---------- Asset slot ---------- */

// An image with a designed fallback: tag-colour block plus a centred icon.
export function slot({ src, alt = '', fallback = { tag: 'sky', icon: 'image' }, cls = '', width = 600, height = 400, eager = false, iconSize } = {}) {
  const box = el('div', { class: `slot ${cls}` });
  const showFallback = () => {
    box.replaceChildren(el('div', { class: `slot__fallback fill--${fallback.tag}`, role: alt ? 'img' : null, 'aria-label': alt || null },
      icon(fallback.icon, { size: iconSize })));
  };
  if (!src) { showFallback(); return box; }
  const img = el('img', { src, alt, width, height, loading: eager ? 'eager' : 'lazy', decoding: 'async' });
  img.addEventListener('error', showFallback, { once: true });
  box.append(img);
  return box;
}

export function refSlot(ref, opts = {}) {
  return slot({ src: data.illustrationPath(ref.illustration), alt: ref.alt, fallback: ref.fallback, ...opts });
}

// The SVG is inlined so dabba.css can animate its parts (an <img> cannot run
// CSS inside itself). Each file is fetched at most once. The wrapper holds the
// size from the start, so nothing jumps when the SVG lands. If the fetch fails
// (file://, offline) the plain <img> takes its place.
const mascotCache = new Map();

function mascotText(src) {
  if (!mascotCache.has(src)) {
    const p = fetch(src).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text(); });
    p.catch(() => mascotCache.delete(src));
    mascotCache.set(src, p);
  }
  return mascotCache.get(src);
}

export function mascot(dayMood, eveningMood, size, { alt = '', cls = '' } = {}) {
  const theme = currentTheme();
  const mood = theme === 'evening' ? eveningMood : dayMood;
  const src = `assets/mascot/dabba-${theme}-${mood}.svg`;
  const wrap = el('span', { class: `mascot ${cls}` });
  wrap.style.setProperty('--mascot-w', `${size}px`);
  if (alt) { wrap.setAttribute('role', 'img'); wrap.setAttribute('aria-label', alt); } else wrap.setAttribute('aria-hidden', 'true');

  const fallback = () => {
    const img = el('img', { src, alt: '', width: size, height: Math.round(size * 250 / 240), decoding: 'async' });
    img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true });
    wrap.replaceChildren(img);
  };
  mascotText(src).then((svgText) => {
    wrap.innerHTML = svgText;
    const svg = wrap.querySelector('svg');
    if (!svg) { fallback(); return; }
    svg.removeAttribute('role');
    svg.removeAttribute('aria-label');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.querySelector('metadata')?.remove();
  }, fallback);
  return wrap;
}

/* ---------- Polaroid (Moments) ---------- */

const TILT = ['r0', 'r1', 'r2', 'r3'];

// A printed photo. White in both themes on purpose (see components.css).
// No photo: the activity illustration fills the frame, which is the common case.
export function polaroid({ ref, photo, caption, meta, size = 'sm', index = 0, onOpen, ariaLabel } = {}) {
  const w = size === 'lg' ? 480 : 300;
  const media = photo
    ? slot({ src: data.photoPath(photo), alt: '', fallback: ref.fallback, cls: 'polaroid__img', width: w, height: Math.round(w * 3 / 4) })
    : refSlot(ref, { cls: 'polaroid__img', alt: '', width: w, height: Math.round(w * 3 / 4) });
  const card = el('button', {
    type: 'button',
    class: `polaroid polaroid--${size} polaroid--${TILT[index % 4]}`,
    'aria-label': ariaLabel || [caption, meta].filter(Boolean).join(', '),
  },
  media,
  el('span', { class: 'polaroid__caption' }, caption),
  meta ? el('span', { class: 't-caption polaroid__meta' }, meta) : null,
  );
  if (onOpen) pressable(card, onOpen);
  return card;
}

/* ---------- Compact row (Home secondary paths) ---------- */

export function compactRow({ iconName, tag = 'sky', title, actionLabel, onOpen }) {
  return listRow({
    thumb: iconThumb({ tag, icon: iconName }),
    title,
    lines: actionLabel ? [el('span', { class: 't-small-strong compact-row__action' }, actionLabel)] : [],
    trailing: el('span', { class: 'save-row__chev' }, icon('chevron_right')),
    onOpen,
    cls: 'compact-row',
    ariaLabel: actionLabel ? `${title} ${actionLabel}` : title,
  });
}

/* ---------- Cards ---------- */

export function heroCard({ overline, title, body, actionLabel, onAction, mascotNode }) {
  return el('section', { class: 'hero-card', 'aria-label': overline },
    el('div', { class: 'hero-card__head' },
      mascotNode,
      el('div', {},
        el('p', { class: 't-overline hero-card__overline' }, overline),
        el('h2', { class: 't-h2' }, title),
      ),
    ),
    body ? el('p', { class: 't-small hero-card__body' }, body) : null,
    actionLabel ? button(actionLabel, { onClick: onAction }) : null,
  );
}

export function sectionHead(title, { actionLabel, onAction } = {}) {
  return el('div', { class: 'section-head' },
    el('h2', { class: 't-h3' }, title),
    actionLabel ? button(actionLabel, { variant: 'ghost', onClick: onAction, cls: 't-small-strong' }) : null,
  );
}

export function emptyCard(title, body) {
  return el('div', { class: 'empty-card' },
    el('p', { class: 't-body-strong' }, title),
    el('p', { class: 't-small c-muted' }, body),
  );
}

export function saveToggle({ refKind, refId, title, onToast }) {
  const b = el('button', { type: 'button', class: 'idea-card__save' });
  const paint = () => {
    const on = store.isSaved(refKind, refId);
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? `Saved: ${title}` : `Save ${title}`);
    b.replaceChildren(icon('bookmark', { filled: on }));
  };
  paint();
  pressable(b, (e) => {
    e.stopPropagation();
    const nowSaved = store.toggleSave(refKind, refId);
    paint();
    b.firstChild.classList.add('pop-in');
    onToast?.(nowSaved, () => { store.toggleSave(refKind, refId); paint(); });
  });
  return b;
}

export function ideaCard(idea, { fitLine, fitCls = 'idea-card__fit', onOpen, onToast } = {}) {
  const meta = `${idea.minutes} min · ${store.postureLabel(idea.posture)} · ${idea.uses}`;
  const open = el('div', { class: 'idea-card__open', role: 'button', 'aria-label': `${idea.title}, ${meta}` },
    refSlot(idea, { cls: 'idea-card__thumb', width: 144, height: 144 }),
    el('div', { class: 'idea-card__text' },
      el('h3', { class: 't-title' }, idea.title),
      el('p', { class: 't-small c-secondary' }, meta),
      fitLine ? el('p', { class: `t-caption ${fitCls}` }, fitLine) : null,
    ),
  );
  pressable(open, () => onOpen?.(idea));
  return el('article', { class: 'card idea-card' }, open, saveToggle({ refKind: 'idea', refId: idea.id, title: idea.title, onToast }));
}

export function skeletonCard() {
  return el('div', { class: 'card skeleton-card', 'aria-hidden': 'true' },
    el('div', { class: 'skeleton skeleton-card__thumb' }),
    el('div', { class: 'skeleton-card__lines' },
      el('div', { class: 'skeleton skeleton-line skeleton-line--title' }),
      el('div', { class: 'skeleton skeleton-line skeleton-line--long' }),
      el('div', { class: 'skeleton skeleton-line skeleton-line--short' }),
    ),
  );
}

export function regularTile({ ref, title, caption, onOpen }) {
  const t = el('button', { type: 'button', class: 'regular-tile' },
    refSlot(ref, { cls: 'regular-tile__img', width: 360, height: 192 }),
    el('span', { class: 'regular-tile__text' },
      el('span', { class: 't-title' }, title),
      el('span', { class: 't-caption c-muted' }, caption),
    ),
  );
  pressable(t, onOpen);
  return t;
}

const SAVE_KIND = {
  reel: { label: 'Reel', tag: 'pink', icon: 'smart_display' },
  place: { label: 'Outing', tag: 'sky', icon: 'park' },
  idea: { label: 'Idea', tag: 'marigold', icon: 'lightbulb' },
  board: { label: 'Board', tag: 'leaf', icon: 'dashboard' },
};

export function saveRow(save, { onOpen } = {}) {
  const k = SAVE_KIND[save.kind] || SAVE_KIND.idea;
  const ref = save.refId ? data.findRef(save.refKind, save.refId) : { title: save.title };
  const r = el('button', { type: 'button', class: 'save-row' },
    el('span', { class: `save-row__thumb fill--${k.tag}` }, icon(k.icon)),
    el('span', { class: 'save-row__text' },
      el('span', { class: 't-overline save-row__type' }, k.label),
      el('span', { class: 't-title' }, save.title || ref.name || ref.title),
      el('span', { class: 't-small c-secondary' }, save.meta),
    ),
    el('span', { class: 'save-row__chev' }, icon('chevron_right')),
  );
  pressable(r, () => onOpen?.(save));
  return r;
}

/* ---------- Toasts ---------- */

export function toast(message, { actionLabel, onAction, duration = 2500 } = {}) {
  const region = document.getElementById('toast-region');
  const t = el('div', { class: 'toast', role: 'status' }, el('span', { class: 'toast__msg' }, message));
  let timer;
  const close = () => {
    clearTimeout(timer);
    t.classList.add('is-leaving');
    t.addEventListener('animationend', () => t.remove(), { once: true });
    setTimeout(() => t.remove(), 400);
  };
  if (actionLabel) {
    const a = el('button', { type: 'button', class: 'toast__action' }, actionLabel);
    a.addEventListener('click', () => { onAction?.(); close(); });
    t.append(a);
  }
  region.append(t);
  while (region.children.length > 3) region.firstChild.remove();
  timer = setTimeout(close, duration);
  return close;
}

export const comingSoon = () => toast('Coming soon');
export const simulated = (msg = 'Simulated') => toast(msg);

/* ---------- Bottom sheet ---------- */

// Opens a sheet over the current screen. Returns close().
export function openSheet(content, { label, onDismiss, dismissible = true } = {}) {
  const root = document.getElementById('sheet-root');
  const prevFocus = document.activeElement;
  const scrim = el('div', { class: 'sheet-scrim' });
  const handle = el('button', { type: 'button', class: 'sheet__handle', 'aria-label': 'Close' });
  const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': label }, handle, content);
  const layer = el('div', { class: 'sheet-layer' }, scrim, sheet);
  let closed = false;

  const close = (dismissed = false) => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    layer.classList.add('is-closing');
    setTimeout(() => layer.remove(), 240);
    document.getElementById('phone').classList.remove('sheet-open');
    if (prevFocus && prevFocus.isConnected) prevFocus.focus?.();
    if (dismissed) onDismiss?.();
  };

  const focusables = () => [...sheet.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((n) => !n.disabled && n.offsetParent !== null);

  function onKey(e) {
    if (e.key === 'Escape' && dismissible) { e.preventDefault(); close(true); }
    if (e.key === 'Tab') {
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  if (dismissible) {
    scrim.addEventListener('click', () => close(true));
    handle.addEventListener('click', () => close(true));
  } else {
    handle.setAttribute('tabindex', '-1');
  }
  document.addEventListener('keydown', onKey, true);
  root.append(layer);
  document.getElementById('phone').classList.add('sheet-open');
  requestAnimationFrame(() => (focusables()[1] || focusables()[0])?.focus({ preventScroll: true }));
  return close;
}

export function closeAllSheets() {
  const root = document.getElementById('sheet-root');
  root.replaceChildren();
  document.getElementById('phone').classList.remove('sheet-open');
}

export function confirmSheet({ title, body, confirmLabel, cancelLabel = 'Cancel', onConfirm }) {
  let close;
  const content = el('div', {},
    el('div', { class: 'sheet__head' }, el('h2', { class: 't-h2' }, title)),
    body ? el('p', { class: 't-body c-secondary' }, body) : null,
    el('div', { class: 'sheet__actions' },
      button(confirmLabel, { onClick: () => { close(); onConfirm(); } }),
      button(cancelLabel, { variant: 'ghost', onClick: () => close(true) }),
    ),
  );
  close = openSheet(content, { label: title });
}

/* ---------- Screen shell ---------- */

// A screen: optional top bar, a scrolling body and an optional pinned footer.
export function screenShell({ label, top, body = [], footer = null, bodyCls = '', cls = '' } = {}) {
  const bodyEl = el('div', { class: `screen__body ${bodyCls}` }, ...body);
  const scroll = el('div', { class: 'screen__scroll' }, bodyEl);
  const footerEl = footer ? el('div', { class: 'screen__footer' }, ...footer) : null;
  const node = el('section', { class: `screen ${cls}`, 'aria-label': label }, top || null, scroll, footerEl);
  return { node, scroll, bodyEl, footerEl };
}

/* ---------- Textarea field ---------- */

export function textareaField({ label, value = '', placeholder = '', helperInside, rows = 3, onInput } = {}) {
  const id = `f-${++fieldSeq}`;
  const errId = `${id}-err`;
  const area = el('textarea', { id, rows, placeholder, 'aria-describedby': errId });
  area.value = value;
  area.addEventListener('input', () => onInput?.(area.value));
  const err = el('div', { class: 'inline-error', id: errId, 'aria-live': 'polite' });
  const wrap = el('div', { class: 'field' },
    label ? el('label', { class: 't-overline field__label', for: id }, label) : null,
    el('div', { class: 'field__control field__control--area' }, area,
      helperInside ? el('span', { class: 't-caption c-muted field__inside' }, helperInside) : null),
    err,
  );
  if (!label) area.setAttribute('aria-label', helperInside || placeholder);
  return {
    node: wrap, input: area,
    setError(msg) {
      wrap.classList.toggle('is-error', !!msg);
      area.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.replaceChildren(...(msg ? [icon('error'), el('span', {}, msg)] : []));
    },
  };
}

/* ---------- Checkbox row (C10) ---------- */

export function checkboxRow(label, { checked = false, onChange } = {}) {
  let on = checked;
  const box = el('span', { class: 'checkbox__box', 'aria-hidden': 'true' });
  const row = el('button', { type: 'button', class: 'checkbox-row', role: 'checkbox', 'aria-checked': String(on) }, box, el('span', { class: 't-body' }, label));
  const paint = (animate) => {
    row.setAttribute('aria-checked', String(on));
    box.replaceChildren(...(on ? [icon('check', { size: 18 })] : []));
    if (on && animate) box.firstChild.classList.add('pop-in');
  };
  paint(false);
  pressable(row, () => { on = !on; paint(true); onChange?.(on); });
  return { node: row, get: () => on };
}

/* ---------- Switch row (E4) ---------- */

export function switchRow({ title, sub, checked = false, disabled = false, onChange }) {
  const sw = el('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(!!checked), 'aria-label': title, 'aria-disabled': disabled ? 'true' : null });
  if (!disabled) {
    pressable(sw, () => {
      const next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(next));
      onChange?.(next);
    });
  }
  return el('div', { class: 'card setting-row' + (disabled ? ' is-disabled' : '') },
    el('div', { class: 'setting-row__text' },
      el('span', { class: 't-title' }, title),
      sub ? el('span', { class: 't-small c-muted' }, sub) : null,
    ),
    sw,
  );
}

/* ---------- List row: thumb, title, meta, optional trailing ---------- */

export function listRow({ thumb, title, lines = [], trailing, onOpen, cls = '', ariaLabel }) {
  const row = el(onOpen ? 'div' : 'article', { class: `card list-row ${cls}`, role: onOpen ? 'button' : null, 'aria-label': onOpen ? (ariaLabel || title) : null },
    thumb || null,
    el('div', { class: 'list-row__text' },
      el('span', { class: 't-title' }, title),
      ...lines.map((l) => (typeof l === 'string' ? el('span', { class: 't-small c-secondary' }, l) : l)),
    ),
    trailing || null,
  );
  if (onOpen) pressable(row, onOpen);
  return row;
}

export function iconThumb(fallback) {
  return el('span', { class: `list-row__icon fill--${fallback.tag}` }, icon(fallback.icon));
}

/* ---------- Place card (C4) ---------- */

export function placeCard(place, { tagLabel, tagColor = 'leaf', onOpen } = {}) {
  const fill = (t) => store.fill(t);
  const media = el('div', { class: 'place-card__media' },
    refSlot(place, { cls: 'place-card__img', width: 700, height: 300, iconSize: 48 }),
    tagLabel ? el('span', { class: `tag tag--${tagColor} place-card__tag` }, tagLabel) : null,
  );
  const cost = place.costForThree ? String(place.costForThree) : 'Free';
  const card = el('article', { class: 'place-card', role: 'button', 'aria-label': `${place.displayName || place.name}, ${place.description}` },
    media,
    el('div', { class: 'place-card__body' },
      el('h3', { class: 't-h3' }, place.displayName || place.name),
      el('p', { class: 't-small c-secondary' }, fill(place.description)),
      el('p', { class: 'place-card__meta t-small c-secondary' },
        el('span', {}, icon('schedule', { size: 18 }), `${place.travelMin} min there, ${place.stayHours} hrs stay`),
        el('span', {}, icon('currency_rupee', { size: 18 }), place.costForThree ? `${cost} for three` : cost),
      ),
    ),
  );
  pressable(card, () => onOpen?.(place));
  return card;
}

/* ---------- Edit a single text value in a sheet ---------- */

// Used for names (A8, E8) and moment captions. Save runs onSave(value) and
// closes; an empty value shows emptyError instead.
export function editTextSheet({ title, label, value = '', multiline = false, emptyError, saveLabel = 'Save', onSave }) {
  let close;
  const f = multiline
    ? textareaField({ label, value, rows: 3, onInput: () => f.setError('') })
    : field({ label, value, autocomplete: 'off', onInput: () => f.setError('') });
  const save = () => {
    const v = f.input.value.trim();
    if (!v && emptyError) { f.setError(emptyError); f.input.focus(); return; }
    close();
    onSave?.(v);
  };
  if (!multiline) f.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
  const content = el('div', {},
    el('div', { class: 'sheet__head' }, el('h2', { class: 't-h2' }, title)),
    f.node,
    el('div', { class: 'sheet__actions' },
      button(saveLabel, { onClick: save }),
      button('Cancel', { variant: 'ghost', onClick: () => close(true) }),
    ),
  );
  close = openSheet(content, { label: title });
  requestAnimationFrame(() => f.input.focus({ preventScroll: true }));
}
