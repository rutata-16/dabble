// Lane E: supporting screens (E1 to E4, E6 to E8). E5 lives in b.js.

import * as data from '../data.js';
import * as store from '../store.js';
import * as router from '../router.js';
import { icon } from '../icons.js';
import {
  el, button, field, optionGroup, topBar, titleBar, mascot, refSlot, slot, emptyCard, listRow, iconThumb,
  switchRow, toast, comingSoon, confirmSheet, openSheet, screenShell, pressable,
} from '../components.js';
import { openPlace } from './c.js';
import { editAdultName } from './a.js';

const fill = (t) => store.fill(t);
const SHORT_INTEREST = { 'Soil and plants': 'soil' };
const SHORT_ENJOY = { 'Being outdoors': 'outdoors' };
const SHORT_AVOID = { 'Messy art': 'mess', 'Anything needing prep': 'prep' };

function joinAnd(list) {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function ideaRow(idea) {
  return listRow({
    thumb: refSlot(idea, { cls: 'list-row__thumb list-row__thumb--sm', width: 112, height: 112 }),
    title: idea.title,
    lines: [`${idea.minutes} min · ${store.postureLabel(idea.posture)}`],
    onOpen: () => router.navigate(`b8/${idea.id}`),
  });
}

function placeRow(place, { title, meta } = {}) {
  return listRow({
    thumb: refSlot(place, { cls: 'list-row__thumb list-row__thumb--sm', width: 112, height: 112 }),
    title: title || data.listName(place),
    lines: [meta || place.boardMeta || store.placeMetaLine(place)],
    onOpen: () => openPlace(place.id),
  });
}

/* ---------- E1 Explore ---------- */
export function e1() {
  const s = store.get();
  const child = s.child;
  const results = el('div', { class: 'explore__results', 'aria-live': 'polite' });
  const sections = el('div', {});

  const search = field({ label: 'Search ideas and places', placeholder: 'Search ideas and places', type: 'search', prefix: icon('search'), autocomplete: 'off' });
  search.node.classList.add('search-field');
  search.node.querySelector('label').classList.add('sr-only');

  const runSearch = () => {
    const q = search.input.value.trim().toLowerCase();
    if (!q) { results.replaceChildren(); sections.hidden = false; return; }
    const ideas = data.ideas.filter((i) => i.title.toLowerCase().includes(q));
    const places = data.places.filter((p) => p.name.toLowerCase().includes(q) || data.placeName(p).toLowerCase().includes(q));
    if (!ideas.length && !places.length) {
      results.replaceChildren(el('p', { class: 't-small c-secondary explore__none' }, 'Nothing matches that yet. Try an interest below.'));
      sections.hidden = false;
      return;
    }
    sections.hidden = true;
    results.replaceChildren(el('div', { class: 'stack-md' }, ...ideas.map(ideaRow), ...places.map((p) => placeRow(p, { title: data.placeName(p) }))));
  };
  search.input.addEventListener('input', runSearch);

  const mine = data.interestTiles.filter((t) => child.interests.includes(t.id));
  const tiles = (mine.length ? mine : data.interestTiles).map((t) => {
    const b = el('button', { type: 'button', class: `interest-tile fill--${t.fallback.tag}`, 'aria-label': t.id },
      slot({ src: data.illustrationPath(t.file), alt: '', fallback: t.fallback, cls: 'interest-tile__img', width: 240, height: 240 }),
      el('span', { class: 't-small-strong' }, t.id),
    );
    pressable(b, () => router.navigate(`e2/${encodeURIComponent(t.id)}`));
    return b;
  });

  const kinds = data.kindTiles.map((k) => {
    const b = el('button', { type: 'button', class: 'card kind-tile' },
      iconThumb(k.fallback),
      el('span', { class: 't-title' }, k.title),
      el('span', { class: 't-caption c-muted' }, k.count),
    );
    pressable(b, () => (k.id === 'out' ? router.navigate('c2/1') : router.navigate(`e2?kind=${k.id}`)));
    return b;
  });

  const nursery = data.findPlace('nursery-8th-main');
  sections.append(
    el('h2', { class: 't-h3 explore__head' }, fill('Because {child} likes')),
    el('div', { class: 'interest-row hscroll' }, ...tiles),
    el('h2', { class: 't-h3 explore__head' }, 'What kind of thing'),
    el('div', { class: 'kind-grid' }, ...kinds),
    el('h2', { class: 't-h3 explore__head' }, 'Ordinary places near you'),
    el('p', { class: 't-small c-secondary d__sub' }, 'Nothing special about them. We have things to do there.'),
    el('div', { class: 'stack-md' },
      listRow({
        thumb: refSlot(nursery, { cls: 'list-row__thumb list-row__thumb--sm', width: 112, height: 112 }),
        title: data.placeName(nursery), lines: [`${nursery.travelMin} min · ${nursery.thingsCount} things to do`],
        onOpen: () => router.navigate(`c12/${nursery.id}`),
      }),
      listRow({
        thumb: slot({ src: null, alt: '', fallback: data.metroPlace.fallback, cls: 'list-row__thumb list-row__thumb--sm' }),
        title: data.metroPlace.name, lines: [data.metroPlace.line],
        onOpen: comingSoon,
      }),
    ),
  );

  const { node } = screenShell({
    label: 'Explore',
    top: titleBar('Explore'),
    body: [search.node, results, sections],
  });
  return { node, nav: 'explore' };
}

/* ---------- E2 Interest thread ---------- */
export function e2(route) {
  const kindId = route.query.kind;
  const kind = data.kindTiles.find((k) => k.id === kindId);
  const interest = kind ? null : decodeURIComponent(route.params[0] || 'Animals');
  const title = kind ? kind.title : interest;

  const body = [];
  if (kind) {
    const ideas = data.ideas.filter((i) => i.posture === kind.id);
    body.push(el('h2', { class: 't-h3 explore__head' }, 'Tonight, at home'));
    body.push(ideas.length ? el('div', { class: 'stack-md' }, ...ideas.map(ideaRow)) : emptyCard('Nothing here yet', 'Try an interest instead.'));
  } else {
    const ideas = data.ideas.filter((i) => i.interests.includes(interest));
    const near = data.interestNearby[interest];
    const nearPlace = near && data.findPlace(near.placeId);
    const far = data.places.filter((p) => !p.ordinary && p.interests?.includes(interest)).sort((a, b) => (a.rank || 99) - (b.rank || 99))[0]
      || data.findPlace('lumbini-gardens');

    body.push(el('p', { class: 't-small c-secondary' }, 'One thread, three distances. Tonight at home, this week nearby, this weekend further out.'));
    body.push(el('h2', { class: 't-h3 explore__head' }, 'Tonight, at home'));
    body.push(ideas.length ? el('div', { class: 'stack-md' }, ...ideas.slice(0, 2).map(ideaRow)) : emptyCard('Nothing here yet', 'We are still adding ideas for this.'));
    if (nearPlace) {
      body.push(el('h2', { class: 't-h3 explore__head' }, 'This week, nearby'));
      body.push(listRow({
        thumb: refSlot(nearPlace, { cls: 'list-row__thumb list-row__thumb--sm', width: 112, height: 112 }),
        title: near.title, lines: [near.meta],
        onOpen: () => router.navigate(`c12/${nearPlace.id}`),
      }));
    }
    body.push(el('h2', { class: 't-h3 explore__head' }, 'This weekend, further out'));
    body.push(placeRow(far));
    body.push(el('div', { class: 'results__actions' }, button('Turn this into a birthday board', { variant: 'secondary', onClick: () => router.navigate('d7') })));
  }

  // Saving a thread is local to this prototype.
  const saveBtn = button('Save', { variant: 'ghost' });
  let saved = false;
  saveBtn.addEventListener('click', () => {
    saved = !saved;
    saveBtn.querySelector('span:last-child').textContent = saved ? 'Saved' : 'Save';
    saveBtn.setAttribute('aria-pressed', String(saved));
    toast(saved ? 'Saved' : 'Removed from saves');
  });

  const { node } = screenShell({
    label: title,
    top: topBar({ title, onBack: () => router.back('e1'), action: saveBtn }),
    body,
  });
  return { node, nav: 'explore' };
}

/* ---------- Learned list (E3, E8) ---------- */
function learnedList(getList, setList) {
  const wrap = el('div', { class: 'stack-md' });
  const paint = () => {
    const list = getList();
    if (!list.length) { wrap.replaceChildren(emptyCard('Nothing learned yet', 'It fills in as you tap how things went.')); return; }
    wrap.replaceChildren(...list.map((item, idx) => listRow({
      title: item.text,
      lines: [el('span', { class: 't-caption c-muted' }, fill(item.source))],
      trailing: button('Wrong?', {
        variant: 'ghost', cls: 't-small-strong', ariaLabel: `Wrong: ${item.text}`,
        onClick: () => {
          const removed = item;
          setList(getList().filter((x) => x.id !== removed.id));
          paint();
          toast('Removed', {
            actionLabel: 'Undo',
            onAction: () => { const l = getList().slice(); l.splice(idx, 0, removed); setList(l); paint(); },
          });
        },
      }),
    })));
  };
  paint();
  return { node: wrap, paint };
}

function profileCard(initial, title, sub) {
  return el('div', { class: 'surface-card profile-card' },
    el('span', { class: 'avatar profile-card__avatar', 'aria-hidden': 'true' }, initial),
    el('div', { class: 'profile-card__text' },
      el('p', { class: 't-title' }, title),
      el('p', { class: 't-small c-secondary' }, sub),
    ),
  );
}

function staticChips(list, on = true) {
  return el('ul', { class: 'chip-group', role: 'list' }, ...list.map((t) => el('li', { class: 'chip chip--static' + (on ? ' chip--on' : '') }, t)));
}

/* ---------- E3 Profile, Child Lens ---------- */
export function e3() {
  const c = store.get().child;
  const learned = learnedList(
    () => store.get().child.learned,
    (l) => store.update((st) => { st.child.learned = l; }),
  );
  const reset = () => confirmSheet({
    title: 'Reset what has been learned?',
    body: 'We start learning again from your next taps. What she likes stays.',
    confirmLabel: 'Reset',
    onConfirm: () => { store.update((st) => { st.child.learned = []; }); learned.paint(); toast('Reset'); },
  });

  const { node } = screenShell({
    label: c.name,
    top: topBar({ title: c.name, onBack: () => router.back('e7'), actionLabel: 'Edit', onAction: comingSoon }),
    body: [
      profileCard(c.name.slice(0, 1), `${c.name}, ${c.ageYears} years`, 'With you since March'),
      el('h2', { class: 't-h3 explore__head' }, fill('What she likes')),
      c.interests.length ? staticChips(c.interests) : el('p', { class: 't-small c-muted' }, fill('Not sure yet? Skip this and we will learn from what she enjoys.')),
      el('h2', { class: 't-h3 explore__head' }, 'What we have learned'),
      el('p', { class: 't-small c-secondary d__sub' }, 'From your taps. Correct anything that is wrong.'),
      learned.node,
      el('div', { class: 'results__actions' }, button('Reset what has been learned', { variant: 'secondary', onClick: reset })),
    ],
  });
  return { node, nav: 'profile' };
}

/* ---------- E4 Ritual and nudges ---------- */
export function e4() {
  const s = store.get();
  const set = (key) => (v) => store.update((st) => { st.settings[key] = v; });
  // Turning the evening nudge on asks the OS. A denial flips it back off.
  const eveningNudge = (v) => {
    store.update((st) => { st.settings.eveningNudge = v; });
    if (!v) return;
    store.askNotify().then((r) => {
      if (r !== 'denied') return;
      store.update((st) => { st.settings.eveningNudge = false; });
      toast('Notifications are off. You can turn them on in your browser settings.');
      if (router.current().id === 'e4') router.refresh();
    });
  };

  const slotTitle = el('span', { class: 't-title' }, s.settings.slot);
  const change = () => {
    let close;
    const group = optionGroup(data.slotOptions, {
      selected: store.get().settings.slot, label: 'Your standing slot',
      onChange: (v) => {
        store.update((st) => { st.settings.slot = v; });
        slotTitle.textContent = v;
        setTimeout(() => close(), 180);
      },
    });
    close = openSheet(el('div', {},
      el('div', { class: 'sheet__head' }, el('h2', { class: 't-h2' }, 'Your standing slot')),
      el('p', { class: 't-small c-secondary sheet__body' }, 'One decision made once, instead of every week.'),
      group.node,
    ), { label: 'Your standing slot' });
  };

  const { node } = screenShell({
    label: 'Ritual and nudges',
    top: topBar({ title: 'Ritual and nudges', onBack: () => router.back('e7') }),
    body: [
      el('h1', { class: 't-h3' }, 'Your standing slot'),
      el('p', { class: 't-small c-secondary d__sub' }, 'One decision made once, instead of every week.'),
      el('div', { class: 'card setting-row' },
        el('div', { class: 'setting-row__text' }, slotTitle, el('span', { class: 't-small c-muted' }, 'We pre-fill it on Thursday. You accept or swap.')),
        button('Change', { variant: 'ghost', cls: 't-small-strong', onClick: change }),
      ),
      el('h2', { class: 't-h3 explore__head' }, 'Nudges'),
      el('div', { class: 'stack-md' },
        switchRow({ title: 'Evening nudge', sub: 'Around 5:30 PM, one idea for that night', checked: s.settings.eveningNudge, onChange: eveningNudge }),
        switchRow({ title: 'Weekend nudge', sub: 'Thursday, one suggestion', checked: s.settings.weekendNudge, onChange: set('weekendNudge') }),
        switchRow({ title: 'A save comes back', sub: 'Only when a free day fits it', checked: s.settings.saveComesBack, onChange: set('saveComesBack') }),
        switchRow({ title: 'Streaks and reminders', sub: 'We do not do these', checked: false, disabled: true }),
      ),
      el('p', { class: 'surface-card t-small c-secondary explore__note' }, 'We never send a second nudge the same evening, and skipping breaks nothing.'),
    ],
  });
  return { node, nav: 'profile' };
}

/* ---------- E6 Something went wrong ---------- */
export function e6() {
  const { node } = screenShell({
    label: 'Something went wrong',
    top: topBar({ title: '', onBack: () => router.back('home') }),
    body: [
      el('div', { class: 'error-state' },
        el('div', { class: 'error-state__art' }, mascot('thinking', 'sleepy', 160)),
        el('h1', { class: 't-h2' }, 'We could not load that'),
        el('p', { class: 't-small c-secondary' }, 'Something on our side, not yours. Your saves and tonight’s ideas are untouched.'),
        button('Try again', { onClick: () => router.navigate('e1', { replace: true, transition: 'fade' }) }),
        button('Go to tonight’s ideas', { variant: 'secondary', onClick: () => { store.update((st) => { st.resultsPage = 0; }); router.navigate('b6', { replace: true }); } }),
      ),
    ],
  });
  return { node };
}

/* ---------- E7 Profiles ---------- */
export function e7() {
  const s = store.get();
  const c = s.child;
  const me = store.user();
  const others = s.adults.filter((a) => !a.isUser);
  const partner = store.partner();

  const interests = c.interests.slice(0, 3).map((i) => (SHORT_INTEREST[i] || i).toLowerCase());
  const childLine = [
    interests.length ? store.cap(interests.join(', ')) : 'Interests not set yet',
    c.settleMinutes ? `settles for ${c.settleMinutes} min` : null,
  ].filter(Boolean).join(' · ');
  const enjoys = me.enjoys.slice(0, 2).map((e) => (SHORT_ENJOY[e] || e).toLowerCase());
  const avoids = me.avoids.map((a) => (SHORT_AVOID[a] || a).toLowerCase());
  const meLine = ['You', enjoys.join(', '), avoids.length ? `avoids ${joinAnd(avoids)}` : null].filter(Boolean).join(' · ');

  const avatar = (n, muted) => el('span', { class: 'avatar avatar--lg' + (muted ? ' avatar--muted' : ''), 'aria-hidden': 'true' }, n.slice(0, 1));

  const settings = el('button', { type: 'button', class: 'topbar__back', 'aria-label': 'Ritual and nudges' }, icon('tune'));
  pressable(settings, () => router.navigate('e4'));

  const { node } = screenShell({
    label: 'Profiles',
    top: titleBar('Profiles', {}),
    body: [
      el('h2', { class: 't-h3' }, 'Suggestions are matched to both sides'),
      el('p', { class: 't-small c-secondary d__sub' }, 'An idea has to suit the child and the adult who will be doing it. If either half is off, it does not get shown.'),
      el('hr', { class: 'divider' }),
      el('p', { class: 't-small c-muted profiles__label' }, 'The child'),
      listRow({ thumb: avatar(c.name), title: `${c.name}, ${c.ageYears} years`, lines: [childLine], onOpen: () => router.navigate('e3') }),
      el('p', { class: 't-small c-muted profiles__label' }, 'The adults'),
      el('div', { class: 'stack-md' },
        listRow({
          thumb: avatar(me.name), title: me.name, lines: [meLine], cls: 'is-selected',
          trailing: el('span', { class: 'save-row__chev' }, icon('chevron_right')),
          onOpen: () => router.navigate('e8'),
        }),
        ...others.map((a) => listRow({
          thumb: avatar(a.name, true), title: a.name, cls: 'list-row--dashed',
          lines: [store.cap(a.role)],
          trailing: el('span', { class: 't-small c-muted' }, 'Not set up yet'),
        })),
      ),
      el('div', { class: 'surface-card explore__note' },
        el('p', { class: 't-overline c-muted' }, 'Why this matters'),
        el('p', { class: 't-small c-secondary' }, `Without ${partner.name}’s half, a two-adult idea is only a guess about what ${partner.pronoun.subject} would enjoy.`),
      ),
    ],
  });
  node.querySelector('.topbar .avatar')?.replaceWith(settings);
  return { node, nav: 'profile' };
}

/* ---------- E8 Profile, Parent Lens ---------- */
export function e8() {
  const me = store.user();
  const learned = learnedList(
    () => store.user().learned,
    (l) => store.update((st) => { st.adults.find((a) => a.isUser).learned = l; }),
  );

  const { node } = screenShell({
    label: me.name,
    top: topBar({ title: me.name, onBack: () => router.back('e7'), actionLabel: 'Edit', onAction: () => editAdultName(store.user()) }),
    body: [
      profileCard(me.name.slice(0, 1), me.name, fill(me.roleLine)),
      el('h2', { class: 't-h3 explore__head' }, 'What you enjoy'),
      me.enjoys.length ? staticChips(me.enjoys) : el('p', { class: 't-small c-muted' }, 'Nothing picked yet.'),
      el('h2', { class: 't-h3 explore__head' }, 'What you would rather avoid'),
      me.avoids.length ? staticChips(me.avoids, false) : el('p', { class: 't-small c-muted' }, 'Nothing picked yet.'),
      el('h2', { class: 't-h3 explore__head' }, 'What we have learned'),
      el('p', { class: 't-small c-secondary d__sub' }, 'From what you pick and skip. Correct anything wrong.'),
      learned.node,
      el('p', { class: 't-small c-muted explore__note' }, 'Partner profiles are coming soon.'),
    ],
  });
  return { node, nav: 'profile' };
}
