// Prototype controls. The only UI outside the design.
// Wide screens: a panel beside the phone. Phones: long-press the status bar clock for 1s.

import * as store from './store.js';
import * as router from './router.js';
import { icon } from './icons.js';
import { el, button, chipRadioGroup, pressable, confirmSheet, toast } from './components.js';

let panel;

function toggleRow(label, key) {
  const raw = store.get().settings[key];
  const on = key === 'demoSaveDue' && (raw === null || raw === undefined) ? new Date().getDay() === 6 : !!raw;
  const sw = el('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(on), 'aria-label': label });
  pressable(sw, () => {
    const next = sw.getAttribute('aria-checked') !== 'true';
    store.update((s) => {
      s.settings[key] = next;
      if (key === 'demoSaveDue' && next) s.saveBackDismissedUntil = 0;
    });
    sw.setAttribute('aria-checked', String(next));
    const id = router.current().id;
    if (['b6', 'b16', 'b12', 'e5', 'home', 'c1', 'd6', 'b2', 'a12', 'c4', 'c16'].includes(id)) router.refresh();
  });
  return el('div', { class: 'demo__row' }, el('span', { class: 't-small-strong' }, label), sw);
}

function showSplash() {
  const splash = document.getElementById('splash');
  splash.classList.remove('is-done');
  setTimeout(() => splash.classList.add('is-done'), 1200);
}

function startLane(lane) {
  if (lane === 'a') {
    store.reset('blank');
    store.update((s) => { s.settings.themeOverride = 'auto'; });
    showSplash();
    router.navigate('a1', { transition: 'fade', replace: true });
  } else if (lane === 'b') {
    store.reset('seeded');
    store.update((s) => { s.settings.themeOverride = 'evening'; });
    router.navigate('b1', { transition: 'fade', replace: true });
  } else if (lane === 'c') {
    store.reset('seeded');
    store.update((s) => { s.settings.themeOverride = 'day'; s.settings.demoSaveDue = false; s.settings.demoLead = 'weekend'; });
    router.navigate('home', { transition: 'fade', replace: true });
  } else {
    store.reset('seeded');
    store.update((s) => { s.settings.themeOverride = 'day'; s.settings.demoSaveDue = false; s.settings.demoLead = 'weekend'; });
    router.navigate(lane === 'd2' ? 'd1?reel=2' : 'd1', { transition: 'fade', replace: true });
  }
  setTimeout(() => router.resetStack(), 50);
  close();
  render();
}

function render() {
  const s = store.get();
  const theme = chipRadioGroup([
    { id: 'auto', label: 'Auto' },
    { id: 'day', label: 'Day' },
    { id: 'evening', label: 'Evening' },
  ], {
    selected: s.settings.themeOverride, label: 'Theme',
    onChange: (v) => { store.update((st) => { st.settings.themeOverride = v; }); },
  });
  theme.node.classList.add('segmented');

  const closeBtn = el('button', { type: 'button', class: 'btn btn--ghost demo__close', 'aria-label': 'Close prototype controls' }, icon('close'));
  pressable(closeBtn, close);

  panel.replaceChildren(
    el('div', { class: 'demo__row' }, el('h2', { class: 't-overline c-muted' }, 'Prototype controls'), closeBtn),
    el('div', { class: 'demo__group' },
      el('p', { class: 't-small-strong' }, 'Start a lane'),
      button('Full run (A1)', { variant: 'secondary', onClick: () => startLane('a') }),
      button('Weekday evening (B1)', { variant: 'secondary', onClick: () => startLane('b') }),
      button('Weekend outing (C1)', { variant: 'secondary', onClick: () => startLane('c') }),
      button('Capture from Instagram (D1)', { variant: 'secondary', onClick: () => startLane('d') }),
      button('Unreadable reel (D1, no location)', { variant: 'secondary', onClick: () => startLane('d2') }),
    ),
    el('div', { class: 'demo__group' }, el('p', { class: 't-small-strong' }, 'Theme'), theme.node),
    el('div', { class: 'demo__group' },
      toggleRow('Offline', 'demoOffline'),
      toggleRow('Location off', 'demoLocationOff'),
      toggleRow('A save is due', 'demoSaveDue'),
      toggleRow('Empty Moments', 'demoEmptyMoments'),
      button('Simulate an error', { variant: 'secondary', onClick: () => { close(); router.navigate('e6'); } }),
    ),
    el('div', { class: 'demo__group' },
      el('p', { class: 't-small demo__hint' }, 'Demo code for sign-in'),
      el('p', { class: 'demo__code' }, '246810'),
    ),
    el('div', { class: 'demo__group' },
      button('Reset demo data', {
        variant: 'ghost',
        onClick: () => {
          close();
          confirmSheet({
            title: 'Reset demo data?',
            body: 'Everything you set up and saved in this prototype goes back to the start.',
            confirmLabel: 'Reset demo',
            onConfirm: () => { startLane('a'); toast('Demo reset'); },
          });
        },
      }),
    ),
  );
}

export function open() { panel.classList.add('is-open'); }
export function close() { panel.classList.remove('is-open'); }

export function init() {
  panel = document.getElementById('demo');
  render();
  store.subscribe(() => {
    // Keep the theme chips and toggles in step without stealing focus.
    if (!panel.contains(document.activeElement)) render();
  });

  // Long-press the clock for 1s to open on phones.
  const clock = document.getElementById('status-time');
  let timer = null;
  const cancel = () => { clearTimeout(timer); timer = null; };
  clock.addEventListener('pointerdown', () => { timer = setTimeout(open, 1000); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => clock.addEventListener(e, cancel));
  clock.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
