// Entry: route table, initial route, theme, status bar, splash, demo panel.

import * as store from './store.js';
import * as router from './router.js';
import * as theme from './theme.js';
import * as demo from './demo.js';
import { routes } from './screens.js';
import { icon, watchSymbolsFont } from './icons.js';
import { comingSoon } from './components.js';

function onNav(id) {
  const map = { home: 'home', explore: 'e1', saved: 'd5', moments: 'b12', profile: 'e7' };
  if (!map[id]) { comingSoon(); return; }
  if (router.current().id === map[id]) return;
  router.navigate(map[id], { transition: 'fade' });
}

function tickClock() {
  const d = new Date();
  const h = ((d.getHours() + 11) % 12) + 1;
  document.getElementById('status-time').textContent = `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function statusBar() {
  document.getElementById('status-icons').replaceChildren(
    icon('signal_cellular_alt', { filled: true }),
    icon('wifi', { filled: true }),
    icon('battery_full', { filled: true }),
  );
  tickClock();
  setInterval(tickClock, 15 * 1000);
}

function splash() {
  const node = document.getElementById('splash');
  const done = () => node.classList.add('is-done');
  // Long enough for the wordmark to register, short enough that a reviewer
  // clicking through repeatedly can skip it with a tap.
  const t = setTimeout(done, 2000);
  node.addEventListener('pointerdown', () => { clearTimeout(t); done(); }, { once: true });
}

watchSymbolsFont();
theme.start(() => router.refresh());
statusBar();
router.init(routes, { onNav, fallback: 'home' });
demo.init();

window.addEventListener('online', () => { if (router.current().id === 'b6') router.refresh(); });
window.addEventListener('offline', () => { if (router.current().id === 'b6') router.refresh(); });

const s = store.get();
router.start(s.session.onboarded ? 'home' : 'a1');
splash();
