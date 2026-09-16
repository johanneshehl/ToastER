// index.d.ts
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Eingebaute Typnamen mit vorgefertigten Farben. Jeder andere String ist ein frei definierbarer, eigener Typ (siehe typePresets). */
export type ToastBuiltinType = 'default' | 'success' | 'error' | 'warning' | 'info';

/** type akzeptiert die eingebauten Namen (mit Autovervollständigung) oder einen beliebigen eigenen Typ-Schlüssel. */
export type ToastType = ToastBuiltinType | (string & {});

export type ToastAnimation = 'fade' | 'slide' | 'zoom' | 'bounce';

export type ToastTimerStyle = 'none' | 'bar-bottom' | 'bar-top' | 'border' | 'clock';

/** Was von Titel/Nachricht angezeigt wird. */
export type ToastShow = 'message' | 'title' | 'both';

/** Stil des Zählers, wenn options.dedupe eine identische Nachricht zusammenfasst. */
export type ToastDedupeBadge = 'corner' | 'suffix' | 'pill' | 'stack';

/** Verhalten der Restzeit-Anzeige, wenn eine identische Nachricht erneut ausgelöst wird. */
export type ToastDedupeTimer = 'reset' | 'continue' | 'extend';

export interface ToastColors {
  /** Hintergrundfarbe des Toasts. */
  background?: string;
  /** Textfarbe des Toasts (Fallback für Titel/Nachricht, siehe titleColor/messageColor für gezielte Overrides). */
  text?: string;
  /** Statische Umrandungsfarbe (Standard: transparent/unsichtbar), unabhängig vom Timer. */
  border?: string;
  /** Farbe der Timer-Anzeige (Balken/Linie/Uhr). */
  timerColor?: string;
}

export interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  /** Eingebauter Name ('default'/'success'/'error'/'warning'/'info') oder ein beliebiger eigener Typ-Schlüssel. */
  type?: ToastType;
  animation?: ToastAnimation;
  timer?: ToastTimerStyle;
  colors?: ToastColors;
  /** Maximal gleichzeitig sichtbare Toasts (0 = unbegrenzt). Ältester wird bei Überschreitung sofort entfernt. */
  maxToasts?: number;
  /** Bei identischer Nachricht (gleiche position+type+title+text) einen Zähler (×2, ×3, ...) anzeigen statt eines zweiten Toasts. */
  dedupe?: boolean;
  /** Stil des Zählers. Default: 'corner'. */
  dedupeBadge?: ToastDedupeBadge;
  /** Timer-Verhalten bei Wiederholung. Default: 'reset'. */
  dedupeTimer?: ToastDedupeTimer;
  /** Optionaler Titel, fett über der Nachricht. */
  title?: string;
  /** Was angezeigt wird. Default: 'both' falls title gesetzt ist, sonst 'message'. */
  show?: ToastShow;
  /** Farbe des Titels, unabhängig von colors.text. */
  titleColor?: string;
  /** Schriftgröße des Titels (z.B. 16 oder '1.1rem'). Default: 15px. */
  titleSize?: string | number;
  /** Farbe der Nachricht, unabhängig von colors.text. */
  messageColor?: string;
  /** Schriftgröße der Nachricht. Default: 14px (geerbt). */
  messageSize?: string | number;
}

/** Pro Typ hinterlegter Standard (z.B. 'error' soll immer 'bounce' + 'border'-Timer nutzen). */
export type ToastTypePreset = Pick<
  ToastOptions,
  | 'duration'
  | 'position'
  | 'animation'
  | 'timer'
  | 'colors'
  | 'dedupe'
  | 'dedupeBadge'
  | 'dedupeTimer'
  | 'title'
  | 'show'
  | 'titleColor'
  | 'titleSize'
  | 'messageColor'
  | 'messageSize'
>;

export interface ToastConfig extends ToastOptions {
  /** Presets je Typ-Schlüssel - Schlüssel können beliebige, selbst gewählte Namen sein, nicht nur die 5 eingebauten. */
  typePresets?: Record<string, ToastTypePreset>;
}

export function showToast(text: string, duration?: number): void;
export function showToast(text: string | undefined, options?: ToastOptions): void;

/**
 * Setzt globale Standardwerte für alle künftigen showToast()-Aufrufe, inklusive
 * pro Typ hinterlegter Presets. Einzelne Aufrufe können jedes Feld weiterhin
 * über ihre eigenen options überschreiben.
 */
export function configureToaster(config: Partial<ToastConfig>): void;
