// User state. localStorage with a silent in-memory fallback, plus pub/sub.

import * as data from './data.js';

const KEY = 'dabble-proto-v1';

const memory = new Map();
const storage = (() => {
  try {
    const k = '__dabble_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return {
      getItem: (k) => (memory.has(k) ? memory.get(k) : null),
      setItem: (k, v) => memory.set(k, String(v)),
      removeItem: (k) => memory.delete(k),
    };
  }
})();

const clone = (v) => JSON.parse(JSON.stringify(v));

function blankState() {
  return {
    session: { signedIn: false, onboarded: false, skippedUntil: 0, otpAttempts: 3, otpLockUntil: 0, phone: '' },
    child: { ...clone(data.child), name: '' },
    adults: clone(data.adults),
    onboarding: {
      interests: [], settle: null, mess: null, enjoys: [], avoids: [], energy: null, weeknight: null, homeItems: [],
    },
    settings: {
      eveningNudge: false, weekendNudge: false, saveComesBack: false, slot: 'Sunday morning',
      themeOverride: 'auto', demoOffline: false, demoLocationOff: false, demoSaveDue: null, demoEmptyMoments: false,
      demoLead: null,
    },
    checkIn: { ...data.checkInDefaults },
    resultsPage: 0,
    saves: [],
    regulars: [],
    moments: [],
    offlineIdeas: [],
    notForHer: {},
    capture: { ideaId: null, verdict: null, photos: [], minutes: 0 },
    // Lanes C, D, E
    outing: { ...data.outingDefaults },
    plan: null,
    slotSkippedUntil: 0,
    saveBackDismissedUntil: 0,
    occasion: clone(data.seedOccasion),
    reel: { id: 1, tags: [], placeName: '', note: '' },
    outingCapture: null,
    askedQuestions: [],
  };
}

// Lanes B to D: an onboarded family with three weeks of history.
// Seeding history never renames a family. When a child name is already set,
// the child's name, age and pronouns and every adult's name are kept. When the
// family has also finished onboarding, their own answers are kept too. The
// seedOnboarding names are only a fallback for a cold lane start.
function seededState(prev) {
  const s = blankState();
  const o = data.seedOnboarding;
  const hasFamily = !!prev?.child?.name;
  const keepAnswers = hasFamily && !!prev.session?.onboarded;
  s.session.signedIn = true;
  s.session.onboarded = true;
  if (hasFamily) {
    s.child.name = prev.child.name;
    s.child.ageYears = prev.child.ageYears;
    s.child.pronoun = clone(prev.child.pronoun);
    s.adults.forEach((a) => {
      const was = prev.adults?.find((x) => x.id === a.id);
      if (was?.name) a.name = was.name;
    });
  } else {
    s.child.name = o.childName;
    s.child.ageYears = o.ageYears;
  }
  if (keepAnswers) {
    s.onboarding = clone(prev.onboarding);
    s.child.interests = [...prev.child.interests];
    s.child.settleMinutes = prev.child.settleMinutes;
    s.child.messTolerance = prev.child.messTolerance;
    const me = prev.adults.find((a) => a.isUser);
    const sMe = s.adults.find((a) => a.isUser);
    sMe.enjoys = [...(me?.enjoys || [])];
    sMe.avoids = [...(me?.avoids || [])];
    sMe.eveningEnergy = me?.eveningEnergy ?? null;
  } else {
    s.child.interests = [...o.interests];
    s.child.settleMinutes = 10;
    s.child.messTolerance = o.mess;
    s.onboarding = {
      interests: [...o.interests], settle: o.settle, mess: o.mess, enjoys: [...o.enjoys], avoids: [...o.avoids],
      energy: o.energy, weeknight: o.weeknight, homeItems: [...o.homeItems],
    };
    s.adults.find((a) => a.isUser).enjoys = [...o.enjoys];
    s.adults.find((a) => a.isUser).avoids = [...o.avoids];
  }
  s.settings.eveningNudge = true;
  s.settings.weekendNudge = true;
  s.settings.saveComesBack = true;
  s.checkIn = { minutes: 20, posture: 'sitting', who: 'both' };
  // History only from here down.
  s.saves = [
    ...clone(data.seedSaves).map((x) => ({ ...x, ...data.saveExtras[x.id] })),
    ...clone(data.extraSaves),
  ];
  s.child.learned = clone(data.seedChildLearned);
  s.adults.find((a) => a.isUser).learned = clone(data.seedAdultLearned);
  s.regulars = clone(data.seedRegulars);
  s.moments = clone(data.seedMoments);
  s.offlineIdeas = ['torch-shadow-stories', 'dal-sensory-tray'];
  return s;
}

function load() {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    const base = blankState();
    return { ...base, ...parsed, session: { ...base.session, ...parsed.session }, settings: { ...base.settings, ...parsed.settings } };
  } catch {
    return blankState();
  }
}

let state = load();
const listeners = new Set();

function persist() {
  try { storage.setItem(KEY, JSON.stringify(state)); } catch { /* in-memory only */ }
}

export function get() { return state; }

export function update(fn) {
  fn(state);
  persist();
  listeners.forEach((l) => l(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function reset(kind = 'blank') {
  const keepTheme = kind === 'blank' ? 'auto' : state.settings.themeOverride;
  state = kind === 'seeded' ? seededState(state) : blankState();
  state.settings.themeOverride = keepTheme;
  persist();
  listeners.forEach((l) => l(state));
}

/* ---------- Derived helpers ---------- */

export function partner() { return state.adults.find((a) => a.role === 'partner'); }
export function user() { return state.adults.find((a) => a.isUser); }

// Fill {child}, {partner}, {partnerSubject} and child pronoun tokens.
export function fill(text) {
  if (!text) return '';
  const c = state.child;
  const p = partner();
  return text
    .replaceAll('{child}', c.name || 'your child')
    .replaceAll('{partner}', p ? p.name : 'your partner')
    .replaceAll('{partnerSubject}', p ? p.pronoun.subject : 'they')
    .replaceAll('{partnerPossessive}', p ? p.pronoun.possessive : 'their')
    .replace(/\bher\b/g, c.pronoun.object)
    .replace(/\bHer\b/g, cap(c.pronoun.possessive))
    .replace(/\bShe\b/g, cap(c.pronoun.subject))
    .replace(/\bshe\b/g, c.pronoun.subject);
}

export function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

export function isSaved(refKind, refId) {
  return state.saves.some((s) => s.refKind === refKind && s.refId === refId);
}

export function regularFor(refKind, refId) {
  return state.regulars.find((r) => r.refKind === refKind && r.refId === refId);
}

export function isOffline() {
  return state.settings.demoOffline || (typeof navigator !== 'undefined' && navigator.onLine === false);
}

export function hasSkippedTonight() {
  return Date.now() < (state.session.skippedUntil || 0);
}

export function nextSixAm() {
  const d = new Date();
  const six = new Date(d);
  six.setHours(6, 0, 0, 0);
  if (d >= six) six.setDate(six.getDate() + 1);
  return six.getTime();
}

const POSTURE_RANK = { sitting: 0, floor: 1, up: 2 };
const MESS_RANK = { wipe: 0, some: 1, any: 2 };

// B6 rules. Rule-based, no randomness.
export function matchingIdeas() {
  const c = state.checkIn;
  const home = new Set(state.onboarding.homeItems);
  const messLimit = MESS_RANK[state.onboarding.mess || 'wipe'];
  return data.ideas
    .filter((i) => !i.routine)
    .filter((i) => i.minutes <= c.minutes)
    .filter((i) => POSTURE_RANK[i.posture] <= POSTURE_RANK[c.posture])
    .filter((i) => MESS_RANK[i.mess] <= messLimit)
    .filter((i) => !i.twoAdult || c.who === 'both')
    .filter((i) => i.needs.every((n) => home.has(n)))
    .filter((i) => (state.notForHer[i.id] || 0) < 2)
    .sort((a, b) => {
      const ra = regularFor('idea', a.id)?.timesWorked || 0;
      const rb = regularFor('idea', b.id)?.timesWorked || 0;
      if (rb !== ra) return rb - ra;
      return a.minutes - b.minutes;
    });
}

export function offlineIdeas() {
  return state.offlineIdeas.map((id) => data.findIdea(id)).filter(Boolean);
}

export function toggleSave(refKind, refId) {
  let nowSaved = false;
  update((s) => {
    const idx = s.saves.findIndex((x) => x.refKind === refKind && x.refId === refId);
    if (idx >= 0) {
      s.saves.splice(idx, 1);
    } else {
      const ref = data.findRef(refKind, refId);
      const meta = refKind === 'idea' ? `${ref.minutes} min · ${postureLabel(ref.posture)}` : '';
      const placeMeta = refKind === 'place' ? placeMetaLine(ref) : meta;
      s.saves.unshift({
        id: `s-${Date.now()}`, kind: refKind, refKind, refId, source: 'app', savedAt: new Date().toISOString(),
        meta: placeMeta, tags: [], sourceLine: `${refKind === 'idea' ? 'Idea' : 'Place'} · saved in the app, today`, wantMeta: placeMeta,
      });
      if (refKind === 'idea' && !s.offlineIdeas.includes(refId)) s.offlineIdeas.push(refId);
      nowSaved = true;
    }
  });
  return nowSaved;
}

export function postureLabel(id) {
  return data.postureOptions.find((p) => p.id === id)?.label || '';
}

/* ---------- Lanes C, D, E ---------- */

export function placeMetaLine(p) {
  if (!p) return '';
  const cost = p.costForThree ? `Rs ${p.costForThree} for three` : 'free';
  return `${p.travelMin} min · ${cost}`;
}

// C4 rules: travel time within the distance band. Closed places stay in.
// One ordinary place is always appended.
export function matchingPlaces() {
  const band = data.outingDistanceOptions.find((d) => d.id === state.outing.distance) || data.outingDistanceOptions[1];
  const list = data.places.filter((p) => !p.ordinary && p.travelMin <= band.max)
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));
  return list;
}

export function ordinaryPlace() { return data.findPlace('nursery-8th-main'); }

// Butterfly Park is closed this Sunday in the seed data.
export function isClosedOnPlannedDay(p) { return !!p && p.openSunday === false; }

export function saveDueToday() {
  const v = state.settings.demoSaveDue;
  const due = v === null || v === undefined ? new Date().getDay() === 6 : v;
  return due && Date.now() >= (state.saveBackDismissedUntil || 0);
}

export function slotSkipped() { return Date.now() < (state.slotSkippedUntil || 0); }

export function nextMonday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return d.getTime();
}

export function slotDay() { return (state.settings.slot || 'Sunday morning').split(' ')[0]; }

export function isOnboarded() { return state.session.onboarded; }

/* ---------- Moments ---------- */

function ordinal(n) {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'}`;
}

// A saved caption wins. Otherwise: the first time this activity shows up in
// Moments it is "{child}'s first ...", after that "{Title}, nth time".
export function momentCaption(m) {
  if (m.caption) return m.caption;
  const ref = data.findRef(m.refKind, m.refId);
  if (!ref) return '';
  const title = m.refKind === 'idea' ? ref.title : (ref.displayName || ref.name);
  const same = state.moments
    .filter((x) => x.refKind === m.refKind && x.refId === m.refId)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)));
  const n = same.findIndex((x) => x.id === m.id) + 1;
  if (n === 1) return fill(`{child}’s first ${m.refKind === 'idea' ? title.toLowerCase() : title}`);
  if (n > 1) return fill(`${title}, ${ordinal(n)} time`);
  return fill(title);
}

/* ---------- Notification permission ---------- */

let notifyAnswer = null;

// Resolves 'granted', 'denied' or 'default', or null when the browser cannot
// ask (unsupported, insecure context, or the call throws). Never asks twice in
// a session, and never asks once the browser already has an answer.
export function askNotify() {
  try {
    if (typeof Notification === 'undefined' || !window.isSecureContext) return Promise.resolve(null);
    if (Notification.permission !== 'default') return Promise.resolve(Notification.permission);
    if (notifyAnswer) return Promise.resolve(notifyAnswer);
    return Promise.resolve(Notification.requestPermission())
      .then((r) => { notifyAnswer = r; return r; }, () => null);
  } catch {
    return Promise.resolve(null);
  }
}
