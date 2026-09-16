// src/index.js

const CSS = `
@property --toaster-progress {
  syntax: '<number>';
  inherits: false;
  initial-value: 100;
}

.toaster-container {
  position: fixed;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  margin: 0;
  padding: 0;
}

.toaster-container.top-left { top: 20px; left: 20px; align-items: flex-start; }
.toaster-container.top-center { top: 20px; left: 50%; transform: translateX(-50%); align-items: center; }
.toaster-container.top-right { top: 20px; right: 20px; align-items: flex-end; }
.toaster-container.bottom-left { bottom: 20px; left: 20px; align-items: flex-start; }
.toaster-container.bottom-center { bottom: 20px; left: 50%; transform: translateX(-50%); align-items: center; }
.toaster-container.bottom-right { bottom: 20px; right: 20px; align-items: flex-end; }

/* Wrapper pro Toast: hält Stack-Peek-Layer (Dedupe-Badge-Stil "stack") als
   Geschwister des Toasts, damit sie nicht vom overflow:hidden des Toasts
   abgeschnitten werden, und trägt die Farb-Custom-Properties, damit sie sich
   sowohl auf den Toast als auch auf diese Geschwister-Layer vererben. */
.toaster-item {
  position: relative;
}

.toaster-message {
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  background: var(--toaster-bg, #333);
  color: var(--toaster-text, #fff);
  border: var(--toaster-border-width, 0px) solid var(--toaster-border, transparent);
  box-sizing: border-box;
  padding: 12px 20px;
  border-radius: 6px;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 360px;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toaster-message.is-visible { opacity: 1; }

.toaster-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toaster-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.toaster-title {
  font-weight: 700;
  font-size: var(--toaster-title-size, 15px);
  color: var(--toaster-title-color, inherit);
}

.toaster-text {
  font-size: var(--toaster-message-size, inherit);
  color: var(--toaster-message-color, inherit);
}

/* Eintritts-/Austritts-Animationen (steuerbar über options.animation) */
.toaster-anim-fade { transform: none; }

.toaster-anim-slide { transform: translateY(-10px); }
.toaster-container.bottom-left .toaster-anim-slide,
.toaster-container.bottom-center .toaster-anim-slide,
.toaster-container.bottom-right .toaster-anim-slide { transform: translateY(10px); }
/* Selektor-Spezifität muss die der Positions-Regeln oben erreichen, sonst
   gewinnt dort bei bottom-* Positionen die Ausgangs- statt der Zielwert. */
.toaster-container .toaster-anim-slide.is-visible { transform: translateY(0); }

.toaster-anim-zoom { transform: scale(0.85); }
.toaster-anim-zoom.is-visible { transform: scale(1); }

.toaster-anim-bounce {
  transform: translateY(-16px) scale(0.92);
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toaster-container.bottom-left .toaster-anim-bounce,
.toaster-container.bottom-center .toaster-anim-bounce,
.toaster-container.bottom-right .toaster-anim-bounce { transform: translateY(16px) scale(0.92); }
.toaster-container .toaster-anim-bounce.is-visible { transform: translateY(0) scale(1); }

/* Typ-Presets: setzen nur Standardwerte für die CSS-Variablen, die
   per options.colors jederzeit überschrieben werden können. */
.toaster-message--success { --toaster-bg: #2e7d46; }
.toaster-message--error { --toaster-bg: #c0392b; }
.toaster-message--warning { --toaster-bg: #d97706; }
.toaster-message--info { --toaster-bg: #2563eb; }

/* Timer-Visualisierungen */
.toaster-timer-bar {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--toaster-timer-color, rgba(255, 255, 255, 0.85));
  transform: scaleX(1);
  transform-origin: left;
}
.toaster-timer-bar--top { top: 0; }
.toaster-timer-bar--bottom { bottom: 0; }

.toaster-timer-border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.toaster-timer-border rect {
  fill: none;
  stroke: var(--toaster-timer-color, rgba(255, 255, 255, 0.85));
}

.toaster-timer-clock {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: conic-gradient(
    var(--toaster-timer-color, #fff) calc(var(--toaster-progress, 100) * 1%),
    rgba(255, 255, 255, 0.25) 0
  );
}

/* Dedupe-Badges (options.dedupe): zeigen einen Zähler statt einen zweiten
   identischen Toast zu erzeugen. */
.toaster-badge {
  flex-shrink: 0;
  font-weight: 700;
  line-height: 1;
}
.toaster-badge--corner {
  position: absolute;
  top: 6px;
  left: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toaster-badge--pill {
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 12px;
}

/* Peek-Layer hinter dem Toast für Dedupe-Badge-Stil "stack". Liegen als
   Geschwister VOR dem Toast im DOM, malen dadurch automatisch dahinter.
   opacity 0 als Ausgangszustand, damit sie mit der gleichen Transition wie
   der Toast selbst ein-/ausgeblendet werden (siehe is-visible-Handling). */
.toaster-stack-layer {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 100%;
  border-radius: 6px;
  background: var(--toaster-bg, #333);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.toaster-stack-layer--1 { top: -6px; left: 8px; right: 8px; }
.toaster-stack-layer--1.is-visible { opacity: 0.55; }
.toaster-stack-layer--2 { top: -11px; left: 14px; right: 14px; }
.toaster-stack-layer--2.is-visible { opacity: 0.3; }
`;

const VALID_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const VALID_TYPES = ['default', 'success', 'error', 'warning', 'info'];
const VALID_ANIMATIONS = ['fade', 'slide', 'zoom', 'bounce'];
const VALID_TIMERS = ['none', 'bar-bottom', 'bar-top', 'border', 'clock'];
const VALID_DEDUPE_BADGES = ['corner', 'suffix', 'pill', 'stack'];
const VALID_DEDUPE_TIMERS = ['reset', 'continue', 'extend'];

const DEFAULTS = {
  duration: 3000,
  position: 'bottom-right',
  type: 'default',
  animation: 'slide',
  timer: 'bar-bottom',
  colors: {},
  /** 0 = unbegrenzt. Bei Überschreitung wird der älteste sichtbare Toast sofort entfernt. */
  maxToasts: 0,
  /** Pro Typ hinterlegte Standardwerte (animation/timer/colors/dedupe/...), z.B. für 'error' immer 'bounce'. */
  typePresets: {},
  /** Zeigt bei identischer Nachricht (gleiche position+type+text) einen Zähler statt eines zweiten Toasts. */
  dedupe: false,
  /** Stil des Zählers: 'corner' (Badge Ecke), 'suffix' (an Text angehängt), 'pill' (Chip im Text), 'stack' (Karten-Stapel-Optik). */
  dedupeBadge: 'corner',
  /** Verhalten der Restzeit-Anzeige bei einer Wiederholung: 'reset' (neu starten), 'continue' (unverändert), 'extend' (Restzeit + neue Dauer). */
  dedupeTimer: 'reset',
};

const containers = {};
const activeToasts = [];
const activeByKey = new Map();
let stylesInjected = false;

/**
 * Setzt globale Standardwerte für alle künftigen showToast()-Aufrufe.
 * Einzelne Aufrufe können jedes Feld weiterhin per options überschreiben.
 * @param {Partial<typeof DEFAULTS>} options
 */
function configureToaster(options = {}) {
  const { colors, typePresets, ...rest } = options;

  Object.assign(DEFAULTS, rest);

  if (colors) {
    DEFAULTS.colors = { ...DEFAULTS.colors, ...colors };
  }

  if (typePresets) {
    DEFAULTS.typePresets = { ...DEFAULTS.typePresets };
    for (const [type, preset] of Object.entries(typePresets)) {
      DEFAULTS.typePresets[type] = {
        ...DEFAULTS.typePresets[type],
        ...preset,
        colors: { ...(DEFAULTS.typePresets[type] || {}).colors, ...(preset.colors || {}) },
      };
    }
  }
}

function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  if (document.querySelector('style[data-toaster-styles]')) {
    stylesInjected = true;
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-toaster-styles', '');
  styleElement.textContent = CSS;
  document.head.appendChild(styleElement);

  stylesInjected = true;
}

function getContainer(position) {
  if (containers[position]) return containers[position];

  const container = document.createElement('div');
  container.className = `toaster-container ${position}`;
  container.dataset.position = position;
  document.body.appendChild(container);
  containers[position] = container;
  return container;
}

// Setzt Farb-Custom-Properties auf den Item-Wrapper (nicht den Toast selbst),
// damit sie sowohl in den Toast hinein vererben (Hintergrund/Text/Timer) als
// auch in die Stack-Peek-Layer, die als Geschwister des Toasts im selben
// Wrapper liegen.
function applyColors(item, colors) {
  const { background, text, border, timerColor } = colors;
  if (background) item.style.setProperty('--toaster-bg', background);
  if (text) item.style.setProperty('--toaster-text', text);
  if (border) {
    item.style.setProperty('--toaster-border', border);
    item.style.setProperty('--toaster-border-width', '1px');
  }
  if (timerColor) item.style.setProperty('--toaster-timer-color', timerColor);
}

function toCssSize(value) {
  return typeof value === 'number' ? `${value}px` : value;
}

// Setzt individuelle Titel-/Nachrichten-Formatierung (Farbe & Größe je
// eigenständig), unabhängig von der allgemeinen colors.text-Farbe.
function applyTextStyles(item, { titleColor, titleSize, messageColor, messageSize }) {
  if (titleColor) item.style.setProperty('--toaster-title-color', titleColor);
  if (titleSize != null) item.style.setProperty('--toaster-title-size', toCssSize(titleSize));
  if (messageColor) item.style.setProperty('--toaster-message-color', messageColor);
  if (messageSize != null) item.style.setProperty('--toaster-message-size', toCssSize(messageSize));
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const BORDER_STROKE_WIDTH = 2;
const TOAST_BORDER_RADIUS = 6;

function createBorderTimerElement() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'toaster-timer-border');
  svg.setAttribute('preserveAspectRatio', 'none');

  const rect = document.createElementNS(SVG_NS, 'rect');
  svg.appendChild(rect);
  return svg;
}

function createTimerElement(timer) {
  if (timer === 'bar-bottom' || timer === 'bar-top') {
    const bar = document.createElement('div');
    bar.className = `toaster-timer-bar toaster-timer-bar--${timer === 'bar-top' ? 'top' : 'bottom'}`;
    return bar;
  }
  if (timer === 'border') {
    return createBorderTimerElement();
  }
  if (timer === 'clock') {
    const clock = document.createElement('div');
    clock.className = 'toaster-timer-clock';
    return clock;
  }
  return null;
}

// Misst die tatsächlich gerenderte Box des SVG-Overlays selbst aus (nicht die
// des Toasts!). Der Toast ist bei einer gesetzten statischen Umrandung
// (colors.border) einen Pixel größer als seine Padding-Box, gegen die das
// absolut positionierte SVG via CSS (inset:0) gestreckt wird. Wurde stattdessen
// toast.offsetWidth/Height verwendet, war das SVG minimal zu groß, hing über
// den Toast-Rand hinaus und wurde vom overflow:hidden rechts/unten abgeschnitten
// – dadurch wirkte die Linie verschoben und nur oben/links sichtbar.
function measureBorderTimer(svg) {
  const box = svg.getBoundingClientRect();
  const width = box.width;
  const height = box.height;
  const inset = BORDER_STROKE_WIDTH / 2;
  const radius = Math.max(TOAST_BORDER_RADIUS - inset, 0);

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const rect = svg.querySelector('rect');
  rect.setAttribute('x', inset);
  rect.setAttribute('y', inset);
  rect.setAttribute('width', Math.max(width - inset * 2, 0));
  rect.setAttribute('height', Math.max(height - inset * 2, 0));
  rect.setAttribute('rx', radius);
  rect.setAttribute('ry', radius);
  rect.setAttribute('stroke-width', BORDER_STROKE_WIDTH);

  return rect;
}

function startTimerAnimation(timerEl, timer, duration) {
  if (!timerEl) return;

  if (timer === 'bar-bottom' || timer === 'bar-top') {
    timerEl.style.transition = `transform ${duration}ms linear`;
    requestAnimationFrame(() => {
      timerEl.style.transform = 'scaleX(0)';
    });
    return;
  }

  if (timer === 'border') {
    const rect = timerEl.querySelector('rect');
    let length = rect.style.strokeDasharray;
    if (!length) {
      length = String(measureBorderTimer(timerEl).getTotalLength());
      rect.style.strokeDasharray = length;
    }
    rect.style.transition = `stroke-dashoffset ${duration}ms linear`;
    requestAnimationFrame(() => {
      rect.style.strokeDashoffset = length;
    });
    return;
  }

  if (timer === 'clock') {
    timerEl.style.transition = `--toaster-progress ${duration}ms linear`;
    requestAnimationFrame(() => {
      timerEl.style.setProperty('--toaster-progress', '0');
    });
  }
}

// Springt den Timer optisch zurück auf den Startzustand (ohne Transition) und
// erzwingt einen Reflow, damit ein anschließender startTimerAnimation()-Aufruf
// wieder bei 100% beginnt (für den Dedupe-Timer-Modus 'reset'/'extend').
function resetTimerVisual(timerEl, timer) {
  if (!timerEl) return;
  if (timer === 'bar-bottom' || timer === 'bar-top') {
    timerEl.style.transition = 'none';
    timerEl.style.transform = 'scaleX(1)';
  } else if (timer === 'border') {
    const rect = timerEl.querySelector('rect');
    rect.style.transition = 'none';
    rect.style.strokeDashoffset = '0';
  } else if (timer === 'clock') {
    timerEl.style.transition = 'none';
    timerEl.style.setProperty('--toaster-progress', '100');
  }
  void timerEl.getBoundingClientRect();
}

function restartTimerVisual(timerEl, timer, duration) {
  if (!timerEl) return;
  resetTimerVisual(timerEl, timer);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      startTimerAnimation(timerEl, timer, duration);
    });
  });
}

function removeToast(item, toast, container) {
  if (toast.dataset.removed) return;
  toast.dataset.removed = 'true';

  const index = activeToasts.indexOf(toast);
  if (index !== -1) activeToasts.splice(index, 1);

  if (toast.dataset.dedupeKey) {
    activeByKey.delete(toast.dataset.dedupeKey);
  }

  toast.classList.remove('is-visible');
  // Stack-Peek-Layer (Dedupe-Badge-Stil "stack") blenden mit derselben
  // Transition/Dauer aus wie der Toast selbst, statt beim item.remove() am
  // Ende abrupt zu verschwinden.
  item.querySelectorAll('.toaster-stack-layer').forEach((layer) => {
    layer.classList.remove('is-visible');
  });

  // { once: true } würde den Listener bereits beim ersten transitionend
  // entfernen - auch wenn das Event (durch Bubbling) von einem Kind-Element
  // wie dem Timer-Balken/-SVG stammt, dessen eigene Transition zufällig zur
  // gleichen Zeit endet. Der echte Fade-Out-Abschluss des Toasts würde dann
  // nie mehr ankommen und der Toast bliebe unsichtbar im DOM hängen. Deshalb
  // manuell entfernen, erst wenn wirklich event.target === toast zutrifft.
  const onTransitionEnd = (event) => {
    if (event.target !== toast) return;
    toast.removeEventListener('transitionend', onTransitionEnd);
    item.remove();
    if (container.childElementCount === 0) {
      container.remove();
      delete containers[container.dataset.position];
    }
  };
  toast.addEventListener('transitionend', onTransitionEnd);
}

// Fügt einen Stack-Peek-Layer ein und blendet ihn mit der gleichen
// Zwei-rAF-Technik wie den Toast selbst ein (sonst überspringt der Browser
// die Transition und der Layer erscheint ohne Fade).
function addStackLayer(entry, modifier, beforeEl) {
  const layer = document.createElement('div');
  layer.className = `toaster-stack-layer toaster-stack-layer--${modifier}`;
  entry.item.insertBefore(layer, beforeEl);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      layer.classList.add('is-visible');
    });
  });
  return layer;
}

// Aktualisiert den Zähler eines bereits sichtbaren, dedupliziert markierten
// Toasts (erzeugt Badge-/Stack-Elemente bei Bedarf lazy). Stack-Tiefe ist
// gedeckelt: 1 Peek-Layer bei genau 2 Nachrichten, maximal 2 Peek-Layer
// (= Stapel-Tiefe 3) ab 3 oder mehr Nachrichten, wächst darüber hinaus nicht weiter.
function updateBadge(entry) {
  const label = `×${entry.count}`;

  if (entry.badgeStyle === 'suffix') {
    entry.textEl.textContent = `${entry.baseText}  ${label}`;
    return;
  }

  if (entry.badgeStyle === 'stack') {
    if (entry.count >= 2 && !entry.stackLayer1) {
      entry.stackLayer1 = addStackLayer(entry, 1, entry.toast);
    }
    if (entry.count >= 3 && !entry.stackLayer2) {
      entry.stackLayer2 = addStackLayer(entry, 2, entry.stackLayer1);
    }
  }

  if (!entry.badgeEl) {
    entry.badgeEl = document.createElement('span');
    entry.badgeEl.className = `toaster-badge toaster-badge--${entry.badgeStyle === 'pill' ? 'pill' : 'corner'}`;
    if (entry.badgeStyle === 'pill') {
      entry.contentEl.appendChild(entry.badgeEl);
    } else {
      entry.toast.appendChild(entry.badgeEl);
    }
  }
  entry.badgeEl.textContent = label;
}

// Ein Duplikat ist eingetroffen: Zähler hoch, Badge aktualisieren, und je nach
// dedupeTimer-Modus die Restzeit neu starten/verlängern/unverändert lassen.
function handleDuplicate(entry, incomingDuration, mode) {
  entry.count += 1;
  updateBadge(entry);

  if (mode === 'continue') return;

  clearTimeout(entry.timeoutId);

  let effectiveDuration = incomingDuration;
  if (mode === 'extend') {
    const elapsed = Date.now() - entry.visualStartedAt;
    const remaining = Math.max(entry.visualDuration - elapsed, 0);
    effectiveDuration = remaining + incomingDuration;
  }

  entry.visualStartedAt = Date.now();
  entry.visualDuration = effectiveDuration;
  entry.timeoutId = setTimeout(() => removeToast(entry.item, entry.toast, entry.container), effectiveDuration);
  restartTimerVisual(entry.timerEl, entry.timer, effectiveDuration);
}

function resolveEnum(validValues, ...candidates) {
  for (const candidate of candidates) {
    if (validValues.includes(candidate)) return candidate;
  }
  return candidates[candidates.length - 1];
}

function resolveBool(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'boolean') return candidate;
  }
  return candidates[candidates.length - 1];
}

const VALID_SHOW = ['message', 'title', 'both'];

/**
 * Zeigt eine Toast-Nachricht an.
 * @param {string} [text] - Der Nachrichtentext. Optional, wenn nur ein Titel gezeigt werden soll (options.show = 'title').
 * @param {Object} [options] - Optionen für den Toast.
 * @param {number} [options.duration] - Anzeigedauer in ms.
 * @param {'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right'} [options.position] - Position des Toasts.
 * @param {string} [options.type] - Beliebiger Typ-Schlüssel. Die eingebauten 'default'|'success'|'error'|'warning'|'info' bringen Standardfarben mit; jeder andere Name ist ein frei definierbarer Typ (per typePresets konfigurierbar).
 * @param {'fade'|'slide'|'zoom'|'bounce'} [options.animation] - Ein-/Ausblend-Animation.
 * @param {'none'|'bar-bottom'|'bar-top'|'border'|'clock'} [options.timer] - Visuelle Restzeit-Anzeige.
 * @param {Object} [options.colors] - Farbüberschreibungen.
 * @param {string} [options.colors.background] - Hintergrundfarbe.
 * @param {string} [options.colors.text] - Textfarbe.
 * @param {string} [options.colors.border] - Statische Umrandungsfarbe (Standard: transparent/unsichtbar).
 * @param {string} [options.colors.timerColor] - Farbe der Timer-Anzeige (Balken/Linie/Uhr).
 * @param {number} [options.maxToasts] - Maximal gleichzeitig sichtbare Toasts (0 = unbegrenzt). Ältester wird bei Überschreitung sofort entfernt.
 * @param {boolean} [options.dedupe] - Bei identischer Nachricht (gleiche position+type+title+text) einen Zähler anzeigen statt eines zweiten Toasts.
 * @param {'corner'|'suffix'|'pill'|'stack'} [options.dedupeBadge] - Stil des Zählers.
 * @param {'reset'|'continue'|'extend'} [options.dedupeTimer] - Timer-Verhalten bei Wiederholung.
 * @param {string} [options.title] - Optionaler Titel, fett über der Nachricht.
 * @param {'message'|'title'|'both'} [options.show] - Was angezeigt wird. Default: 'both' falls ein title gesetzt ist, sonst 'message'.
 * @param {string} [options.titleColor] - Farbe des Titels (unabhängig von colors.text).
 * @param {string|number} [options.titleSize] - Schriftgröße des Titels (z.B. 16 oder '1.1rem').
 * @param {string} [options.messageColor] - Farbe der Nachricht (unabhängig von colors.text).
 * @param {string|number} [options.messageSize] - Schriftgröße der Nachricht.
 */
function showToast(text, options = {}) {
  if (typeof document === 'undefined') return;

  const opts = typeof options === 'number' ? { duration: options } : options;

  const type = typeof opts.type === 'string' && opts.type.length > 0 ? opts.type : DEFAULTS.type;
  const typePreset = DEFAULTS.typePresets[type] || {};

  const duration = opts.duration ?? typePreset.duration ?? DEFAULTS.duration;
  const position = VALID_POSITIONS.includes(opts.position)
    ? opts.position
    : (VALID_POSITIONS.includes(typePreset.position) ? typePreset.position : DEFAULTS.position);
  const animation = VALID_ANIMATIONS.includes(opts.animation)
    ? opts.animation
    : (VALID_ANIMATIONS.includes(typePreset.animation) ? typePreset.animation : DEFAULTS.animation);
  const timer = VALID_TIMERS.includes(opts.timer)
    ? opts.timer
    : (VALID_TIMERS.includes(typePreset.timer) ? typePreset.timer : DEFAULTS.timer);
  const colors = { ...DEFAULTS.colors, ...(typePreset.colors || {}), ...(opts.colors || {}) };
  const maxToasts = opts.maxToasts ?? DEFAULTS.maxToasts;
  const dedupe = resolveBool(opts.dedupe, typePreset.dedupe, DEFAULTS.dedupe);
  const dedupeBadge = resolveEnum(VALID_DEDUPE_BADGES, opts.dedupeBadge, typePreset.dedupeBadge, DEFAULTS.dedupeBadge);
  const dedupeTimer = resolveEnum(VALID_DEDUPE_TIMERS, opts.dedupeTimer, typePreset.dedupeTimer, DEFAULTS.dedupeTimer);
  const title = opts.title ?? typePreset.title ?? null;
  const show = resolveEnum(VALID_SHOW, opts.show, typePreset.show, title ? 'both' : 'message');
  const titleColor = opts.titleColor ?? typePreset.titleColor;
  const titleSize = opts.titleSize ?? typePreset.titleSize;
  const messageColor = opts.messageColor ?? typePreset.messageColor;
  const messageSize = opts.messageSize ?? typePreset.messageSize;

  injectStyles();

  const dedupeKey = dedupe ? `${position}::${type}::${title || ''}::${text || ''}` : null;
  if (dedupeKey) {
    const existing = activeByKey.get(dedupeKey);
    if (existing) {
      handleDuplicate(existing, duration, dedupeTimer);
      return;
    }
  }

  const container = getContainer(position);

  const item = document.createElement('div');
  item.className = 'toaster-item';
  // Die eingebauten CSS-Klassen liefern nur für die 5 bekannten Typnamen
  // Standardfarben; jeder andere (frei benannte) Typ stützt sich vollständig
  // auf colors/typePresets - beides funktioniert unabhängig voneinander.
  if (VALID_TYPES.includes(type)) item.classList.add(`toaster-message--${type}`);
  applyColors(item, colors);
  applyTextStyles(item, { titleColor, titleSize, messageColor, messageSize });

  const toast = document.createElement('div');
  toast.className = `toaster-message toaster-anim-${animation}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const contentEl = document.createElement('div');
  contentEl.className = 'toaster-content';
  const textGroup = document.createElement('div');
  textGroup.className = 'toaster-text-group';

  let titleEl = null;
  let textEl = null;

  if (show === 'title' || show === 'both') {
    titleEl = document.createElement('div');
    titleEl.className = 'toaster-title';
    titleEl.textContent = title || '';
    textGroup.appendChild(titleEl);
  }

  if (show === 'message' || show === 'both') {
    textEl = document.createElement('span');
    textEl.className = 'toaster-text';
    textEl.textContent = text || '';
    textGroup.appendChild(textEl);
  }

  contentEl.appendChild(textGroup);
  toast.appendChild(contentEl);

  const timerEl = createTimerElement(timer);
  if (timerEl) toast.appendChild(timerEl);

  item.appendChild(toast);

  // Bei top-* Positionen ist die Stapel-Richtung gespiegelt: neue Toasts
  // sollen näher an der Ecke (oben) erscheinen statt darunter angehängt zu
  // werden, wie es bei bottom-* Positionen durch simples Anhängen passiert.
  if (position.startsWith('top-')) {
    container.prepend(item);
  } else {
    container.appendChild(item);
  }

  activeToasts.push(toast);

  if (maxToasts > 0) {
    while (activeToasts.length > maxToasts) {
      const oldest = activeToasts[0];
      removeToast(oldest.parentElement, oldest, oldest.closest('.toaster-container'));
    }
  }

  // Ein einzelnes requestAnimationFrame reicht oft nicht: der Browser hat den
  // Ausgangszustand (opacity/transform) dann noch nicht gemalt und fasst beide
  // Klassenänderungen in einem Frame zusammen, wodurch die Transition entfällt
  // und der Toast direkt im Endzustand erscheint. Zwei verschachtelte rAFs
  // garantieren, dass mindestens ein Frame mit dem Ausgangszustand gemalt wurde.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
      startTimerAnimation(timerEl, timer, duration);
    });
  });

  const timeoutId = setTimeout(() => removeToast(item, toast, container), duration);

  if (dedupeKey) {
    // 'suffix' hängt den Zähler an das primär sichtbare Textelement an -
    // die Nachricht, oder falls nur ein Titel gezeigt wird, an den Titel.
    const suffixTarget = textEl || titleEl;
    toast.dataset.dedupeKey = dedupeKey;
    activeByKey.set(dedupeKey, {
      item, toast, contentEl, textEl: suffixTarget, badgeEl: null, badgeStyle: dedupeBadge,
      timerEl, timer,
      visualStartedAt: Date.now(), visualDuration: duration,
      timeoutId, count: 1, baseText: suffixTarget ? suffixTarget.textContent : '',
      container, stackLayer1: null, stackLayer2: null,
    });
  }
}

module.exports = { showToast, configureToaster };
