// Lane D: capture from Instagram (D1 to D8). D6 is a Home lead card, saveBackCard() in c.js.

import * as data from '../data.js';
import * as store from '../store.js';
import * as router from '../router.js';
import { icon } from '../icons.js';
import {
  el, button, chipGroup, chipRadioGroup, field, textareaField, inlineError, topBar, titleBar, banner,
  mascot, refSlot, slot, emptyCard, listRow, toast, comingSoon, simulated, confirmSheet, screenShell, pressable,
} from '../components.js';
import { openPlace } from './c.js';

const fill = (t) => store.fill(t);

function reelBlock(cls = '') {
  return el('div', { class: `reel-block fill--pink ${cls}`, role: 'img', 'aria-label': 'Reel preview' },
    icon('smart_display', { size: 40 }),
    el('span', { class: 't-caption' }, 'Reel preview'),
  );
}

function discard() {
  confirmSheet({
    title: 'Discard this reel?',
    body: 'Nothing from it is saved.',
    confirmLabel: 'Discard',
    onConfirm: () => {
      router.navigate('d5', { transition: 'fade', replace: true });
      router.resetStack();
      toast('Discarded');
    },
  });
}

function savingTop({ withDiscard = false, back = 'd5' } = {}) {
  return topBar({
    title: 'Saving from Instagram',
    onBack: () => router.back(back),
    actionLabel: withDiscard ? 'Discard' : null,
    onAction: withDiscard ? discard : null,
  });
}

/* ---------- D1 Instagram share sheet (simulated) ---------- */
export function d1(route) {
  const reelId = route.query.reel === '2' ? 2 : 1;
  const target = (label, iconNode, onClick, cls = '') => {
    const b = el('button', { type: 'button', class: 'share__target' },
      el('span', { class: `share__icon ${cls}` }, iconNode),
      el('span', { class: 't-caption' }, label),
    );
    pressable(b, onClick);
    return b;
  };
  const toDabble = () => {
    store.update((st) => { st.reel = { id: reelId, tags: [], placeName: '', note: '' }; });
    router.navigate('d2');
  };
  const node = el('section', { class: 'screen share', 'aria-label': 'Instagram share sheet, simulated' },
    el('div', { class: 'share__reel' }, reelBlock('share__reel-block')),
    el('div', { class: 'share__sheet', role: 'dialog', 'aria-label': 'Share to' },
      el('h1', { class: 't-title' }, 'Share to'),
      el('div', { class: 'share__targets' },
        target('Dabble', el('img', { src: 'logo-mark.png', width: 40, height: 40, alt: '', decoding: 'async' }), toDabble, 'share__icon--dabble'),
        target('WhatsApp', icon('chat'), () => simulated()),
        target('Copy', icon('link'), () => simulated()),
        target('More', icon('more_horiz'), () => simulated()),
      ),
      el('p', { class: 't-small share__hint' }, 'Sharing to Dabble saves the place or the idea, not the video.'),
    ),
  );
  return { node, chrome: 'lock', brand: false };
}

/* ---------- D2 Reading the reel ---------- */
export function d2() {
  const reel = data.reels[store.get().reel.id] || data.reels[1];
  const rows = data.reelChecks.map((label) => {
    const state = el('span', { class: 'check-row__state t-caption c-muted' }, el('span', { class: 'dots', 'aria-hidden': 'true' }, '...'));
    const row = el('li', { class: 'card check-row' }, el('span', { class: 't-body' }, label), state);
    return { row, state, label };
  });
  const status = el('p', { class: 'sr-only', 'aria-live': 'polite' });
  let timers = [];

  const { node } = screenShell({
    label: 'Reading the reel',
    top: topBar({ title: 'Saving from Instagram', onBack: () => router.back('d5') }),
    body: [
      reelBlock('reel-thumb'),
      el('div', { class: 'reading' },
        mascot('thinking', 'sleepy', 120),
        el('h1', { class: 't-h2' }, 'Reading the reel'),
        el('p', { class: 't-small c-secondary' }, 'Looking for a place name, an address, or an activity we can turn into steps.'),
      ),
      el('ul', { class: 'stack-sm' }, ...rows.map((r) => r.row)),
      status,
    ],
    footer: [button('Cancel', {
      variant: 'secondary',
      onClick: () => { timers.forEach(clearTimeout); router.navigate('d5', { transition: 'fade', replace: true }); router.resetStack(); },
    })],
  });

  return {
    node,
    onMount() {
      rows.forEach((r, i) => {
        timers.push(setTimeout(() => {
          if (!node.isConnected) return;
          const ok = reel.checks[i] === 'done';
          r.state.replaceChildren(
            el('span', { class: 'check-row__done' + (ok ? '' : ' is-miss') }, icon(ok ? 'check_circle' : 'cancel', { filled: true, size: 20 }), ok ? 'done' : 'not found'),
          );
          r.state.firstChild.querySelector('.icon').classList.add('pop-in');
          status.textContent = `${r.label}: ${ok ? 'done' : 'not found'}`;
        }, 550 + i * 550));
      });
      timers.push(setTimeout(() => {
        if (!node.isConnected) return;
        router.navigate(reel.placeId ? 'd3' : 'd4', { replace: true });
      }, 550 + rows.length * 550 + 400));
    },
  };
}

/* ---------- D3 Confirm and tag ---------- */
export function d3() {
  const reel = data.reels[1];
  const place = data.findPlace(reel.placeId);
  let name = place.name;
  const nameEl = el('p', { class: 't-title' }, name);
  const editField = field({ label: 'Place name', value: name, onInput: (v) => { name = v; nameEl.textContent = v || place.name; } });
  editField.node.hidden = true;

  const right = chipRadioGroup([{ id: 'yes', label: 'Yes, save it' }, { id: 'edit', label: 'Edit' }], {
    selected: 'yes', label: 'Is that right?', fill: 2,
    onChange: (v) => {
      editField.node.hidden = v !== 'edit';
      if (v === 'edit') editField.input.focus();
    },
  });
  const tags = chipGroup(data.reelTags, { selected: reel.tags, label: 'Tags' });

  const save = (toBoard = false) => {
    store.update((st) => {
      const i = st.saves.findIndex((x) => x.refKind === 'place' && x.refId === place.id);
      const existing = i >= 0 ? st.saves.splice(i, 1)[0] : null;
      st.saves.unshift({
        ...(existing || { id: `s-${Date.now()}`, kind: 'place', refKind: 'place', refId: place.id, meta: '6 km · free · both of you in' }),
        source: 'instagram', savedAt: new Date().toISOString(), tags: tags.get(),
        title: name.trim() && name.trim() !== place.name ? name.trim() : undefined,
        sourceLine: 'Place · from a reel, just now', wantMeta: '6 km · free · both of you in', wantRank: 0, onHome: true,
      });
      if (toBoard && !st.occasion.candidates.includes(place.id)) st.occasion.candidates.push(place.id);
    });
    if (toBoard) {
      toast(`Added to ${fill(store.get().occasion.title)}`);
      router.navigate('d7', { replace: true });
    } else {
      toast('Saved to Want to try');
      router.navigate('d5', { transition: 'fade', replace: true });
      router.resetStack();
    }
  };

  const { node } = screenShell({
    label: 'Confirm and tag',
    top: savingTop({ withDiscard: true }),
    body: [
      el('section', { class: 'surface-card found' },
        el('p', { class: 't-overline c-muted' }, 'We found a place'),
        nameEl,
        el('p', { class: 't-small c-secondary' }, reel.placeLine),
      ),
      el('h2', { class: 't-h3 d__head' }, 'Is that right?'),
      right.node,
      editField.node,
      el('h2', { class: 't-h3 d__head' }, 'Tags'),
      el('p', { class: 't-small c-muted d__sub' }, 'So it comes back at the right moment.'),
      tags.node,
      el('section', { class: 'surface-card found found--fit' },
        el('p', { class: 't-overline c-muted' }, fill('Fit for {child}, filled in for you')),
        el('p', { class: 't-small c-secondary' }, reel.fit),
      ),
    ],
    footer: [
      button('Save to Want to try', { onClick: () => save(false) }),
      button('Also add to an occasion board', { variant: 'ghost', cls: 't-small-strong', onClick: () => save(true) }),
    ],
  });
  return { node };
}

/* ---------- D4 Could not read the reel ---------- */
export function d4() {
  const reel = data.reels[2];
  const err = inlineError();
  const note = textareaField({ value: reel.caption, helperInside: 'Your note', rows: 2, onInput: () => err.set('') });
  const name = field({ label: 'Place name', placeholder: 'Start typing', onInput: () => err.set('') });
  name.node.querySelector('label').classList.add('sr-only');

  const save = () => {
    const n = note.input.value.trim();
    const p = name.input.value.trim();
    if (!n && !p) { err.set('Add a note or a place name'); note.input.focus(); return; }
    store.update((st) => {
      st.saves.unshift({
        id: `s-${Date.now()}`, kind: 'reel', refKind: null, refId: null, source: 'instagram', savedAt: new Date().toISOString(),
        title: p || n, meta: p ? 'Your note: ' + (n || 'none') : 'We will match it when you add a name', tags: [],
        sourceLine: 'Reel · from a reel, just now', wantMeta: p ? 'We will match it to a place' : 'Your note only', wantRank: 0, onHome: true,
      });
    });
    toast('Saved to Want to try');
    router.navigate('d5', { transition: 'fade', replace: true });
    router.resetStack();
  };

  const { node } = screenShell({
    label: 'Could not read the reel',
    top: savingTop({ withDiscard: true }),
    body: [
      banner({ iconName: 'location_off', title: 'We could not find a place in this one', body: 'No location tag, and the audio did not name anywhere.' }),
      el('h1', { class: 't-h3 d__head' }, 'Save it anyway?'),
      el('p', { class: 't-small c-secondary d__sub' }, 'Keep the reel with your own note, and we will match it later if you add a name.'),
      note.node,
      el('h2', { class: 't-h3 d__head' }, 'Or type the place name'),
      name.node,
      err.node,
    ],
    footer: [
      button('Save with my note', { onClick: save }),
      button('Discard', { variant: 'secondary', onClick: discard }),
    ],
  });
  return { node };
}

/* ---------- D5 Saved, Want to try ---------- */
export function savedTabs(active) {
  const tabs = chipRadioGroup([
    { id: 'want', label: 'Want to try' },
    { id: 'regulars', label: 'Our regulars' },
    { id: 'occasions', label: 'Occasions' },
  ], {
    selected: active, label: 'Saved sections',
    onChange: (v) => {
      const to = { want: 'd5', regulars: 'b14', occasions: 'd7' }[v];
      router.navigate(to, { transition: 'fade', replace: true });
    },
  });
  tabs.node.classList.add('saved-tabs');
  return tabs.node;
}

export function d5() {
  const s = store.get();
  const list = s.saves
    .filter((x) => x.wantRank !== null)
    .map((x, i) => ({ x, i }))
    .sort((a, b) => {
      const ra = a.x.wantRank ?? -1;
      const rb = b.x.wantRank ?? -1;
      return ra - rb || a.i - b.i;
    })
    .map((o) => o.x);

  const rows = list.map((sv) => {
    const ref = sv.refId ? data.findRef(sv.refKind, sv.refId) : null;
    const title = sv.title || (ref ? (sv.refKind === 'place' ? data.listName(ref) : ref.title) : 'Saved reel');
    const thumb = ref
      ? refSlot(ref, { cls: 'list-row__thumb', width: 144, height: 144 })
      : slot({ src: null, alt: 'Reel', fallback: { tag: 'pink', icon: 'smart_display' }, cls: 'list-row__thumb' });
    const plan = () => {
      if (!ref) { toast('Add a place name to plan it'); return; }
      if (sv.refKind === 'idea') router.navigate(`b8/${ref.id}`);
      else openPlace(ref.id);
    };
    const planBtn = button('Plan it', { variant: 'ghost', cls: 'want__plan t-small-strong', onClick: (e) => { e.stopPropagation(); plan(); } });
    return listRow({
      thumb, title,
      lines: [
        el('span', { class: 't-caption c-muted' }, sv.sourceLine || ''),
        el('span', { class: 't-small c-secondary' }, sv.wantMeta || sv.meta || ''),
        planBtn,
      ],
      onOpen: plan,
    });
  });

  const { node } = screenShell({
    label: 'Saved',
    top: titleBar('Saved'),
    body: [
      savedTabs('want'),
      el('p', { class: 't-small c-muted want__count' }, data.savedCountLine),
      rows.length ? el('div', { class: 'stack-md' }, ...rows)
        : emptyCard('Nothing saved yet', 'Share a reel to Dabble, or save a place or an idea, and it waits here until a day fits it.'),
    ],
  });
  return { node, nav: 'saved' };
}

/* ---------- D7 Occasion board ---------- */
export function d7() {
  const s = store.get();
  const occ = s.occasion;
  const err = inlineError();

  const rows = occ.candidates.map((id) => {
    const p = data.findPlace(id);
    const on = occ.shortlist.includes(id);
    const state = el('span', { class: 't-small-strong board__state' + (on ? '' : ' c-muted') },
      on ? icon('check', { size: 18 }) : icon('add', { size: 18 }), on ? 'On the shortlist' : 'Add to shortlist');
    const row = listRow({
      thumb: refSlot(p, { cls: 'list-row__thumb', width: 144, height: 144 }),
      title: data.listName(p),
      lines: [p.boardMeta || store.placeMetaLine(p), state],
      cls: on ? 'is-selected' : '',
      ariaLabel: `${data.listName(p)}, ${on ? 'on the shortlist' : 'not on the shortlist'}`,
      onOpen: () => {
        store.update((st) => {
          const sl = st.occasion.shortlist;
          const i = sl.indexOf(id);
          if (i >= 0) sl.splice(i, 1); else sl.push(id);
        });
        err.set('');
        router.refresh();
      },
    });
    row.setAttribute('role', 'checkbox');
    row.setAttribute('aria-checked', String(on));
    return row;
  });

  const add = el('button', { type: 'button', class: 'dashed-btn' }, icon('add'), el('span', {}, 'Add from Want to try, or search'));
  pressable(add, comingSoon);

  const send = () => {
    if (!store.get().occasion.shortlist.length) { err.set('Add at least one place to the shortlist'); return; }
    store.update((st) => { st.occasion.sent = true; });
    toast(`Sent to ${store.get().adults.filter((a) => !a.isUser).map((a) => a.name).join(' and ')} (simulated)`);
    router.navigate('d8');
  };

  const others = s.adults.filter((a) => !a.isUser).map((a) => a.name).join(' and ');
  const { node } = screenShell({
    label: fill(occ.title),
    top: topBar({ title: fill(occ.title), onBack: () => router.back('d5'), actionLabel: 'Share', onAction: comingSoon }),
    body: [
      el('p', { class: 't-small c-muted' }, occ.dateLine),
      el('h1', { class: 't-h3 board__head' }, 'Pulled from your saves'),
      el('p', { class: 't-small c-secondary d__sub' }, fill(occ.intro)),
      el('div', { class: 'stack-md', role: 'group', 'aria-label': 'Shortlist' }, ...rows),
      el('div', { class: 'board__add' }, add),
      err.node,
      el('div', { class: 'results__actions' }, button(`Send to ${others} to pick`, { onClick: send })),
    ],
  });
  return { node, nav: 'saved' };
}

/* ---------- D8 Board, votes back ---------- */
export function d8() {
  const s = store.get();
  const occ = s.occasion;
  const voters = s.adults.filter((a) => !a.isUser);
  const tally = {};
  voters.forEach((a) => {
    let pick = occ.votes[a.id];
    if (!occ.shortlist.includes(pick)) pick = occ.shortlist[0];
    if (pick) (tally[pick] = tally[pick] || []).push(a);
  });
  const winnerId = Object.keys(tally).sort((a, b) => tally[b].length - tally[a].length)[0] || occ.candidates[0];
  const winner = data.findPlace(winnerId);
  const others = occ.candidates.filter((id) => id !== winnerId).map((id) => data.findPlace(id));
  const picked = Object.values(tally).reduce((n, a) => n + a.length, 0);

  const pickers = el('div', { class: 'voters' }, ...(tally[winnerId] || []).map((a) => el('span', { class: 'voter' },
    el('span', { class: 'voter__avatar', 'aria-hidden': 'true' }, a.name.slice(0, 1)),
    el('span', { class: 't-caption' }, a.name),
  )));

  const keep = () => {
    others.forEach((p) => { if (!store.isSaved('place', p.id)) store.toggleSave('place', p.id); });
    toast('Kept in Want to try');
    router.navigate('d5', { transition: 'fade', replace: true });
  };

  const { node } = screenShell({
    label: `${fill(occ.title)}, votes`,
    top: topBar({ title: fill(occ.title), onBack: () => router.back('d7'), actionLabel: 'Share', onAction: comingSoon }),
    body: [
      el('p', { class: 't-small c-muted' }, `${picked} of ${voters.length} have picked`),
      listRow({
        thumb: refSlot(winner, { cls: 'list-row__thumb', width: 144, height: 144 }),
        title: data.listName(winner),
        lines: [winner.boardMeta || store.placeMetaLine(winner), pickers],
        cls: 'is-selected board__winner',
        onOpen: () => openPlace(winner.id),
      }),
      el('h2', { class: 't-small-strong c-muted board__not' }, 'Not picked'),
      el('div', { class: 'stack-md' }, ...others.map((p) => listRow({
        thumb: refSlot(p, { cls: 'list-row__thumb list-row__thumb--sm', width: 96, height: 96 }),
        title: p.name, cls: 'board__other',
        onOpen: () => openPlace(p.id),
      }))),
      el('div', { class: 'results__actions' },
        button('Plan the birthday morning', { onClick: () => router.navigate(`c9/${winner.id}`) }),
        button('Keep the others saved', { variant: 'secondary', onClick: keep }),
      ),
    ],
  });
  return { node, nav: 'saved' };
}
