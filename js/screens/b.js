// Lane B: weekday evening (B1 to B17), plus Home (A12 / B2 / B15) and E5 (empty Moments).

import * as data from '../data.js';
import * as store from '../store.js';
import * as router from '../router.js';
import { icon } from '../icons.js';
import { currentTheme } from '../theme.js';
import {
  el, button, chipRadioGroup, optionGroup, progress, topBar, greetingBar, titleBar, banner,
  mascot, refSlot, slot, heroCard, sectionHead, emptyCard, ideaCard, skeletonCard, regularTile, saveRow,
  toast, comingSoon, screenShell, pressable, openSheet, polaroid, compactRow, editTextSheet,
} from '../components.js';
import { openPlace, saveBackCard, weekendSlotCard } from './c.js';
import { savedTabs } from './d.js';

const fill = (t) => store.fill(t);
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];

function savedToast(nowSaved, undo) {
  if (nowSaved) toast('Saved', { actionLabel: 'Undo', onAction: undo });
  else toast('Removed from saves', { actionLabel: 'Undo', onAction: undo });
}

function openRef(kind, id) {
  if (kind === 'idea') router.navigate(`b8/${id}`);
  else if (kind === 'place' && id) openPlace(id);
  else router.navigate('d5', { transition: 'fade' });
}

/* ---------- Home: one module stack, the lead card changes ----------
   Order, always: greeting, lead card, compact row(s) for whichever of tonight
   and this weekend is not leading, Moments strip, regulars, saves.
   Lead, first match wins: first run (A12), skipped tonight (B15), a save is
   due (D6), Thu to Sat before 6pm (C1), otherwise tonight (B2). */
function homeLead(s) {
  const firstRun = !s.regulars.length && !s.saves.length;
  if (firstRun) return 'firstRun';
  if (store.hasSkippedTonight()) return 'skipped';
  if (store.saveDueToday()) return 'saveDue';
  const evening = currentTheme() === 'evening';
  const weekendDay = [4, 5, 6].includes(new Date().getDay());
  // The weekend demo lane pins the weekend lead so it shows on any weekday.
  if (!evening && (weekendDay || s.settings.demoLead === 'weekend')) return 'weekend';
  return 'tonight';
}

function tonightCard(firstRun) {
  return heroCard({
    overline: 'Tonight',
    title: 'How much have you got left?',
    body: firstRun
      ? 'Answer three quick things and we will find something for the next twenty minutes.'
      : 'Three taps. We will find something for the time you actually have.',
    actionLabel: 'Let’s see',
    onAction: () => router.navigate('b3'),
    mascotNode: mascot('happy', 'happy', 80),
  });
}

function tonightRow() {
  return compactRow({ iconName: 'bedtime', tag: 'sky', title: '20 minutes before bed?', actionLabel: 'Find something', onOpen: () => router.navigate('b3') });
}

function weekendRow() {
  const plan = store.get().plan;
  const place = plan && data.findPlace(plan.placeId);
  if (place) {
    return compactRow({ iconName: 'park', tag: 'leaf', title: `${store.slotDay()}, ${place.name} at 8am`, onOpen: () => router.navigate(`c9/${place.id}`) });
  }
  return compactRow({ iconName: 'park', tag: 'leaf', title: `${store.get().settings.slot || 'Sunday morning'} is open`, actionLabel: 'Plan something', onOpen: () => router.navigate('c2/1') });
}

export function home() {
  const s = store.get();
  if (!s.session.onboarded) { router.navigate('a1', { replace: true, transition: 'fade' }); return null; }

  const me = store.user();
  const evening = currentTheme() === 'evening';
  const greeting = evening ? `Evening, ${me.name}` : `${WEEKDAYS[new Date().getDay()]}, ${me.name}`;
  const lead = homeLead(s);

  let hero;
  if (lead === 'skipped') {
    hero = heroCard({
      overline: 'Tonight',
      title: 'Nothing on tonight',
      body: 'We will not ask again this evening. Tomorrow’s nudge is unchanged.',
      mascotNode: mascot('happy', 'sleepy', 80),
    });
  } else if (lead === 'saveDue') hero = saveBackCard();
  else if (lead === 'weekend') hero = weekendSlotCard();
  else hero = tonightCard(lead === 'firstRun');

  const rows = [];
  if (lead !== 'tonight') rows.push(tonightRow());
  if (lead !== 'weekend') rows.push(weekendRow());

  const regulars = s.regulars.slice(0, 2);
  const regularsNode = regulars.length
    ? el('div', { class: 'regular-grid' }, ...regulars.map((r) => {
      const ref = data.findRef(r.refKind, r.refId);
      const caption = r.refKind === 'idea'
        ? `Worked ${r.timesWorked} ${r.timesWorked === 1 ? 'time' : 'times'}`
        : (data.shortTwists[r.refId] || r.lastDone);
      return regularTile({ ref, title: ref.shortTitle, caption, onOpen: () => openRef(r.refKind, r.refId) });
    }))
    : emptyCard('Nothing here yet', fill('What works for {child} and for you collects here.'));

  // D6 brings the occasion board up to the top of the saves.
  const cubbonId = 'cubbon-park-bandstand';
  let saves = s.saves.filter((x) => x.onHome !== false);
  if (lead === 'saveDue') {
    const occ = s.occasion;
    const board = {
      id: 'board', kind: 'board', title: `${fill(occ.title)}, in 3 weeks`,
      meta: `${occ.candidates.length} animal places saved · make a board`,
    };
    saves = [board, ...saves.filter((x) => x.refId !== cubbonId)];
  }
  saves = saves.slice(0, 3);
  const openSave = (sv) => (sv.kind === 'board' ? router.navigate('d7') : openRef(sv.refKind, sv.refId));
  const savesNode = saves.length
    ? el('div', { class: 'save-list' }, ...saves.map((sv) => saveRow(sv, { onOpen: () => openSave(sv) })))
    : emptyCard('Nothing saved yet', 'Share a reel to Dabble, or save a place or an idea, and it waits here until a day fits it.');

  const avatar = el('button', { type: 'button', class: 'avatar', 'aria-label': 'Profiles' }, me.name.slice(0, 1));
  pressable(avatar, () => router.navigate('e7', { transition: 'fade' }));

  const { node } = screenShell({
    label: 'Home',
    top: greetingBar(greeting, { action: avatar }),
    body: [
      hero,
      rows.length ? el('div', { class: 'stack-md home__rows' }, ...rows) : null,
      sectionHead('Moments', { actionLabel: 'See all', onAction: () => router.navigate('b12', { transition: 'fade' }) }),
      momentsStrip(),
      sectionHead('Your regulars', { actionLabel: 'See all', onAction: () => router.navigate('b14', { transition: 'fade' }) }),
      regularsNode,
      sectionHead('Your saves', { actionLabel: 'See all', onAction: () => router.navigate('d5', { transition: 'fade' }) }),
      savesNode,
    ],
  });
  return { node, nav: 'home' };
}

/* ---------- Moments: polaroids, captions ---------- */
function momentDate(m) {
  return `${Number(m.date.slice(8, 10))} ${MONTHS[Number(m.date.slice(5, 7)) - 1]}`;
}

function momentMeta(m) {
  const v = data.verdicts.find((x) => x.id === m.verdict);
  return [momentDate(m), v ? fill(v.label) : null].filter(Boolean).join(' · ');
}

function editCaption(m) {
  editTextSheet({
    title: 'Edit caption',
    label: 'Caption',
    value: store.momentCaption(m),
    multiline: true,
    onSave: (v) => {
      store.update((st) => {
        const target = st.moments.find((x) => x.id === m.id);
        if (target) target.caption = v || undefined;
      });
      router.refresh();
    },
  });
}

function momentPolaroid(m, index, size) {
  const ref = data.findRef(m.refKind, m.refId);
  if (!ref) return null;
  const caption = store.momentCaption(m);
  return polaroid({
    ref, photo: m.photos?.[0], caption, meta: momentMeta(m), size, index,
    ariaLabel: `${caption}, ${momentMeta(m)}. Edit caption`,
    onOpen: () => editCaption(m),
  });
}

function momentsStrip() {
  const s = store.get();
  const empty = !s.moments.length || s.settings.demoEmptyMoments;
  if (empty) {
    const idea = store.matchingIdeas()[0] || data.findIdea('pouring-and-counting');
    return el('div', { class: 'polaroid-strip hscroll' },
      polaroid({ ref: idea, caption: 'Your first one lands tonight', onOpen: () => router.navigate('b3') }));
  }
  const newest = [...s.moments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  return el('div', { class: 'polaroid-strip hscroll', role: 'group', 'aria-label': 'Recent moments' },
    ...newest.map((m, i) => momentPolaroid(m, i, 'sm')));
}

/* ---------- B1 Evening nudge, lock screen ---------- */
export function b1() {
  const now = new Date();
  const time = `${((now.getHours() + 11) % 12) + 1}:${String(now.getMinutes()).padStart(2, '0')}`;
  const open = () => {
    router.navigate('home', { transition: 'fade', replace: true });
    router.resetStack();
  };

  const notification = el('div', { class: 'lock__note', role: 'button', 'aria-label': 'Open Dabble notification: Tonight, pouring play at bath time' },
    el('div', { class: 'lock__note-app' },
      el('img', { class: 'lock__note-icon', src: 'logo-mark.png', width: 20, height: 20, alt: '', decoding: 'async' }),
      el('span', { class: 't-overline' }, 'Dabble'),
      el('span', { class: 't-caption lock__note-time' }, 'now'),
    ),
    el('p', { class: 't-title' }, 'Tonight: pouring play at bath time'),
    el('p', { class: 't-small' }, '10 minutes, sitting down, uses a bucket you already have'),
  );
  pressable(notification, open);

  const node = el('section', { class: 'screen lock', 'aria-label': 'Lock screen' },
    el('div', { class: 'lock__clock' },
      el('h1', { class: 'lock__time' }, time),
      el('p', { class: 't-title lock__date' }, data.lockDate),
    ),
    notification,
    el('p', { class: 't-small lock__hint' }, 'Slide to open. One nudge only, nothing follows if you skip it.'),
  );

  // Slide up anywhere to open, like a real lock screen.
  let startY = null;
  node.addEventListener('pointerdown', (e) => { startY = e.clientY; });
  node.addEventListener('pointerup', (e) => {
    if (startY !== null && startY - e.clientY > 80) open();
    startY = null;
  });
  return { node, chrome: 'lock', brand: false };
}

/* ---------- B3 to B5 Check-in ---------- */
function checkInStep(step) {
  const s = store.get();
  const c = s.checkIn;
  const skip = () => {
    store.update((st) => { st.checkIn = { ...data.checkInDefaults }; st.resultsPage = 0; });
    router.navigate('b6');
  };
  const top = topBar({ title: 'Tonight', onBack: () => router.back('home'), actionLabel: 'Skip', onAction: skip });
  const stepMeta = el('div', { class: 'checkin__step' },
    el('p', { class: 't-caption c-muted' }, `${step} of 3`),
    progress(3, step, { label: `Question ${step} of 3` }),
  );

  let body;
  let footerBtn;
  if (step === 1) {
    const opts = optionGroup(data.minuteOptions.map((o) => ({ id: o.id, title: o.title })), {
      selected: c.minutes, label: 'How long have you got?',
      onChange: (v) => store.update((st) => { st.checkIn.minutes = v; }),
    });
    body = [el('h1', { class: 't-h1 checkin__q' }, 'How long have you got?'), opts.node];
    footerBtn = button('Next', { onClick: () => router.navigate('b4') });
  } else if (step === 2) {
    const opts = optionGroup(data.postureOptions.map((o) => ({ id: o.id, title: o.title, sub: fill(o.sub) })), {
      selected: c.posture, label: 'How much are you up for?',
      onChange: (v) => store.update((st) => { st.checkIn.posture = v; }),
    });
    body = [
      el('h1', { class: 't-h1 checkin__q' }, 'How much are you up for?'),
      el('p', { class: 't-body c-secondary checkin__sub' }, 'No judgement. It only changes what we suggest.'),
      opts.node,
    ];
    footerBtn = button('Next', { onClick: () => router.navigate('b5') });
  } else {
    const summary = el('p', { class: 't-body-strong', 'aria-live': 'polite' });
    const paint = () => { summary.textContent = summaryLine('us', ' · '); };
    const opts = optionGroup(data.whoOptions.map((o) => ({ id: o.id, title: fill(o.title), sub: fill(o.sub) })), {
      selected: c.who, label: 'Who is playing tonight?',
      onChange: (v) => { store.update((st) => { st.checkIn.who = v; }); paint(); },
    });
    paint();
    const change = button('Change any of it', { variant: 'ghost', cls: 'summary-card__change t-small-strong', onClick: () => router.navigate('b3', { transition: 'back' }) });
    body = [
      el('h1', { class: 't-h1 checkin__q' }, 'Who is playing tonight?'),
      opts.node,
      el('div', { class: 'surface-card summary-card' },
        el('p', { class: 't-overline c-muted' }, 'Tonight'),
        summary,
        change,
      ),
    ];
    footerBtn = button('Show me ideas', {
      onClick: () => { store.update((st) => { st.resultsPage = 0; }); router.navigate('b6'); },
    });
  }

  const { node } = screenShell({ label: 'Tonight', top, body: [...body, stepMeta], footer: [footerBtn] });
  return { node };
}

export const b3 = () => checkInStep(1);
export const b4 = () => checkInStep(2);
export const b5 = () => checkInStep(3);

// "20 minutes, sitting down, both of you"
function summaryLine(voice = 'you', sep = ', ') {
  const c = store.get().checkIn;
  const m = c.minutes === 999 ? 'more than 30 minutes' : `${c.minutes} minutes`;
  const who = data.whoOptions.find((o) => o.id === c.who) || data.whoOptions[0];
  return [m, store.postureLabel(c.posture), fill(voice === 'us' ? who.us : who.you)].join(sep);
}

function resultsTop() {
  return topBar({ title: 'Tonight', onBack: () => router.back('home'), actionLabel: 'Change', onAction: () => router.navigate('b3') });
}

function fitLine(idea) {
  return `${store.get().child.name || 'Your child'}: ${idea.fitChild} · ${fill(idea.fitAdult)}`;
}

/* ---------- B6 Results, B16 Offline ---------- */
export function b6() {
  if (store.isOffline()) return b16();

  const all = store.matchingIdeas();
  const page = store.get().resultsPage || 0;
  const list = all.slice(page * 3, page * 3 + 3);
  if (!list.length) { router.navigate('b7', { replace: true }); return null; }

  const word = COUNT_WORDS[list.length];
  const heading = el('h1', { class: 't-h1 results__title' }, `${word} that ${list.length === 1 ? 'fits' : 'fit'} both of you`);
  const listEl = el('div', { class: 'stack-md', 'aria-busy': 'true' }, skeletonCard(), skeletonCard(), skeletonCard());

  const more = button('Show me something else', {
    variant: 'secondary',
    onClick: () => {
      const nextPage = page + 1;
      if (all.slice(nextPage * 3, nextPage * 3 + 3).length) {
        store.update((st) => { st.resultsPage = nextPage; });
        router.refresh();
      } else {
        router.navigate('b7');
      }
    },
  });
  const fold = button('None of these? Fold it into dinner or bath instead', { variant: 'ghost', cls: 'results__fold t-small-strong', onClick: () => router.navigate('b13') });

  const { node } = screenShell({
    label: 'Tonight’s ideas',
    top: resultsTop(),
    body: [
      el('p', { class: 't-small c-muted' }, summaryLine()),
      heading,
      listEl,
      el('div', { class: 'results__actions' }, more, fold),
    ],
  });

  return {
    node,
    nav: 'home',
    onMount() {
      setTimeout(() => {
        if (!listEl.isConnected) return;
        listEl.replaceChildren(...list.map((idea) => ideaCard(idea, {
          fitLine: fitLine(idea), onOpen: () => router.navigate(`b8/${idea.id}`), onToast: savedToast,
        })));
        listEl.removeAttribute('aria-busy');
      }, 600);
    },
  };
}

export function b16() {
  const ideas = store.offlineIdeas();
  const retry = button('Try again', {
    variant: 'secondary',
    onClick: () => {
      if (store.isOffline()) toast('Still offline');
      else router.refresh();
    },
  });
  const { node } = screenShell({
    label: 'Offline',
    top: resultsTop(),
    body: [
      banner({ iconName: 'wifi_off', title: 'You are offline', body: 'Showing ideas saved on your phone. Places and new ideas need a connection.' }),
      el('h2', { class: 't-h3 results__offline-head' }, 'Still available offline'),
      ideas.length
        ? el('div', { class: 'stack-md' }, ...ideas.map((idea) => ideaCard(idea, {
          fitLine: 'Saved on this phone', fitCls: 'idea-card__saved', onOpen: () => router.navigate(`b8/${idea.id}`), onToast: savedToast,
        })))
        : emptyCard('Nothing saved yet', 'Share a reel to Dabble, or save a place or an idea, and it waits here until a day fits it.'),
      el('div', { class: 'results__actions' }, retry),
    ],
  });
  return { node, nav: 'home' };
}

/* ---------- B7 Nothing fits ---------- */
export function b7() {
  const s = store.get();
  const c = s.checkIn;
  const minutesWord = data.minuteOptions.find((m) => m.id === c.minutes)?.word || 'ten';
  const pouring = data.findIdea('pouring-and-counting');
  const torch = data.findIdea('torch-shadow-stories');
  const torchRegular = store.regularFor('idea', torch.id);

  const option = (idea, title, body) => {
    const card = el('button', { type: 'button', class: 'card fallback-card' },
      refSlot(idea, { cls: 'fallback-card__thumb', width: 144, height: 144 }),
      el('span', { class: 'fallback-card__text' },
        el('span', { class: 't-title' }, title),
        el('span', { class: 't-small c-secondary' }, body),
      ),
      el('span', { class: 'save-row__chev' }, icon('chevron_right')),
    );
    pressable(card, () => router.navigate(`b8/${idea.id}`));
    return card;
  };

  const options = [option(pouring, 'Fold it into bath time', fill(pouring.fallbackLine))];
  if (torchRegular) {
    options.push(option(torch, `${torch.shortTitle}, again`,
      fill(`Your regular. Worked ${torchRegular.timesWorked} ${torchRegular.timesWorked === 1 ? 'time' : 'times'}. She asks for it.`)));
  }

  const skip = button('Skip tonight', {
    variant: 'secondary',
    onClick: () => {
      store.update((st) => { st.session.skippedUntil = store.nextSixAm(); });
      router.navigate('home', { transition: 'fade', replace: true });
      router.resetStack();
    },
  });

  const { node } = screenShell({
    label: 'Not much fits',
    top: resultsTop(),
    body: [
      el('p', { class: 't-small c-muted' }, summaryLine()),
      el('div', { class: 'nothing' },
        mascot('thinking', 'sleepy', 96),
        el('h1', { class: 't-h2' }, 'Not much fits that tonight'),
        el('p', { class: 't-small c-secondary' }, fill(`You have ${minutesWord} minutes and nothing at home from {child}’s list.`)),
      ),
      el('h2', { class: 't-h3 nothing__head' }, `${COUNT_WORDS[options.length]} that still ${options.length === 1 ? 'works' : 'work'} for both of you`),
      el('div', { class: 'stack-md' }, ...options),
      el('div', { class: 'results__actions' }, skip, el('p', { class: 't-caption c-muted nothing__caption' }, 'No streak, nothing to lose.')),
    ],
  });
  return { node, nav: 'home' };
}

/* ---------- B8 Idea detail ---------- */
export function b8(route) {
  const idea = data.findIdea(route.params[0]);
  if (!idea) { router.navigate('home', { replace: true }); return null; }
  const s = store.get();
  const childName = s.child.name || 'Your child';

  const saveBtn = button('', { variant: 'ghost', cls: 'detail__save' });
  const paintSave = () => {
    const on = store.isSaved('idea', idea.id);
    saveBtn.querySelector('span:last-child').textContent = on ? 'Saved' : 'Save';
    saveBtn.setAttribute('aria-pressed', String(on));
  };
  saveBtn.addEventListener('click', () => {
    const nowSaved = store.toggleSave('idea', idea.id);
    paintSave();
    savedToast(nowSaved, () => { store.toggleSave('idea', idea.id); paintSave(); });
  });
  paintSave();

  const steps = el('ol', { class: 'steps' }, ...idea.steps.map((st, i) => el('li', { class: 'steps__item' },
    el('span', { class: 'steps__num t-small-strong', 'aria-hidden': 'true' }, String(i + 1)),
    el('span', { class: 't-body' }, fill(`${st.text}.`)),
  )));

  const { node } = screenShell({
    label: idea.title,
    top: topBar({ title: 'Tonight', onBack: () => router.back('b6'), action: saveBtn }),
    body: [
      refSlot(idea, { cls: 'detail__hero', width: 700, height: 350, eager: true, iconSize: 56 }),
      el('h1', { class: 't-h1 detail__title' }, idea.title),
      el('div', { class: 'tag-row' },
        el('span', { class: 'tag tag--marigold' }, `${idea.minutes} min · ${store.postureLabel(idea.posture)}`),
        el('span', { class: 'tag tag--leaf' }, 'Fits both of you'),
      ),
      el('section', { class: 'why', 'aria-label': 'Why this one for both of you' },
        el('p', { class: 't-overline' }, 'Why this one for both of you'),
        el('p', { class: 'why__line t-small' }, icon('sentiment_satisfied'), el('span', {}, `${childName}: ${idea.whyChild}`)),
        el('p', { class: 'why__line t-small' }, icon('chair'), el('span', {}, `You: ${fill(idea.whyAdult)}`)),
      ),
      el('h2', { class: 't-h3 detail__h' }, 'What you need'),
      el('p', { class: 't-body c-secondary' }, idea.need),
      el('h2', { class: 't-h3 detail__h' }, 'Mess and safety'),
      el('p', { class: 't-body c-secondary' }, fill(idea.safety)),
      el('h2', { class: 't-h3 detail__h' }, 'Steps'),
      steps,
    ],
    footer: [button('Start', {
      onClick: () => {
        store.update((st) => { st.capture = { ideaId: idea.id, verdict: null, photos: [], startedAt: Date.now() }; });
        router.navigate(`b9/${idea.id}/1`);
      },
    })],
  });
  return { node };
}

/* ---------- B9 Idea in progress, B10 early exit ---------- */
export function b9(route) {
  const idea = data.findIdea(route.params[0]);
  if (!idea) { router.navigate('home', { replace: true }); return null; }
  const n = Math.min(Math.max(parseInt(route.params[1] || '1', 10), 1), idea.steps.length);
  const total = idea.steps.length;
  const step = idea.steps[n - 1];
  const isLast = n === total;

  const endEarly = () => openExitSheet(idea, step);

  const stepImg = step.image
    ? slot({ src: data.illustrationPath(step.image), alt: `Step ${n} of ${idea.title.toLowerCase()}`, fallback: idea.fallback, cls: 'progress-step__img', width: 600, height: 600, eager: true, iconSize: 48 })
    : refSlot(idea, { cls: 'progress-step__img', width: 600, height: 600, eager: true, iconSize: 48 });

  const top = topBar({ title: `Step ${n} of ${total}`, onBack: () => router.back(`b8/${idea.id}`), actionLabel: 'End', onAction: endEarly });
  const { node } = screenShell({
    label: `Step ${n} of ${total}`,
    cls: 'progress-step',
    top,
    body: [
      progress(total, n, { label: `Step ${n} of ${total}` }),
      el('h1', { class: 't-h1 progress-step__title' }, fill(step.text)),
      stepImg,
      el('div', { class: 'say' },
        el('p', { class: 't-overline c-muted' }, 'Say something like'),
        el('p', { class: 't-body' }, fill(step.say)),
      ),
    ],
    footer: [
      button(isLast ? 'Finish' : 'Next step', {
        onClick: () => router.navigate(isLast ? `b11/${idea.id}` : `b9/${idea.id}/${n + 1}`),
      }),
      button('Not working? End it here', { variant: 'ghost', cls: 'btn--muted', onClick: endEarly }),
    ],
  });
  return { node };
}

function openExitSheet(idea) {
  let close;
  const reasons = chipRadioGroup(data.exitReasons.map((r) => ({ id: r, label: fill(r) })), { label: 'Why are you stopping?', fill: 2 });
  const go = () => {
    const reason = reasons.get();
    if (reason === 'She did not like it') store.update((st) => { st.notForHer[idea.id] = (st.notForHer[idea.id] || 0) + 1; });
    close();
    router.navigate(`b11/${idea.id}`);
  };
  const content = el('div', {},
    el('div', { class: 'sheet__head' },
      mascot('happy', 'sleepy', 72),
      el('h2', { class: 't-h2' }, 'Stopping here is fine'),
    ),
    el('p', { class: 't-small c-secondary sheet__body' }, 'Four minutes still counts. Tell us one thing so tonight’s suggestion is better next time.'),
    reasons.node,
    el('div', { class: 'sheet__actions' },
      button('Done', { onClick: go }),
      button('Skip this', { variant: 'ghost', cls: 'btn--muted', onClick: () => { close(); router.navigate(`b11/${idea.id}`); } }),
    ),
  );
  close = openSheet(content, { label: 'Stopping here is fine' });
}

/* ---------- B11 Capture moment sheet ---------- */
export function b11(route) {
  const idea = data.findIdea(route.params[0]);
  if (!idea) { router.navigate('home', { replace: true }); return null; }
  if (store.get().capture.ideaId !== idea.id) {
    store.update((st) => { st.capture = { ideaId: idea.id, verdict: null, photos: [], startedAt: Date.now() }; });
  }

  const leave = () => {
    store.update((st) => { st.capture = { ideaId: null, verdict: null, photos: [] }; });
    router.navigate('home', { transition: 'fade', replace: true });
    router.resetStack();
  };

  const { node } = screenShell({
    label: 'How did that go?',
    top: topBar({ title: 'Tonight', onBack: leave }),
    body: [
      el('h1', { class: 't-h2 capture__title' }, idea.title),
      refSlot(idea, { cls: 'capture__hero', width: 700, height: 350, eager: true }),
    ],
  });

  const openCapture = () => {
    const cap = store.get().capture;
    const verdict = chipRadioGroup(data.verdicts.map((v) => ({ id: v.id, label: fill(v.label) })), {
      selected: cap.verdict, label: 'How did that go?', fill: 3,
      onChange: (v) => store.update((st) => { st.capture.verdict = v; }),
    });

    const toImport = () => { close(); router.navigate('b17'); };
    const addTile = el('button', { type: 'button', class: 'photo-tile photo-tile--add', 'aria-label': 'Add a photo' }, icon('add', { size: 28 }));
    pressable(addTile, toImport);
    const photos = cap.photos.map((f) => el('div', { class: 'photo-tile' },
      el('img', { src: data.illustrationPath(f), alt: data.galleryAlt[f] || 'Photo', width: 200, height: 200, decoding: 'async' })));
    while (photos.length < 2) photos.push(el('div', { class: 'photo-tile', 'aria-hidden': 'true' }));

    const save = () => {
      const c = store.get().capture;
      store.update((st) => {
        st.moments.unshift({
          id: `m-${Date.now()}`, refKind: 'idea', refId: idea.id, date: new Date().toISOString().slice(0, 10),
          verdict: c.verdict || 'mixed', photos: [...c.photos], atHome: true,
        });
        if (c.verdict === 'loved') {
          const r = st.regulars.find((x) => x.refKind === 'idea' && x.refId === idea.id);
          if (r) { r.timesWorked += 1; r.lastDone = 'today'; }
          else st.regulars.unshift({ refKind: 'idea', refId: idea.id, timesWorked: 1, lastDone: 'today', twist: '' });
        }
        if (c.verdict === 'not') st.notForHer[idea.id] = (st.notForHer[idea.id] || 0) + 1;
        st.settings.demoEmptyMoments = false;
        st.capture = { ideaId: null, verdict: null, photos: [] };
      });
      close();
      toast('Added to Moments');
      router.navigate('b12', { transition: 'fade', replace: true });
      router.resetStack();
    };

    const content = el('div', {},
      el('div', { class: 'sheet__head' },
        mascot('celebrating', 'happy', 88),
        el('h2', { class: 't-h2' }, 'How did that go?'),
      ),
      verdict.node,
      el('div', { class: 'capture__photo-head' },
        el('h3', { class: 't-h3' }, 'Add a photo'),
        button('Import from images', { variant: 'ghost', cls: 't-small-strong', onClick: toImport }),
      ),
      el('p', { class: 't-small c-muted' }, 'Optional, always. Take one now, or bring one in from your gallery or another app.'),
      el('div', { class: 'photo-grid capture__photos' }, addTile, ...photos),
      el('div', { class: 'sheet__actions' },
        button('Save to Moments', { onClick: save }),
        button('Skip', { variant: 'ghost', cls: 'btn--muted', onClick: () => { close(); leave(); } }),
      ),
    );
    const close = openSheet(content, { label: 'How did that go?', onDismiss: leave });
  };

  return { node, onMount: () => setTimeout(openCapture, 120) };
}

/* ---------- B12 Moments album, E5 empty ---------- */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function b12() {
  const s = store.get();
  if (!s.moments.length || s.settings.demoEmptyMoments) return e5();

  // Group by month, newest first.
  const groups = new Map();
  [...s.moments].sort((a, b) => b.date.localeCompare(a.date)).forEach((m) => {
    const key = m.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  });
  const nowKey = new Date().toISOString().slice(0, 7);
  const summaryKey = groups.has(nowKey) ? nowKey : [...groups.keys()][0];
  const month = groups.get(summaryKey);
  const atHome = month.filter((m) => m.atHome).length;
  const loved = month.filter((m) => m.verdict === 'loved').length;

  const sections = [...groups.entries()].map(([key, items]) => el('section', { class: 'moments__month', 'aria-label': MONTHS[Number(key.slice(5, 7)) - 1] },
    el('h2', { class: 't-h3 moments__month-title' }, MONTHS[Number(key.slice(5, 7)) - 1]),
    el('div', { class: 'polaroid-grid' }, ...items.map((m, i) => momentPolaroid(m, i, 'lg'))),
  ));

  const { node } = screenShell({
    label: 'Moments',
    top: titleBar('Moments', { actionLabel: 'Recap', onAction: comingSoon }),
    body: [
      el('div', { class: 'surface-card moments__summary' },
        el('p', { class: 't-overline c-muted' }, 'This month'),
        el('p', { class: 't-body-strong' }, `${month.length} things together · ${atHome} at home, ${month.length - atHome} out`),
        el('p', { class: 't-small c-secondary' }, fill(`She loved ${loved} of them`)),
      ),
      ...sections,
    ],
  });
  return { node, nav: 'moments' };
}

export function e5() {
  const { node } = screenShell({
    label: 'Moments',
    top: titleBar('Moments', { actionLabel: null }),
    body: [
      el('div', { class: 'empty-card moments__empty' },
        mascot('waving', 'waving', 160),
        el('h1', { class: 't-h3' }, 'Nothing here yet'),
        el('p', { class: 't-small c-secondary' }, 'Every time you do something together and tap how it went, it lands here. Photos are optional.'),
        button('Find something for tonight', { block: false, onClick: () => router.navigate('b3') }),
        button('Import from images', { variant: 'secondary', block: false, onClick: () => router.navigate('b17?from=e5') }),
      ),
      el('p', { class: 't-caption c-muted moments__hint' }, 'Three evenings is usually enough to fill the first row.'),
    ],
  });
  return { node, nav: 'moments' };
}

/* ---------- B13 Fold into a routine ---------- */
export function b13() {
  const routines = [
    { label: 'Dinner', id: 'washing-vegetables' },
    { label: 'Bath', id: 'pouring-and-counting' },
    { label: 'Bedtime', id: 'bedtime-two-questions' },
  ];
  const cards = routines.map(({ label, id }) => {
    const idea = data.findIdea(id);
    const card = el('button', { type: 'button', class: 'card routine-card' },
      refSlot(idea, { cls: 'routine-card__img', width: 700, height: 300 }),
      el('span', { class: 'routine-card__text' },
        el('span', { class: 'tag tag--marigold' }, label),
        el('span', { class: 't-title' }, idea.title),
        el('span', { class: 't-small c-secondary' }, fill(idea.routineLine)),
      ),
    );
    pressable(card, () => router.navigate(`b8/${id}`));
    return card;
  });

  const { node } = screenShell({
    label: 'Fold into a routine',
    top: resultsTop(),
    body: [
      el('h1', { class: 't-h1' }, 'Nothing extra to set up'),
      el('p', { class: 't-body c-secondary routine__sub' }, 'These attach to things already happening this evening.'),
      el('div', { class: 'stack-md' }, ...cards),
    ],
  });
  return { node, nav: 'home' };
}

/* ---------- B14 Saved, Our regulars ---------- */
export function b14() {
  const s = store.get();
  const rows = s.regulars.map((r) => {
    const ref = data.findRef(r.refKind, r.refId);
    const title = ref.name || ref.title;
    const open = el('div', { class: 'regular-row__main', role: 'button', 'aria-label': title },
      el('span', { class: `save-row__thumb fill--${ref.fallback.tag}` }, icon(ref.fallback.icon)),
      el('span', { class: 'save-row__text' },
        el('span', { class: 't-title' }, title),
        el('span', { class: 't-small c-secondary' }, `Worked ${r.timesWorked} ${r.timesWorked === 1 ? 'time' : 'times'} · ${r.lastDone}`),
      ),
    );
    pressable(open, () => openRef(r.refKind, r.refId));
    const more = el('button', { type: 'button', class: 'idea-card__save', 'aria-label': `More for ${title}` }, icon('more_horiz'));
    pressable(more, comingSoon);
    return el('article', { class: 'card regular-row' },
      el('div', { class: 'regular-row__top' }, open, more),
      r.twist ? el('p', { class: 'regular-row__twist t-small-strong' }, icon('autorenew', { size: 18 }), el('span', {}, fill(r.twist))) : null,
    );
  });

  const { node } = screenShell({
    label: 'Saved',
    top: titleBar('Saved'),
    body: [
      savedTabs('regulars'),
      el('div', { class: 'regulars__head' },
        el('div', {},
          el('h2', { class: 't-h2' }, fill('What has worked for {child}')),
          el('p', { class: 't-small c-secondary' }, 'Each one comes back with a small twist, so it stays fresh.'),
        ),
        mascot('celebrating', 'happy', 96),
      ),
      rows.length ? el('div', { class: 'stack-md' }, ...rows) : emptyCard('Nothing here yet', fill('What works for {child} and for you collects here.')),
    ],
  });
  return { node, nav: 'saved' };
}

/* ---------- B17 Import from images ---------- */
export function b17(route) {
  const fromEmpty = route.query.from === 'e5';
  const order = [...(store.get().capture.photos || [])];
  let tab = 'all';

  const addBtn = button('Add photos', { onClick: () => add() });
  const paintAdd = () => {
    const n = order.length;
    addBtn.querySelector('span').textContent = n ? `Add ${n} ${n === 1 ? 'photo' : 'photos'}` : 'Add photos';
    addBtn.setAttribute('aria-disabled', n ? 'false' : 'true');
  };

  const gridWrap = el('div', { class: 'import__groups' });
  const tiles = new Map();

  const paintOrder = () => {
    tiles.forEach((t, f) => {
      const i = order.indexOf(f);
      t.setAttribute('aria-pressed', String(i >= 0));
      t.querySelector('.photo-tile__order').textContent = i >= 0 ? String(i + 1) : '';
    });
    paintAdd();
  };

  const renderTab = () => {
    tiles.clear();
    const groups = data.gallery[tab];
    if (!groups.length) {
      gridWrap.replaceChildren(emptyCard('Nothing here yet', 'Photos already on your phone, including ones shared to you from somewhere else.'));
      return;
    }
    gridWrap.replaceChildren(...groups.map((g) => el('section', { class: 'import__group', 'aria-label': g.group },
      el('h2', { class: 't-small c-muted import__group-title' }, g.group),
      el('div', { class: 'photo-grid' }, ...g.files.map((f) => {
        const ref = data.ideas.concat(data.places).find((x) => x.illustration === f);
        const alt = data.galleryAlt[f] || ref?.alt || 'Photo';
        const t = el('button', { type: 'button', class: 'photo-tile', 'aria-pressed': 'false', 'aria-label': alt },
          el('img', { src: data.illustrationPath(f), alt: '', width: 200, height: 200, loading: 'lazy', decoding: 'async' }),
          el('span', { class: 'photo-tile__order', 'aria-hidden': 'true' }),
        );
        t.querySelector('img').addEventListener('error', (e) => e.target.replaceWith(el('div', { class: 'slot__fallback fill--surface' }, icon('photo_camera'))), { once: true });
        pressable(t, () => {
          const i = order.indexOf(f);
          if (i >= 0) order.splice(i, 1); else order.push(f);
          paintOrder();
        });
        tiles.set(f, t);
        return t;
      })),
    )));
    paintOrder();
  };

  const tabs = chipRadioGroup([
    { id: 'all', label: 'All photos' },
    { id: 'shared', label: 'Shared with you' },
    { id: 'screenshots', label: 'Screenshots' },
  ], { selected: 'all', label: 'Photo sources', onChange: (v) => { tab = v; renderTab(); } });

  function add() {
    if (!order.length) return;
    if (fromEmpty) { comingSoon(); return; }
    store.update((st) => { st.capture.photos = [...order]; });
    router.back('home');
  }

  renderTab();
  const { node } = screenShell({
    label: 'Import from images',
    top: topBar({ title: 'Import from images', onBack: () => router.back('home'), actionLabel: 'Cancel', onAction: () => router.back('home') }),
    body: [
      el('p', { class: 't-small c-secondary' }, 'Photos already on your phone, including ones shared to you from somewhere else.'),
      el('div', { class: 'import__tabs' }, tabs.node),
      gridWrap,
    ],
    footer: [
      el('p', { class: 'surface-card t-small c-secondary' }, 'These attach to tonight’s activity. Nothing is posted anywhere.'),
      addBtn,
    ],
  });
  return { node };
}
