// Lane A: first run and onboarding (A1 to A12). A12 is the Home route in b.js.

import * as data from '../data.js';
import * as store from '../store.js';
import * as router from '../router.js';
import { icon } from '../icons.js';
import {
  el, button, chipGroup, optionGroup, field, selectField, inlineError, progress, topBar,
  mascot, refSlot, comingSoon, simulated, screenShell, pressable, editTextSheet, toast,
} from '../components.js';

const DEMO_CODE = '246810';
const ONBOARDING_SEGMENTS = 5;

const fill = (t) => store.fill(t);

function heading(textValue, sub) {
  return [
    el('h1', { class: 't-h1 onb__title' }, textValue),
    sub ? el('p', { class: 't-body c-secondary onb__sub' }, sub) : null,
  ];
}

function onbTop(title, back = 'a1') {
  return topBar({ title, onBack: () => router.back(back) });
}

function maskPhone(digits) {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length < 4) return '+91 98••• •••21';
  return `+91 ${d.slice(0, 2)}••• •••${d.slice(-2)}`;
}

/* ---------- A1 Welcome ---------- */
export function a1() {
  const blob = el('div', { class: 'welcome__hero' },
    el('div', { class: 'welcome__blob' }),
    el('span', { class: 'welcome__dot welcome__dot--pink' }),
    el('span', { class: 'welcome__dot welcome__dot--sky' }),
    el('span', { class: 'welcome__dot welcome__dot--leaf' }),
    el('span', { class: 'welcome__dot welcome__dot--tomato' }),
    mascot('waving', 'waving', 260, { cls: 'welcome__mascot' }),
  );
  const { node } = screenShell({
    label: 'Welcome',
    cls: 'welcome',
    body: [
      el('p', { class: 'welcome__word' },
        el('img', { class: 'welcome__logo', src: 'logo-mark.png', width: 36, height: 36, alt: '', decoding: 'async' }),
        el('span', { class: 't-h2' }, 'Dabble'),
      ),
      blob,
      el('h1', { class: 't-display welcome__title' }, fill('Time with them, without the planning')),
      el('p', { class: 't-body c-secondary welcome__sub' }, fill('Ideas for tonight at home, and places worth the trip. Built around your child')),
      el('div', { class: 'welcome__actions' },
        button('Get started', { onClick: () => router.navigate('a2') }),
        button('I already have an account', { variant: 'secondary', onClick: () => router.navigate('a2?back=1') }),
        el('p', { class: 't-caption c-muted welcome__caption' }, 'Takes about a minute. You can change all of it later.'),
        button('Skip sign-in for now', { variant: 'ghost', cls: 'welcome__skip', onClick: () => router.navigate('a5') }),
      ),
    ],
  });
  return { node, brand: false };
}

/* ---------- A2 Sign in ---------- */
export function a2(route) {
  const returning = route.query.back === '1';
  const s = store.get();
  const phone = field({
    label: 'Mobile number', prefix: '+91', type: 'tel', inputmode: 'numeric', autocomplete: 'tel-national',
    value: s.session.phone || '98450 12321', maxlength: 11,
    onInput: () => phone.setError(''),
  });

  const send = () => {
    const digits = phone.input.value.replace(/\D/g, '');
    if (digits.length !== 10) {
      phone.setError('Enter a 10-digit mobile number');
      phone.input.focus();
      return;
    }
    store.update((st) => { st.session.phone = digits; st.session.otpAttempts = 3; st.session.otpLockUntil = 0; });
    router.navigate('a3');
  };
  phone.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  const social = (label) => button(label, {
    variant: 'secondary',
    onClick: () => {
      simulated();
      store.update((st) => { st.session.signedIn = true; });
      setTimeout(() => router.navigate('a5'), 700);
    },
  });

  const { node } = screenShell({
    label: 'Sign in',
    top: topBar({ title: 'Sign in', onBack: () => router.back('a1'), actionLabel: 'Skip', actionAriaLabel: 'Skip sign-in for now', onAction: () => router.navigate('a5') }),
    body: [
      ...heading(returning ? 'Welcome back' : 'Your number', 'We send a one-time code. No password to remember.'),
      el('div', { class: 'stack-lg' },
        phone.node,
        button('Send code', { onClick: send }),
        el('p', { class: 't-small c-muted signin__or' }, 'or'),
        social('Continue with Google'),
        social('Continue with Apple'),
        el('p', { class: 't-caption c-muted signin__legal' }, 'By continuing you agree to the terms and privacy policy.'),
      ),
    ],
  });
  return { node };
}

/* ---------- A3 OTP entry, A4 wrong code ---------- */
const WORDS = ['No', 'One', 'Two', 'Three'];

export function a3(route) {
  const s = store.get();
  if (route.id === 'a4' && s.session.otpAttempts > 2) store.update((st) => { st.session.otpAttempts = 2; });

  const boxes = Array.from({ length: 6 }, (_, i) => el('input', {
    type: 'text', inputmode: 'numeric', autocomplete: i === 0 ? 'one-time-code' : 'off', maxlength: 1,
    'aria-label': `Digit ${i + 1} of 6`,
  }));
  const otp = el('div', { class: 'otp', role: 'group', 'aria-label': 'Six-digit code' }, ...boxes);
  const err = inlineError();
  const resendSlot = el('div', { class: 'otp__resend' });
  const trouble = button('Trouble receiving it? Use email instead', { variant: 'ghost', cls: 'otp__trouble t-small-strong', onClick: comingSoon });
  const verifyBtn = button('Verify', { onClick: () => verify() });

  let resendTimer = null;
  let lockTimer = null;

  const code = () => boxes.map((b) => b.value).join('');
  const paintFilled = () => boxes.forEach((b) => b.classList.toggle('is-filled', !!b.value));

  function setBoxes(str) {
    const d = str.replace(/\D/g, '').slice(0, 6).split('');
    boxes.forEach((b, i) => { b.value = d[i] || ''; });
    paintFilled();
    const next = boxes.find((b) => !b.value);
    (next || boxes[5]).focus();
    if (d.length === 6) verify();
  }

  boxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      const v = b.value.replace(/\D/g, '');
      if (v.length > 1) { setBoxes(code().slice(0, i) + v); return; }
      b.value = v;
      otp.classList.remove('is-error');
      paintFilled();
      if (v && i < 5) boxes[i + 1].focus();
      if (code().length === 6) verify();
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !b.value && i > 0) { e.preventDefault(); boxes[i - 1].value = ''; boxes[i - 1].focus(); paintFilled(); }
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
      if (e.key === 'Enter') verify();
    });
    b.addEventListener('paste', (e) => {
      e.preventDefault();
      setBoxes((e.clipboardData || window.clipboardData).getData('text'));
    });
    b.addEventListener('focus', () => b.select());
  });

  function startResend(seconds = 24) {
    clearInterval(resendTimer);
    let left = seconds;
    const paint = () => {
      if (left > 0) {
        resendSlot.replaceChildren(el('p', { class: 't-small c-muted' }, `Resend in 0:${String(left).padStart(2, '0')}`));
      } else {
        clearInterval(resendTimer);
        resendSlot.replaceChildren(button('Resend code', {
          variant: 'ghost', cls: 'otp__resend-btn t-small-strong',
          onClick: () => { simulated(); startResend(); },
        }));
      }
    };
    paint();
    resendTimer = setInterval(() => { left -= 1; if (!node.isConnected) { clearInterval(resendTimer); return; } paint(); }, 1000);
  }

  function lockFor(untilTs) {
    boxes.forEach((b) => { b.disabled = true; });
    verifyBtn.setAttribute('aria-disabled', 'true');
    clearInterval(lockTimer);
    const paint = () => {
      const left = Math.max(0, Math.ceil((untilTs - Date.now()) / 1000));
      if (left <= 0 || !node.isConnected) {
        clearInterval(lockTimer);
        store.update((st) => { st.session.otpLockUntil = 0; st.session.otpAttempts = 3; });
        boxes.forEach((b) => { b.disabled = false; b.value = ''; });
        verifyBtn.removeAttribute('aria-disabled');
        otp.classList.remove('is-error');
        paintFilled();
        err.set('');
        if (node.isConnected) boxes[0].focus();
        return;
      }
      err.set(`That code did not match. Try again in 0:${String(left).padStart(2, '0')}.`);
    };
    paint();
    lockTimer = setInterval(paint, 1000);
  }

  function showWrong(left) {
    otp.classList.add('is-error');
    otp.classList.remove('is-shaking');
    void otp.offsetWidth;
    otp.classList.add('is-shaking');
    trouble.hidden = false;
    err.set(left === 1 ? 'That code did not match. One attempt left.' : `That code did not match. ${WORDS[left]} attempts left.`);
    if (resendSlot.querySelector('p')) { clearInterval(resendTimer); startResend(0); }
  }

  function verify() {
    if (verifyBtn.getAttribute('aria-disabled') === 'true') return;
    const c = code();
    if (c.length < 6) {
      otp.classList.remove('is-shaking'); void otp.offsetWidth; otp.classList.add('is-shaking');
      boxes.find((b) => !b.value)?.focus();
      return;
    }
    if (c === DEMO_CODE) {
      clearInterval(resendTimer);
      store.update((st) => { st.session.signedIn = true; st.session.otpAttempts = 3; });
      err.set('');
      router.navigate('a5');
      return;
    }
    let left = 0;
    store.update((st) => { st.session.otpAttempts = Math.max(0, st.session.otpAttempts - 1); left = st.session.otpAttempts; });
    if (left <= 0) {
      const until = Date.now() + 30 * 1000;
      store.update((st) => { st.session.otpLockUntil = until; });
      otp.classList.add('is-error');
      trouble.hidden = false;
      lockFor(until);
    } else {
      showWrong(left);
      boxes.forEach((b) => { b.value = ''; });
      paintFilled();
      boxes[0].focus();
      otp.classList.add('is-error');
    }
  }

  trouble.hidden = true;
  const { node } = screenShell({
    label: 'Enter the code',
    top: topBar({ title: 'Sign in', onBack: () => router.back('a2') }),
    body: [
      ...heading('Enter the code', `Sent to ${maskPhone(s.session.phone)}`),
      el('div', { class: 'stack-lg' }, otp, err.node, resendSlot, verifyBtn, trouble),
    ],
  });

  return {
    node,
    onMount() {
      const st = store.get().session;
      if (st.otpLockUntil > Date.now()) { lockFor(st.otpLockUntil); startResend(0); return; }
      if (route.id === 'a4' || st.otpAttempts < 3) {
        showWrong(st.otpAttempts);
        startResend(0);
      } else {
        startResend(24);
      }
      setTimeout(() => boxes[0].focus({ preventScroll: true }), 260);
    },
  };
}

/* ---------- A5 Child basics ---------- */
export function a5() {
  const s = store.get();
  const name = field({
    label: fill('Her name'), value: s.child.name || '', autocomplete: 'off', onInput: () => name.setError(''),
  });
  const ages = [1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: n === 1 ? '1 year' : `${n} years` }));
  const age = selectField({ label: 'Age', options: ages, value: s.child.ageYears || 3, helper: 'We use age for safety, not for what we suggest.' });

  const next = () => {
    const v = name.input.value.trim();
    if (!v) {
      name.setError(fill('Add her name to continue'));
      name.input.focus();
      return;
    }
    store.update((st) => { st.child.name = v; st.child.ageYears = Number(age.select.value); });
    router.navigate('a6');
  };
  name.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') next(); });

  const addChild = el('button', { type: 'button', class: 'btn btn--ghost onb__add' }, icon('add'), el('span', {}, 'Add another child'));
  pressable(addChild, comingSoon);

  const { node } = screenShell({
    label: 'About your child',
    top: onbTop('About your child', 'a1'),
    body: [
      progress(ONBOARDING_SEGMENTS, 1),
      ...heading('Who are we planning for?', 'Just the basics for now. The rest is learned as you go.'),
      el('div', { class: 'stack-lg' }, name.node, age.node, addChild),
    ],
    footer: [button('Next', { onClick: next })],
  });
  return { node };
}

/* ---------- A6 Child Lens interests ---------- */
export function a6() {
  const s = store.get();
  const count = el('p', { class: 't-small-strong onb__count', 'aria-live': 'polite' });
  const paint = (n) => { count.textContent = `${n} selected`; };
  const chips = chipGroup(data.interestOptions, {
    selected: s.onboarding.interests, label: fill('What lights her up?'),
    onChange: (v) => { paint(v.length); store.update((st) => { st.onboarding.interests = v; }); },
  });
  paint(s.onboarding.interests.length);

  const { node } = screenShell({
    label: 'Interests',
    top: onbTop('About your child', 'a5'),
    body: [
      progress(ONBOARDING_SEGMENTS, 2),
      ...heading(fill('What lights her up?'), 'Pick as many as fit. This is what we match ideas to.'),
      chips.node,
      el('p', { class: 't-small c-muted onb__helper' }, fill('Not sure yet? Skip this and we will learn from what she enjoys.')),
    ],
    footer: [count, button('Next', { onClick: () => router.navigate('a7') })],
  });
  return { node };
}

/* ---------- A7 Child Lens temperament ---------- */
export function a7() {
  const s = store.get();
  const err = inlineError();
  const settle = optionGroup(data.settleOptions.map((o) => ({ ...o, title: fill(o.title) })), {
    selected: s.onboarding.settle, label: fill('How long she stays with one thing'),
    onChange: (v) => { err.set(''); store.update((st) => { st.onboarding.settle = v; }); },
  });
  const mess = optionGroup(data.messOptions, {
    selected: s.onboarding.mess, label: 'How much mess you can take on a weeknight',
    onChange: (v) => { err.set(''); store.update((st) => { st.onboarding.mess = v; }); },
  });

  const next = () => {
    if (!settle.get() || !mess.get()) { err.set('Pick one in each'); return; }
    router.navigate('a8');
  };

  const { node } = screenShell({
    label: 'Temperament',
    top: onbTop('About your child', 'a6'),
    body: [
      progress(ONBOARDING_SEGMENTS, 3),
      ...heading(fill('How does she play?'), 'So we do not suggest a 40-minute craft to a child who moves on in five.'),
      el('h2', { class: 't-overline c-muted onb__overline' }, fill('How long she stays with one thing')),
      settle.node,
      el('h2', { class: 't-overline c-muted onb__overline' }, 'How much mess you can take on a weeknight'),
      mess.node,
    ],
    footer: [err.node, button('Next', { onClick: next })],
  });
  return { node };
}

/* ---------- A8 Parent profile ---------- */
// Names only in V1. Every adult row edits the name; nobody else gets a lens yet.
export function editAdultName(adult) {
  editTextSheet({
    title: adult.isUser ? 'Your name' : `Edit ${adult.name}`,
    label: 'Name',
    value: adult.name,
    emptyError: 'Add a name to continue',
    onSave: (v) => {
      store.update((st) => { const a = st.adults.find((x) => x.id === adult.id); if (a) a.name = v; });
      router.refresh();
    },
  });
}

function personRow(adult, actionLabel) {
  const initials = adult.name.slice(0, 1);
  return el('div', { class: 'person-row' },
    el('span', { class: 'avatar avatar--lg' + (adult.isUser ? '' : ' avatar--muted'), 'aria-hidden': 'true' }, initials),
    el('span', { class: 'person-row__text' },
      el('span', { class: 't-title' }, adult.name),
      el('span', { class: 't-small c-muted' }, fill(adult.roleLine)),
    ),
    button(actionLabel, { variant: 'ghost', cls: 't-small-strong', onClick: () => editAdultName(adult), ariaLabel: `${actionLabel} ${adult.name}` }),
  );
}

export function a8() {
  const s = store.get();
  const me = s.adults.find((a) => a.isUser);
  const others = s.adults.filter((a) => !a.isUser);
  const addSomeone = el('button', { type: 'button', class: 'dashed-btn' }, icon('add'), el('span', {}, 'Add someone else'));
  pressable(addSomeone, comingSoon);

  const { node } = screenShell({
    label: 'About you',
    top: onbTop('About you', 'a7'),
    body: [
      progress(ONBOARDING_SEGMENTS, 3),
      ...heading('And who are you?', fill('Ideas have to fit you as much as they fit {child}. One tired adult and two adults are not the same evening.')),
      personRow(me, 'Edit'),
      el('h2', { class: 't-h3 onb__section' }, fill('Who else plays with her?')),
      el('p', { class: 't-small c-muted onb__section-sub' }, 'Only add people who are actually there for it.'),
      el('div', { class: 'stack-md' }, ...others.map((a) => personRow(a, 'Edit')), addSomeone),
      el('p', { class: 'surface-card t-small c-secondary onb__note' }, 'We ask so we never suggest a two-adult idea on a night you are on your own.'),
    ],
    footer: [button('Next', { onClick: () => router.navigate('a9') })],
  });
  return { node };
}

/* ---------- A9 Parent Lens ---------- */
// The Parent Lens is the user's own adult record, not only onboarding answers.
function meUpdate(st, key, v) {
  const me = st.adults.find((x) => x.isUser);
  if (me) me[key] = Array.isArray(v) ? [...v] : v;
}

export function a9() {
  const s = store.get();
  const enjoys = chipGroup(data.enjoyOptions, {
    selected: s.onboarding.enjoys, label: 'What do you actually enjoy?',
    onChange: (v) => store.update((st) => { st.onboarding.enjoys = v; meUpdate(st, 'enjoys', v); }),
  });
  const avoids = chipGroup(data.avoidOptions, {
    selected: s.onboarding.avoids, label: 'What you would rather avoid',
    onChange: (v) => store.update((st) => { st.onboarding.avoids = v; meUpdate(st, 'avoids', v); }),
  });
  const energy = optionGroup(data.energyOptions, {
    selected: s.onboarding.energy, label: 'Your weekday evenings, honestly', grid: true,
    onChange: (v) => store.update((st) => { st.onboarding.energy = v; meUpdate(st, 'eveningEnergy', v); }),
  });

  const { node } = screenShell({
    label: 'Parent Lens',
    top: onbTop('About you', 'a8'),
    body: [
      progress(ONBOARDING_SEGMENTS, 4),
      ...heading('What do you actually enjoy?', 'Not what you think you should. Time together only works if one of you is not enduring it.'),
      enjoys.node,
      el('h2', { class: 't-h3 onb__section' }, 'What you would rather avoid'),
      avoids.node,
      el('h2', { class: 't-h3 onb__section' }, 'Your weekday evenings, honestly'),
      energy.node,
      el('p', { class: 't-small c-muted onb__helper' }, fill('{partner} can fill in {partnerPossessive} own later. Until then we use yours.')),
    ],
    footer: [button('Next', { onClick: () => router.navigate('a10') })],
  });
  return { node };
}

/* ---------- A10 Evenings and what is at home ---------- */
export function a10() {
  const s = store.get();
  const who = optionGroup(data.weeknightOptions.map((o) => ({ ...o, title: fill(o.title) })), {
    selected: s.onboarding.weeknight, label: 'Who usually plays on a weeknight?',
    onChange: (v) => store.update((st) => { st.onboarding.weeknight = v; }),
  });
  const items = chipGroup(data.homeItemOptions, {
    selected: s.onboarding.homeItems, label: 'What is usually at home?',
    onChange: (v) => store.update((st) => { st.onboarding.homeItems = v; }),
  });

  const finish = () => {
    store.update((st) => {
      const o = st.onboarding;
      st.child.interests = [...o.interests];
      st.child.messTolerance = o.mess || 'wipe';
      st.child.settleMinutes = data.settleOptions.find((x) => x.id === o.settle)?.minutes ?? null;
      const me = st.adults.find((a) => a.isUser);
      me.enjoys = [...o.enjoys];
      me.avoids = [...o.avoids];
      me.eveningEnergy = o.energy;
      st.checkIn = { ...data.checkInDefaults, who: o.weeknight === 'both' ? 'both' : 'me' };
    });
    router.navigate('a11');
  };

  const { node } = screenShell({
    label: 'About your evenings',
    top: onbTop('About your evenings', 'a9'),
    body: [
      progress(ONBOARDING_SEGMENTS, 5),
      ...heading('Who usually plays on a weeknight?'),
      who.node,
      el('h2', { class: 't-h3 onb__section' }, 'What is usually at home?'),
      el('p', { class: 't-small c-muted onb__section-sub' }, 'We only suggest things you can do without a trip to the shop.'),
      items.node,
    ],
    footer: [button('Finish', { onClick: finish })],
  });
  return { node };
}

/* ---------- A11 Nudge permission ---------- */
export function a11() {
  const pouring = data.findIdea('pouring-and-counting');
  const done = (on) => {
    store.update((st) => {
      st.settings.eveningNudge = on;
      st.session.onboarded = true;
    });
    // Ask the OS inside the tap, but never wait on the answer to move on.
    const asked = on ? store.askNotify() : null;
    router.navigate('home', { transition: 'fade', replace: true });
    router.resetStack();
    asked?.then((r) => {
      if (r === 'denied') {
        store.update((st) => { st.settings.eveningNudge = false; });
        toast('Notifications are off. You can turn them on in your browser settings.');
      } else simulated();
    });
  };

  const preview = el('div', { class: 'nudge-preview' },
    el('div', { class: 'nudge-preview__card' },
      el('div', { class: 'nudge-preview__app' },
        el('img', { class: 'nudge-preview__icon', src: 'logo-mark.png', width: 20, height: 20, alt: '', decoding: 'async' }),
        el('span', { class: 't-overline c-muted' }, 'Dabble'),
        el('span', { class: 't-caption c-muted nudge-preview__time' }, '5:30 PM'),
      ),
      el('p', { class: 't-title' }, 'Tonight: pouring play at bath time'),
      el('p', { class: 't-small c-secondary' }, '10 minutes, sitting down, uses a bucket'),
      refSlot(pouring, { cls: 'nudge-preview__img', width: 480, height: 240 }),
    ),
    mascot('pointing', 'waving', 96, { cls: 'nudge-preview__mascot' }),
  );

  const { node } = screenShell({
    label: 'One last thing',
    top: onbTop('One last thing', 'a10'),
    body: [
      preview,
      ...heading('One nudge, before the hard part', 'We send one at around 5:30 PM with a single idea for that evening. No streaks, no second reminder, and nothing if you skip it.'),
    ],
    footer: [
      button('Turn on the evening nudge', { onClick: () => done(true) }),
      button('Not now', { variant: 'secondary', onClick: () => done(false) }),
    ],
  });
  return { node };
}

