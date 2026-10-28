// Lane C: weekend outing (C1 to C16). C1 is Home's weekend lead card (weekendSlotCard).

import * as data from '../data.js';
import * as store from '../store.js';
import * as router from '../router.js';
import { icon } from '../icons.js';
import {
  el, button, chipGroup, chipRadioGroup, optionGroup, field, textareaField, progress, topBar, greetingBar, banner,
  mascot, refSlot, slot, sectionHead, emptyCard, regularTile, saveRow, skeletonCard, placeCard, listRow, iconThumb,
  checkboxRow, toast, comingSoon, screenShell, pressable, openSheet,
} from '../components.js';

const fill = (t) => store.fill(t);
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
const SAVED_LINE = 'Saved. We will bring it up when a free day fits.';

export function openPlace(id, { from } = {}) {
  const p = data.findPlace(id);
  if (!p) { comingSoon(); return; }
  if (p.ordinary) router.navigate(`c12/${id}`);
  else router.navigate(`c6/${id}${from ? `?from=${from}` : ''}`);
}

function saveGhost(refKind, refId, { onSaved } = {}) {
  const b = button('Save', { variant: 'ghost', cls: 'detail__save' });
  const paint = () => {
    const on = store.isSaved(refKind, refId);
    b.querySelector('span:last-child').textContent = on ? 'Saved' : 'Save';
    b.setAttribute('aria-pressed', String(on));
  };
  b.addEventListener('click', () => {
    const now = store.toggleSave(refKind, refId);
    paint();
    if (now) onSaved?.();
    toast(now ? 'Saved' : 'Removed from saves', { actionLabel: 'Undo', onAction: () => { store.toggleSave(refKind, refId); paint(); } });
  });
  paint();
  return b;
}

function fmt(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
}

// Lumbini has the mid-fi plan. Others get a plan built the same way from their data.
export function planFor(place) {
  if (place.plan) return place.plan;
  const leave = 7 * 60 + 45;
  const arrive = leave + place.travelMin;
  const back = arrive + Math.round(place.stayHours * 60) - 20;
  return [
    { time: fmt(leave - 30), title: 'Feed her before you leave', note: 'She will not last the drive otherwise' },
    { time: fmt(leave), title: 'Leave home', note: `${place.travelMin} min, light traffic on Sunday` },
    { time: fmt(arrive), title: 'Arrive', note: fill(place.description) },
    { time: fmt(arrive + Math.round((back - arrive) / 2)), title: 'Snack break', note: place.food || 'Bring water' },
    { time: fmt(back), title: 'Head back', note: place.napFit || '' },
    { time: fmt(back + place.travelMin), title: 'Home, nap at 1pm', note: 'Window protected' },
  ];
}

/* ---------- Home lead cards: C1 weekend slot, D6 a save comes back ----------
   Home itself is one module stack, built by home() in b.js. */
export function saveBackCard() {
  const cubbon = data.findPlace('cubbon-park-bandstand');
  return el('section', { class: 'hero-card', 'aria-label': 'A save comes back' },
    el('div', { class: 'hero-card__head' },
      mascot('pointing', 'happy', 76),
      el('div', {},
        el('p', { class: 't-overline hero-card__overline' }, 'You saved this in September'),
        el('h2', { class: 't-h2' }, cubbon.name),
      ),
    ),
    el('p', { class: 't-small hero-card__body' }, fill('You have a free morning and it is 6 km away. {child} still likes being outdoors.')),
    el('div', { class: 'hero-card__actions' },
      button('Open it', { size: 'small', block: false, onClick: () => router.navigate(`c6/${cubbon.id}`) }),
      button('Not today', {
        variant: 'secondary', size: 'small', block: false,
        onClick: () => { store.update((st) => { st.saveBackDismissedUntil = store.nextSixAm(); }); router.refresh(); },
      }),
    ),
  );
}

export function weekendSlotCard() {
  const lumbini = data.findPlace('lumbini-gardens');
  if (store.slotSkipped()) {
    return el('section', { class: 'hero-card', 'aria-label': `Your ${store.slotDay()} slot` },
      el('div', { class: 'hero-card__head' },
        mascot('pointing', 'happy', 76),
        el('div', {},
          el('p', { class: 't-overline hero-card__overline' }, `Your ${store.slotDay()} slot`),
          el('h2', { class: 't-h2' }, 'Nothing planned this weekend'),
        ),
      ),
      el('div', { class: 'hero-card__actions' },
        button('Plan something', { variant: 'ghost', cls: 'hero-card__ghost', onClick: () => router.navigate('c2/1') }),
      ),
    );
  }
  return el('section', { class: 'hero-card', 'aria-label': `Your ${store.slotDay()} slot` },
    el('div', { class: 'hero-card__head' },
      mascot('pointing', 'happy', 76),
      el('div', {},
        el('p', { class: 't-overline hero-card__overline' }, `Your ${store.slotDay()} slot`),
        el('h2', { class: 't-h2' }, `${lumbini.name}, 8am`),
      ),
    ),
    el('p', { class: 't-small hero-card__body' }, fill('25 min away. {child} likes water, and it is cool before nine. Both of you can go in.')),
    el('div', { class: 'hero-card__actions' },
      button('Looks good', { size: 'small', block: false, onClick: () => router.navigate(`c9/${lumbini.id}`) }),
      button('Swap it', { variant: 'secondary', size: 'small', block: false, onClick: () => router.navigate('c2/1') }),
    ),
    button('Not this week', {
      variant: 'ghost', cls: 'hero-card__ghost',
      onClick: () => { store.update((st) => { st.slotSkippedUntil = store.nextMonday(); }); router.refresh(); },
    }),
  );
}

/* ---------- C2, C3 Outing check (4 steps) ---------- */
function goPlaces() {
  if (store.get().settings.demoLocationOff) { router.navigate('c16'); return; }
  router.navigate(store.matchingPlaces().length ? 'c4' : 'c5');
}

function outingSummaryRows() {
  const o = store.get().outing;
  const row = (label, value) => el('div', { class: 'summary-row' },
    el('span', { class: 't-small c-secondary' }, label), el('span', { class: 't-small-strong' }, value));
  return [
    row('Time', data.outingTimeOptions.find((x) => x.id === o.time)?.row || ''),
    row('How far', data.outingDistanceOptions.find((x) => x.id === o.distance)?.row || ''),
    row('Energy', data.outingEnergyOptions.find((x) => x.id === o.energy)?.row || ''),
    row('Who', data.outingWhoOptions.find((x) => x.id === o.who)?.row || ''),
  ];
}

export function outingLine() {
  const o = store.get().outing;
  const d = data.outingDistanceOptions.find((x) => x.id === o.distance);
  const t = data.outingTimeOptions.find((x) => x.id === o.time);
  const w = data.outingWhoOptions.find((x) => x.id === o.who);
  return `${d?.label || ''}, ${t?.label || ''}, ${w?.label || ''}`;
}

export function c2(route) {
  const step = Math.min(Math.max(parseInt(route.params[0] || '2', 10), 1), 3);
  return outingStep(step);
}
export const c3 = () => outingStep(4);

function outingStep(step) {
  const o = store.get().outing;
  const skip = () => { store.update((st) => { st.outing = { ...data.outingDefaults }; }); goPlaces(); };
  const top = topBar({ title: 'This weekend', onBack: () => router.back('home'), actionLabel: 'Skip', onAction: skip });
  const meta = el('div', { class: 'checkin__step' },
    el('p', { class: 't-caption c-muted' }, `${step} of 4`),
    progress(4, step, { label: `Question ${step} of 4` }),
  );
  const set = (key) => (v) => store.update((st) => { st.outing[key] = v; });
  let body;
  let next;
  if (step === 1) {
    body = [
      el('h1', { class: 't-h1 checkin__q' }, 'How much time have you got?'),
      optionGroup(data.outingTimeOptions, { selected: o.time, label: 'How much time have you got?', onChange: set('time') }).node,
    ];
    next = button('Next', { onClick: () => router.navigate('c2/2') });
  } else if (step === 2) {
    body = [
      el('h1', { class: 't-h1 checkin__q' }, 'How far are you willing to go?'),
      el('p', { class: 't-body c-secondary checkin__sub' }, 'Just for this trip. It is not a setting.'),
      optionGroup(data.outingDistanceOptions, { selected: o.distance, label: 'How far are you willing to go?', onChange: set('distance') }).node,
    ];
    next = button('Next', { onClick: () => router.navigate('c2/3') });
  } else if (step === 3) {
    body = [
      el('h1', { class: 't-h1 checkin__q' }, 'How are you all feeling?'),
      optionGroup(data.outingEnergyOptions, { selected: o.energy, label: 'How are you all feeling?', onChange: set('energy') }).node,
    ];
    next = button('Next', { onClick: () => router.navigate('c3') });
  } else {
    const rows = el('div', { class: 'summary-rows', 'aria-live': 'polite' }, ...outingSummaryRows());
    body = [
      el('h1', { class: 't-h1 checkin__q' }, 'Who is coming?'),
      optionGroup(data.outingWhoOptions.map((x) => ({ ...x, title: fill(x.title) })), {
        selected: o.who, label: 'Who is coming?',
        onChange: (v) => { set('who')(v); rows.replaceChildren(...outingSummaryRows()); },
      }).node,
      el('div', { class: 'surface-card summary-card' },
        el('p', { class: 't-overline c-muted' }, store.get().settings.slot),
        rows,
      ),
      button('Change any of it', { variant: 'ghost', cls: 'summary-card__change t-small-strong', onClick: () => router.navigate('c2/1', { transition: 'back' }) }),
    ];
    next = button('Show me places', { onClick: goPlaces });
  }
  const { node } = screenShell({ label: 'This weekend', top, body: step === 4 ? body : [...body, meta], footer: [next] });
  return { node };
}

/* ---------- C4 Results, outings (and C13 saved state) ---------- */
function resultsTop() {
  return topBar({ title: store.slotDay(), onBack: () => router.back('home'), actionLabel: 'Change', onAction: () => router.navigate('c2/1') });
}

export function c4() {
  const list = store.matchingPlaces();
  if (!list.length) { router.navigate('c5', { replace: true }); return null; }
  const ordinary = store.ordinaryPlace();
  const total = list.length + 1;
  const listEl = el('div', { class: 'stack-lg', 'aria-busy': 'true' }, skeletonCard(), skeletonCard());

  const ordinaryCard = () => {
    const card = el('div', { class: 'card ordinary-card', role: 'button', 'aria-label': ordinary.displayName },
      el('span', { class: 'list-row__icon fill--marigold' }, icon('yard')),
      el('span', { class: 'list-row__text' },
        el('span', { class: 't-title' }, ordinary.displayName),
        el('span', { class: 't-small c-secondary' }, `Ordinary place, ${ordinary.travelMin} min away. Free.`),
        el('span', { class: 't-small c-muted' }, `We have ${ordinary.thingsCount} things to do with her there`),
      ),
      el('span', { class: 'save-row__chev' }, icon('chevron_right')),
    );
    pressable(card, () => router.navigate(`c12/${ordinary.id}`));
    return card;
  };

  const { node } = screenShell({
    label: 'Places that fit',
    top: resultsTop(),
    body: [
      el('p', { class: 't-small c-muted' }, outingLine()),
      el('h1', { class: 't-h1 results__title' }, `${WORDS[total] || total} places that fit`),
      listEl,
    ],
  });

  return {
    node,
    nav: 'explore',
    onMount() {
      setTimeout(() => {
        if (!listEl.isConnected) return;
        listEl.replaceChildren(
          ...list.map((p) => {
            const saved = store.isSaved('place', p.id);
            return placeCard(p, {
              tagLabel: saved ? 'Saved' : (p.bothIn ? 'Both of you in' : null),
              tagColor: saved ? 'pink' : 'leaf',
              onOpen: () => openPlace(p.id, { from: 'c4' }),
            });
          }),
          ordinaryCard(),
        );
        listEl.removeAttribute('aria-busy');
      }, 600);
    },
  };
}

/* ---------- C5 Nothing within limits ---------- */
export function c5() {
  const park = data.findPlace('park-end-of-road');
  const parkCard = el('div', { class: 'card close-card', role: 'button', 'aria-label': park.name },
    el('span', { class: 't-title' }, park.name),
    el('span', { class: 't-small c-secondary' }, 'Ordinary, and 4 minutes away. Free.'),
    el('span', { class: 'close-card__tip t-small' }, park.thingsToDo[0].title),
  );
  pressable(parkCard, () => router.navigate(`c12/${park.id}`));
  const stayIn = el('div', { class: 'card close-card', role: 'button', 'aria-label': 'Stay in, make it an indoor morning' },
    el('span', { class: 't-title' }, 'Stay in, make it an indoor morning'),
    el('span', { class: 't-small c-secondary' }, 'Three ideas for a long slow morning at home.'),
  );
  pressable(stayIn, () => {
    store.update((st) => {
      st.checkIn = { minutes: 999, posture: 'floor', who: st.outing.who === 'me' ? 'me' : 'both' };
      st.resultsPage = 0;
    });
    router.navigate('b6');
  });

  const { node } = screenShell({
    label: 'Nothing within limits',
    top: resultsTop(),
    body: [
      el('p', { class: 't-small c-muted' }, outingLine()),
      el('div', { class: 'empty-card nothing-near' },
        el('h1', { class: 't-title' }, 'Nothing new within walking distance'),
        el('p', { class: 't-small c-secondary' }, 'Bengaluru is not generous with this. Widening to a short drive opens up nine places.'),
        button('Widen to a short drive', {
          variant: 'secondary',
          onClick: () => { store.update((st) => { st.outing.distance = 'short'; }); router.navigate('c4', { replace: true }); },
        }),
      ),
      el('h2', { class: 't-h3 nothing__head' }, 'Or do something close by'),
      el('div', { class: 'stack-md' }, parkCard, stayIn),
    ],
  });
  return { node, nav: 'home' };
}

/* ---------- C6 Place detail (C15 when closed, C12 when ordinary) ---------- */
export function c6(route) {
  const place = data.findPlace(route.params[0]);
  if (!place) { router.navigate('home', { replace: true }); return null; }
  if (store.isClosedOnPlannedDay(place)) return c15(route);
  if (place.ordinary) return c12(route);
  const fromResults = route.query.from === 'c4';

  const row = (label, value) => el('div', { class: 'worth__row' },
    el('span', { class: 't-small c-secondary' }, label), el('span', { class: 't-small-strong' }, value));

  const fits = el('button', { type: 'button', class: 'fits-link' },
    el('span', { class: 't-h3' }, 'Fits both of you'),
    icon('chevron_right'),
  );
  pressable(fits, () => router.navigate(`c7/${place.id}`));

  const saveLater = () => {
    if (!store.isSaved('place', place.id)) store.toggleSave('place', place.id);
    toast(SAVED_LINE, {
      actionLabel: 'Undo', duration: 4000,
      onAction: () => { if (store.isSaved('place', place.id)) store.toggleSave('place', place.id); if (router.current().id === 'c4') router.refresh(); },
    });
    if (fromResults) router.back('c4');
    else router.refresh();
  };

  const { node } = screenShell({
    label: place.name,
    top: topBar({ title: '', onBack: () => router.back('home'), action: saveGhost('place', place.id) }),
    body: [
      el('div', { class: 'place-hero' },
        refSlot(place, { cls: 'place-hero__img', width: 800, height: 400, eager: true, iconSize: 56 }),
        place.bothIn ? el('span', { class: 'tag tag--leaf place-hero__tag' }, 'Both of you in') : null,
      ),
      el('h1', { class: 't-h1 detail__title' }, place.name),
      el('p', { class: 't-small c-secondary' }, `${fill(place.description)} · ${place.area}`),
      el('section', { class: 'surface-card worth', 'aria-label': 'Is it worth it' },
        el('p', { class: 't-overline c-muted' }, 'Is it worth it'),
        row('Travel vs time there', `${place.travelMin} min for about ${place.stayHours} hrs`),
        row('Real cost for three', place.costLine),
        row('Distance', `${place.distanceKm} km`),
        row('Meal fit', place.food),
        row('Nap window', fill(place.napFit)),
      ),
      fits,
      el('p', { class: 't-small c-secondary' }, fill(place.fitLine)),
    ],
    footer: [
      button('Plan this', { onClick: () => router.navigate(`c9/${place.id}`) }),
      button('Save for later', { variant: 'secondary', onClick: saveLater }),
    ],
  });
  return { node };
}

/* ---------- C7 Ground truth, C8 ask sheet ---------- */
export function c7(route) {
  const place = data.findPlace(route.params[0]);
  if (!place) { router.navigate('home', { replace: true }); return null; }
  const gt = place.groundTruth;

  const body = [el('h1', { class: 't-h3 truth__head' }, 'From parents who went recently')];
  if (gt) {
    body.push(el('div', { class: 'stack-md' }, ...gt.items.map((it) => el('div', { class: 'card truth-card' },
      el('span', { class: 't-small c-muted' }, it.label),
      el('span', { class: 't-body' }, it.value),
      it.when ? el('span', { class: 't-caption c-muted' }, it.when) : null,
    ))));
    body.push(el('div', { class: 'surface-card truth__watch' },
      el('p', { class: 't-overline c-muted' }, 'Watch out for'),
      el('p', { class: 't-small c-secondary' }, gt.watchOut),
    ));
    body.push(el('h2', { class: 't-h3 truth__photos-head' }, 'Recent photos'));
    body.push(el('div', { class: 'photo-grid' }, ...gt.photos.map((when) => el('figure', { class: 'truth__photo' },
      slot({ src: null, alt: `Photo from a parent, ${when}`, fallback: { tag: 'surface', icon: 'photo_camera' }, cls: 'photo-tile' }),
      el('figcaption', { class: 't-caption c-muted' }, when),
    ))));
  } else {
    body.push(emptyCard('Nothing here yet', 'Ask the parents who went. Usually answered the same day.'));
  }
  body.push(el('div', { class: 'results__actions' },
    button('Ask these parents something', { variant: 'secondary', onClick: () => openAskSheet(place) })));

  const { node } = screenShell({
    label: `${place.name}, from parents`,
    top: topBar({ title: place.name, onBack: () => router.back(`c6/${place.id}`), action: saveGhost('place', place.id) }),
    body,
  });
  return { node, nav: 'explore' };
}

function openAskSheet(place) {
  let close;
  const q = textareaField({ placeholder: 'Is there anywhere shaded to feed a 3 year old?', rows: 3, onInput: () => q.setError('') });
  q.input.setAttribute('aria-label', 'Your question');
  const topics = chipGroup(data.questionTopics, { label: 'Topics' });
  const send = () => {
    const v = q.input.value.trim();
    if (!v) { q.setError('Write your question first'); q.input.focus(); return; }
    store.update((st) => { st.askedQuestions.push({ placeId: place.id, text: v, topics: topics.get(), at: Date.now() }); });
    close();
    toast('Sent. Usually answered the same day.');
  };
  const content = el('div', {},
    el('div', { class: 'sheet__head' }, el('h2', { class: 't-h2' }, 'Ask the parents who went')),
    el('p', { class: 't-small c-secondary sheet__body' }, 'Goes to parents who checked in here in the last month. Usually answered the same day.'),
    q.node,
    el('div', { class: 'ask__topics' }, topics.node),
    el('div', { class: 'sheet__actions' },
      button('Send', { onClick: send }),
      el('p', { class: 't-caption c-muted sheet__note' }, 'Your name is not shown to them.'),
    ),
  );
  close = openSheet(content, { label: 'Ask the parents who went' });
}

/* ---------- C9 Plan, C10 share sheet ---------- */
export function c9(route) {
  const place = data.findPlace(route.params[0]) || data.findPlace('lumbini-gardens');
  const plan = planFor(place);
  const child = store.get().child.name || 'your child';

  const confirm = () => {
    store.update((st) => { st.plan = { placeId: place.id, leaveAt: Date.now() + 12 * 60 * 1000, confirmedAt: Date.now() }; });
    router.navigate('c11');
  };

  const timeline = el('ol', { class: 'timeline' }, ...plan.map((p) => el('li', { class: 'timeline__item' },
    el('span', { class: 'timeline__dot', 'aria-hidden': 'true' }),
    el('span', { class: 't-small-strong timeline__time' }, p.time),
    el('span', { class: 'timeline__text' },
      el('span', { class: 't-body' }, fill(p.title)),
      p.note ? el('span', { class: 't-small c-muted' }, p.note) : null,
    ),
  )));

  const { node } = screenShell({
    label: `${store.slotDay()} plan`,
    top: topBar({ title: `${store.slotDay()} plan`, onBack: () => router.back('home'), actionLabel: 'Edit', onAction: comingSoon }),
    body: [
      el('h1', { class: 't-h1' }, place.displayName || place.name),
      el('p', { class: 't-small c-secondary plan__sub' }, `Built around ${child}’s meals and ${store.get().child.pronoun.possessive} 1pm nap`),
      timeline,
    ],
    footer: [el('div', { class: 'footer-pair' },
      button('Share plan', { variant: 'secondary', onClick: () => openShareSheet(place, confirm) }),
      button('Confirm', { onClick: confirm }),
    )],
  });
  return { node };
}

function openShareSheet(place, after) {
  const p = store.partner();
  let close;
  const rows = data.shareParts.map((part) => checkboxRow(part.label, { checked: part.on }));
  const content = el('div', {},
    el('div', { class: 'sheet__head' }, el('h2', { class: 't-h2' }, `Send to ${p.name}`)),
    el('p', { class: 't-small c-secondary sheet__body' }, `${store.cap(p.pronoun.subject)} sees the plan and can take a part of it.`),
    el('div', { class: 'stack-md', role: 'group', 'aria-label': `Parts ${p.name} takes` }, ...rows.map((r) => r.node)),
    el('div', { class: 'sheet__actions' },
      button(`Send to ${p.name}`, {
        onClick: () => {
          close();
          toast(`Sent to ${p.name} (simulated)`);
          after();
        },
      }),
    ),
  );
  close = openSheet(content, { label: `Send to ${p.name}` });
}

/* ---------- C11 Day of, live timeline ---------- */
export function c11() {
  let plan = store.get().plan;
  if (!plan) {
    store.update((st) => { st.plan = { placeId: 'lumbini-gardens', leaveAt: Date.now() + 12 * 60 * 1000, confirmedAt: Date.now() }; });
    plan = store.get().plan;
  }
  const place = data.findPlace(plan.placeId);
  const items = planFor(place);
  const rest = items.slice(2);

  const nowTitle = el('h1', { class: 't-h2', 'aria-live': 'polite' });
  const paint = () => {
    const mins = Math.ceil((plan.leaveAt - Date.now()) / 60000);
    nowTitle.textContent = mins > 1 ? `Leave in ${mins} minutes` : mins === 1 ? 'Leave in 1 minute' : 'Time to leave';
  };
  paint();

  const go = () => {
    toast('Opens Maps in the real app');
    setTimeout(() => router.navigate(`c14/${place.id}`), 900);
  };

  const { node } = screenShell({
    label: 'Today',
    top: topBar({ title: 'Today', onBack: () => router.back('home'), actionLabel: 'Plan', onAction: () => router.navigate(`c9/${place.id}`) }),
    body: [
      el('section', { class: 'now-card', 'aria-label': 'Now' },
        el('p', { class: 't-overline' }, 'Now'),
        nowTitle,
        el('p', { class: 't-small' }, `Traffic is light. ${place.travelMin} min to ${place.displayName || place.name}.`),
      ),
      el('h2', { class: 't-h3 nothing__head' }, 'Rest of the day'),
      el('div', { class: 'stack-md' }, ...rest.map((it, i) => el('div', { class: 'card day-row' },
        el('span', { class: 't-small-strong day-row__time' }, it.time),
        el('span', { class: 't-body day-row__title' }, fill(it.title)),
        i === 0 ? el('span', { class: 't-caption c-muted' }, 'Next') : null,
      ))),
      el('div', { class: 'surface-card tickets' },
        el('p', { class: 't-overline c-muted' }, 'Tickets and contact'),
        el('p', { class: 't-small' }, `3 entry passes · ${place.contact || 'Office'}`),
      ),
      el('div', { class: 'results__actions' }, button('Navigate', { variant: 'secondary', iconName: 'navigation', onClick: go })),
    ],
  });

  return {
    node,
    onMount() {
      const t = setInterval(() => { if (!node.isConnected) { clearInterval(t); return; } paint(); }, 15 * 1000);
    },
  };
}

/* ---------- C12 Ordinary place, play kit ---------- */
export function c12(route) {
  const place = data.findPlace(route.params[0]);
  if (!place) { router.navigate('home', { replace: true }); return null; }
  const things = place.thingsToDo || [];
  const take = () => {
    if (!store.isSaved('place', place.id)) store.toggleSave('place', place.id);
    toast('Play kit saved to your phone');
    router.navigate(`c14/${place.id}`);
  };

  const { node } = screenShell({
    label: data.placeName(place),
    top: topBar({ title: '', onBack: () => router.back('home'), action: saveGhost('place', place.id) }),
    body: [
      refSlot(place, { cls: 'place-hero__img place-hero__img--round', width: 800, height: 400, eager: true, iconSize: 56 }),
      el('h1', { class: 't-h1 detail__title' }, data.placeName(place)),
      el('p', { class: 't-small c-secondary' }, `${place.travelMin} min away · Free · ${place.openTill}`),
      el('p', { class: 'surface-card t-small c-secondary kit__intro' }, place.kitIntro),
      el('h2', { class: 't-h3 nothing__head' }, fill(`${WORDS[things.length]} ${things.length === 1 ? 'thing that suits' : 'things that suit'} her and you`)),
      el('div', { class: 'stack-md' }, ...things.map((t) => listRow({
        thumb: iconThumb({ tag: t.tag, icon: t.icon }), title: t.title, lines: [el('span', { class: 't-small c-muted' }, fill(t.detail))],
      }))),
    ],
    footer: [button('Take this with me', { onClick: take })],
  });
  return { node };
}

/* ---------- C14 After the outing ---------- */
export function c14(route) {
  const place = data.findPlace(route.params[0]) || data.findPlace('lumbini-gardens');
  const now = new Date();
  const back = `${((now.getHours() + 11) % 12) + 1}:${String(now.getMinutes()).padStart(2, '0')}`;

  const leave = () => { router.navigate('home', { transition: 'fade', replace: true }); router.resetStack(); };

  const { node } = screenShell({
    label: 'After the outing',
    top: topBar({ title: data.placeName(place), onBack: leave }),
    body: [
      el('h1', { class: 't-h2 capture__title' }, `You got back at ${back}`),
      refSlot(place, { cls: 'capture__hero', width: 700, height: 350, eager: true }),
    ],
  });

  const openAfter = () => {
    let close;
    const verdict = chipRadioGroup(data.verdicts.map((v) => ({ id: v.id, label: fill(v.label) })), { label: 'How was it?', fill: 3 });
    const worked = chipGroup(data.outingWorked.map((w) => fill(w)), { label: 'What made it work?' });
    const help = {};
    const helpBody = el('div', { class: 'help__body', hidden: true },
      ...data.helpParents.map((h) => el('div', { class: 'help__q' },
        el('p', { class: 't-small-strong' }, h.label),
        chipRadioGroup(h.options, { label: h.label, onChange: (v) => { help[h.id] = v; } }).node,
      )));
    const helpCard = el('button', { type: 'button', class: 'surface-card help-card', 'aria-expanded': 'false' },
      el('span', { class: 't-overline c-muted' }, 'Also help other parents'),
      el('span', { class: 't-small c-secondary' }, 'Three quick taps on crowd and washrooms. Separate from your own note.'),
    );
    pressable(helpCard, () => {
      const open = helpBody.hidden;
      helpBody.hidden = !open;
      helpCard.setAttribute('aria-expanded', String(open));
    });

    const save = () => {
      const v = verdict.get() || 'mixed';
      store.update((st) => {
        st.moments.unshift({ id: `m-${Date.now()}`, refKind: 'place', refId: place.id, date: new Date().toISOString().slice(0, 10), verdict: v, photos: [], atHome: false, worked: worked.get(), help });
        if (v === 'loved') {
          const r = st.regulars.find((x) => x.refKind === 'place' && x.refId === place.id);
          if (r) { r.timesWorked += 1; r.lastDone = 'today'; }
          else st.regulars.push({ refKind: 'place', refId: place.id, timesWorked: 1, lastDone: 'today', twist: '' });
        }
        st.settings.demoEmptyMoments = false;
        st.plan = null;
      });
      close();
      toast('Added to Moments');
      router.navigate('b12', { transition: 'fade', replace: true });
      router.resetStack();
    };

    const content = el('div', {},
      el('div', { class: 'sheet__head' }, mascot('celebrating', 'happy', 88), el('h2', { class: 't-h2' }, 'How was it?')),
      verdict.node,
      el('h3', { class: 't-h3 after__head' }, 'What made it work?'),
      worked.node,
      helpCard,
      helpBody,
      el('div', { class: 'sheet__actions' },
        button('Save to Moments', { onClick: save }),
        button('Skip', { variant: 'ghost', cls: 'btn--muted', onClick: () => { close(); leave(); } }),
      ),
    );
    close = openSheet(content, { label: 'How was it?', onDismiss: leave });
  };

  return { node, onMount: () => setTimeout(openAfter, 120) };
}

/* ---------- C15 Place closed ---------- */
export function c15(route) {
  const place = data.findPlace(route.params[0]) || data.findPlace('butterfly-park');
  const alts = (place.alternatives || []).map((id) => data.findPlace(id));
  const { node } = screenShell({
    label: `${place.name}, closed`,
    top: topBar({ title: '', onBack: () => router.back('home'), action: saveGhost('place', place.id) }),
    body: [
      refSlot(place, { cls: 'place-hero__img place-hero__img--round', width: 800, height: 400, eager: true, iconSize: 56 }),
      el('div', { class: 'closed__banner' }, banner({ iconName: 'event_busy', title: `Closed this ${store.slotDay()}`, body: place.closedNote })),
      el('h1', { class: 't-h1 detail__title' }, place.name),
      el('p', { class: 't-small c-secondary' }, `${fill(place.description)} · ${place.area}`),
      el('h2', { class: 't-h3 nothing__head' }, `${WORDS[alts.length]} places like it, open on ${store.slotDay()}`),
      el('div', { class: 'stack-md' }, ...alts.map((a) => listRow({
        thumb: refSlot(a, { cls: 'list-row__thumb', width: 144, height: 144 }),
        title: a.name,
        lines: [`${a.travelMin} min · Rs ${a.costForThree} for three · ${a.shortLine}`],
        trailing: el('span', { class: 'save-row__chev' }, icon('chevron_right')),
        onOpen: () => openPlace(a.id),
      }))),
      el('div', { class: 'results__actions' }, button('Tell us if this is wrong', { variant: 'secondary', onClick: () => toast('Thanks. We will check.') })),
    ],
  });
  return { node };
}

/* ---------- C16 Location off ---------- */
export function c16() {
  const top = store.matchingPlaces()[0] || data.findPlace('lumbini-gardens');
  const ord = store.ordinaryPlace();
  const area = field({ label: 'Your area', value: 'Hebbal, Bengaluru', autocomplete: 'address-level2' });
  area.node.querySelector('label').classList.add('sr-only');
  area.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { area.input.blur(); toast('Area set to ' + area.input.value.trim()); } });

  const { node } = screenShell({
    label: 'Location off',
    top: resultsTop(),
    body: [
      el('div', { class: 'empty-card location-off' },
        el('h1', { class: 't-title' }, 'Distances are hidden'),
        el('p', { class: 't-small c-secondary' }, 'Location is off, so we cannot work out travel time or sort by how far. Everything else still works.'),
      ),
      el('div', { class: 'results__actions' }, button('Turn on location', {
        variant: 'secondary', iconName: 'my_location',
        onClick: () => { store.update((st) => { st.settings.demoLocationOff = false; }); router.navigate('c4', { replace: true }); },
      })),
      el('h2', { class: 't-h3 nothing__head' }, 'Or set your area by hand'),
      area.node,
      el('h2', { class: 't-h3 nothing__head' }, 'Places that fit otherwise'),
      el('div', { class: 'stack-md' },
        listRow({
          thumb: refSlot(top, { cls: 'list-row__thumb', width: 144, height: 144 }), title: top.name,
          lines: [`Rs ${top.costForThree} for three · ${top.costNote} · distance unknown`],
          onOpen: () => openPlace(top.id),
        }),
        listRow({
          thumb: refSlot(ord, { cls: 'list-row__thumb', width: 144, height: 144 }), title: data.placeName(ord),
          lines: [`Free · ${ord.thingsCount} things to do there · distance unknown`],
          onOpen: () => router.navigate(`c12/${ord.id}`),
        }),
      ),
    ],
  });
  return { node, nav: 'home' };
}

