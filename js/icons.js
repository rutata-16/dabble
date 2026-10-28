// Material Symbols Rounded helper. Screens call this; they never write the span by hand.

// The font is loaded with display=block, so a slow load shows nothing rather
// than the ligature text. A total failure (Google Fonts blocked) is different:
// the browser falls back to a system font and every icon renders as its own
// name, so the nav reads "home explore bookmark". Detect that and hide the
// glyph text, keeping the box so nothing shifts.
export function watchSymbolsFont() {
  // Measure rather than ask. document.fonts.check() reports true for a family
  // that was never registered, so a blocked stylesheet would read as "loaded".
  //
  // Render "home" twice: once in the symbol font with monospace as its
  // fallback, once in monospace alone. If the symbol font is present the
  // ligature collapses the word to a single glyph and the two widths differ.
  // If it is absent both fall through to monospace and the widths match
  // exactly. No pixel threshold to guess at.
  const widthIn = (family) => {
    const s = document.createElement('span');
    s.textContent = 'home';
    s.setAttribute('aria-hidden', 'true');
    // Deliberately not class="icon": that rule is width:1em, which would make
    // every measurement identical regardless of which font actually rendered.
    s.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:24px ${family};`;
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return w;
  };
  const probe = () => {
    if (!document.body) return;
    const withFont = widthIn('"Material Symbols Rounded", monospace');
    const fallback = widthIn('monospace');
    document.documentElement.classList.toggle('symbols-missing', Math.abs(withFont - fallback) < 0.5);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(probe, probe);
  else probe();
  // display=block holds the glyph invisible for about 3s before the browser
  // swaps in a fallback, so re-check once that window has passed.
  setTimeout(probe, 3600);
}

export function icon(name, { filled = false, size, label } = {}) {
  const span = document.createElement('span');
  span.className = 'icon' + (filled ? ' is-filled' : '');
  span.textContent = name;
  if (size) span.style.fontSize = `${size}px`;
  if (label) {
    span.setAttribute('role', 'img');
    span.setAttribute('aria-label', label);
  } else {
    span.setAttribute('aria-hidden', 'true');
  }
  return span;
}

export function iconHTML(name, { filled = false, label } = {}) {
  const cls = 'icon' + (filled ? ' is-filled' : '');
  return label
    ? `<span class="${cls}" role="img" aria-label="${label}">${name}</span>`
    : `<span class="${cls}" aria-hidden="true">${name}</span>`;
}
