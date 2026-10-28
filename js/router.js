// Hash router with a screen stack and enter/exit transitions.
// Routes look like #/b8/torch-shadow-stories?from=b6

import { bottomNav, closeAllSheets } from './components.js';

let routes = {};
let navHandler = () => {};
let fallbackRoute = 'a1';
const stack = [];
let pending = null;
let currentKey = null;
let currentScreen = null;

export function parse(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs));
  return { id: (parts[0] || '').toLowerCase(), params: parts.slice(1), query, key: raw };
}

export function init(table, { onNav, fallback }) {
  routes = table;
  navHandler = onNav;
  fallbackRoute = fallback;
  window.addEventListener('hashchange', () => render());
}

export function start(initial) {
  if (!location.hash || !routes[parse().id]) {
    history.replaceState(null, '', `#/${initial}`);
  }
  stack.length = 0;
  stack.push(parse().key);
  render({ transition: 'none' });
}

export function navigate(path, { transition = 'forward', replace = false } = {}) {
  const target = `#/${path}`;
  if (target === location.hash) { render({ transition: 'none' }); return; }
  pending = { transition, replace };
  if (replace) location.replace(target);
  else location.hash = target;
}

export function back(fallback) {
  if (stack.length > 1) {
    pending = { transition: 'back', isBack: true };
    history.back();
  } else {
    navigate(fallback || fallbackRoute, { transition: 'back', replace: true });
  }
}

// Clear the stack so Back never walks into a finished flow (onboarding, lock screen).
export function resetStack() {
  stack.length = 0;
  stack.push(parse().key);
}

export function refresh() { render({ transition: 'none' }); }

export function current() { return parse(); }

function render(opts = {}) {
  const route = parse();
  const factory = routes[route.id];
  if (!factory) { navigate(fallbackRoute, { replace: true, transition: 'fade' }); return; }

  let transition = opts.transition;
  const p = pending;
  pending = null;
  if (!transition) {
    if (p?.isBack || stack[stack.length - 2] === route.key) {
      transition = 'back';
      stack.pop();
      if (stack[stack.length - 1] !== route.key) stack.push(route.key);
    } else if (p?.replace) {
      transition = p.transition;
      stack[stack.length - 1] = route.key;
    } else {
      transition = p?.transition || 'forward';
      stack.push(route.key);
    }
  }

  const result = factory(route);
  if (!result) return; // factory redirected
  const { node, nav = null, chrome = null } = result;
  closeAllSheets();
  // The wordmark lives on the splash only. In-app screens start with their own
  // top bar, so the brand never takes a second row of vertical space.

  const viewport = document.getElementById('viewport');
  const phone = document.getElementById('phone');
  const old = currentScreen;
  currentScreen = node;
  currentKey = route.key;

  if (nav) node.classList.add('has-nav');
  phone.classList.toggle('has-nav', !!nav);
  if (chrome) phone.setAttribute('data-chrome', chrome); else phone.removeAttribute('data-chrome');

  viewport.append(node);
  const navSlot = document.getElementById('nav-slot');
  navSlot.replaceChildren(nav ? bottomNav(nav, navHandler) : '');

  if (old && transition !== 'none') {
    const kind = transition === 'back' ? 'back' : transition === 'fade' ? 'fade' : 'forward';
    old.classList.add(`route-exit-${kind}`);
    node.classList.add(`route-enter-${kind}`);
    const done = () => {
      old.remove();
      node.classList.remove(`route-enter-${kind}`);
    };
    node.addEventListener('animationend', done, { once: true });
    setTimeout(() => { if (old.isConnected) done(); }, 400);
  } else if (old) {
    old.remove();
  }

  // Move focus to the screen heading for screen readers, without scrolling.
  requestAnimationFrame(() => {
    const h = node.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  });
  result.onMount?.();
}

export function currentKeyValue() { return currentKey; }
