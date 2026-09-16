# toaster

Zero-Config Toast-Benachrichtigungen für den Browser. Kein CSS-Import, kein
Build-Schritt, kein Framework-Zwang — `npm install` und `showToast(...)`
aufrufen.

```js
const { showToast } = require('toaster');

showToast('Gespeichert!', { type: 'success' });
```

## Installation

Lokal als `file:`-Dependency (siehe Hauptprojekt-README für Details zu
`npm link` vs. `file:`-Pfad):

```json
"dependencies": {
  "toaster": "file:../ToastER"
}
```

```bash
npm install
```

## Schnellstart

```js
import { showToast } from 'toaster';

showToast('Hallo Welt!');

showToast('Das hat geklappt.', {
  type: 'success',
  position: 'top-center',
  duration: 4000,
});
```

## Optionen (`ToastOptions`)

| Option | Typ | Standard | Beschreibung |
|---|---|---|---|
| `duration` | `number` | `3000` | Anzeigedauer in ms. |
| `position` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Wo der Toast erscheint. |
| `type` | `string` | `'default'` | Beliebiger Typ-Schlüssel. `'default'/'success'/'error'/'warning'/'info'` bringen fertige Farben mit, jeder andere Name ist ein frei definierbarer eigener Typ (Farben/Verhalten über `typePresets` festlegen). |
| `animation` | `'fade' \| 'slide' \| 'zoom' \| 'bounce'` | `'slide'` | Ein-/Ausblend-Animation. |
| `timer` | `'none' \| 'bar-bottom' \| 'bar-top' \| 'border' \| 'clock'` | `'bar-bottom'` | Visuelle Restzeit-Anzeige. |
| `colors` | `ToastColors` | `{}` | Farbüberschreibungen, siehe unten. |
| `maxToasts` | `number` | `0` (unbegrenzt) | Maximal gleichzeitig sichtbare Toasts. Bei Überschreitung wird der älteste sofort entfernt. |
| `dedupe` | `boolean` | `false` | Bei identischer Nachricht (gleiche `position`+`type`+Text) einen Zähler (×2, ×3, ...) anzeigen statt eines zweiten Toasts. |
| `dedupeBadge` | `'corner' \| 'suffix' \| 'pill' \| 'stack'` | `'corner'` | Stil des Zählers, siehe unten. |
| `dedupeTimer` | `'reset' \| 'continue' \| 'extend'` | `'reset'` | Restzeit-Verhalten bei Wiederholung, siehe unten. |
| `title` | `string` | – | Optionaler Titel, fett über der Nachricht. |
| `show` | `'message' \| 'title' \| 'both'` | `'both'` falls `title` gesetzt, sonst `'message'` | Was angezeigt wird. |
| `titleColor` / `titleSize` | `string` / `string \| number` | – | Farbe/Größe des Titels, unabhängig von `colors.text`. |
| `messageColor` / `messageSize` | `string` / `string \| number` | – | Farbe/Größe der Nachricht, unabhängig von `colors.text`. |

### Eigene Typen

`type` ist kein fester Enum — jeder String ist gültig. Die 5 eingebauten Namen
bringen sofort einsatzbereite Farben mit; jeder andere Name ist ein
vollständig frei definierbarer Typ, dessen Aussehen über `typePresets`
festgelegt wird:

```js
configureToaster({
  typePresets: {
    versandBestaetigt: {
      colors: { background: '#0f766e' },
      timer: 'clock',
      show: 'both',
      title: 'Versand bestätigt',
    },
  },
});

showToast('Deine Bestellung ist unterwegs.', { type: 'versandBestaetigt' });
```

### `colors`

| Feld | Beschreibung |
|---|---|
| `background` | Hintergrundfarbe des Toasts. |
| `text` | Textfarbe. |
| `border` | Statische Umrandungsfarbe (Standard: transparent/unsichtbar), unabhängig vom Timer. Jeder CSS-Farbwert funktioniert, auch `rgba(...)` für eigene Transparenz. |
| `timerColor` | Farbe der Timer-Anzeige (Balken/Linie/Uhr). |

### Timer-Stile

- **`bar-bottom` / `bar-top`** – ein Balken am unteren/oberen Rand schrumpft über die Dauer.
- **`border`** – eine dünne Linie läuft exakt entlang der abgerundeten Toast-Kante entlang und baut sich wie eine Uhr ab (SVG `stroke-dashoffset`, keine Farbänderung, kein Hintergrund-Überstand an den Ecken).
- **`clock`** – ein kleiner Kreis oben rechts läuft wie eine Uhr ab (nutzt CSS `@property`, benötigt einen aktuellen Browser).
- **`none`** – keine Restzeit-Anzeige.

### Duplikate stapeln (`dedupe`)

Löst derselbe Aufruf (gleiche `position`+`type`+Text) mehrfach hintereinander aus, wird kein zweiter Toast erzeugt, sondern ein Zähler am bestehenden aktualisiert:

```js
showToast('Gespeichert!', { type: 'success', dedupe: true });
showToast('Gespeichert!', { type: 'success', dedupe: true }); // -> selber Toast, zeigt ×2
```

**`dedupeBadge`** (Darstellung des Zählers):
- `'corner'` – kleines rundes Badge oben links im Toast.
- `'suffix'` – Zähler wird direkt an den Text angehängt ("Gespeichert  ×2").
- `'pill'` – abgerundeter Chip am Zeilenende, innerhalb des Textbereichs.
- `'stack'` – wie `'corner'`, zusätzlich zwei leicht versetzte Karten-Kanten dahinter (Stapel-Optik).

**`dedupeTimer`** (was mit der Restzeit bei einer Wiederholung passiert):
- `'reset'` – Restzeit-Anzeige startet komplett neu (volle `duration` ab dem letzten Duplikat).
- `'continue'` – ursprüngliche Restzeit läuft unbeeinflusst weiter, nur der Zähler steigt.
- `'extend'` – verbleibende Restzeit + neue `duration` werden addiert, Anzeige läuft entsprechend länger.

## Globale Defaults: `configureToaster()`

Einmal beim App-Start aufrufen, um Standardwerte für alle folgenden
`showToast()`-Aufrufe zu setzen. Jeder einzelne Aufruf kann jedes Feld
weiterhin gezielt überschreiben.

```js
import { configureToaster } from 'toaster';

configureToaster({
  duration: 4000,
  position: 'top-right',
  animation: 'fade',
  maxToasts: 3,
  typePresets: {
    error: {
      animation: 'bounce',
      timer: 'border',
      colors: { background: '#c0392b', timerColor: '#ffffff' },
    },
    success: {
      timer: 'bar-bottom',
      colors: { background: '#2e7d46' },
    },
  },
});
```

`typePresets` legt pro Typ (`default`/`success`/`error`/`warning`/`info`)
eigene Standards für `duration`, `position`, `animation`, `timer` und
`colors` fest. Auflösungsreihenfolge pro Aufruf:

`explizite Option im showToast()-Aufruf` → `typePresets[type]` → `globale configureToaster()-Defaults` → `eingebauter Fallback`

## Empfehlung: eigene Wrapper-Klasse statt verstreuter Aufrufe

`showToast(text, { ...zehn Optionen })` an zig Stellen im Code zu wiederholen
führt schnell zu Inkonsistenzen (mal `duration: 3000`, mal `4000`, mal ein
falscher Farbton). Kapsle die Konfiguration stattdessen an **einer** Stelle:

1. Ruf `configureToaster()` **einmal** beim Start der App auf (Design-System:
   Farben, Timer-Stil, Positionen, `maxToasts`).
2. Biete darüber eine eigene Klasse/Service mit sprechenden Methoden an
   (`success()`, `error()`, `warning()`, `info()`) statt überall `type: '...'`
   zu tippen.
3. Nur diese eine Klasse kennt die `toaster`-API — der Rest der App kennt nur
   `toast.success('Gespeichert')`. Ein API-Wechsel (z.B. anderes Toast-Paket)
   betrifft dann nur eine Datei.

### Beispiel: Angular

```ts
// toast.service.ts
import { Injectable } from '@angular/core';
import { showToast, configureToaster, ToastOptions } from 'toaster';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor() {
    // Zentrale Design-Entscheidungen — einmalig, an einer Stelle.
    configureToaster({
      duration: 3500,
      position: 'top-right',
      animation: 'slide',
      maxToasts: 4,
      typePresets: {
        success: { timer: 'bar-bottom', colors: { background: '#2e7d46' } },
        error: {
          timer: 'border',
          animation: 'bounce',
          colors: { background: '#c0392b', timerColor: '#fff' },
        },
        warning: { colors: { background: '#b7791f' } },
        info: { colors: { background: '#2563eb' } },
      },
    });
  }

  success(text: string, options?: ToastOptions): void {
    showToast(text, { ...options, type: 'success' });
  }

  error(text: string, options?: ToastOptions): void {
    showToast(text, { ...options, type: 'error' });
  }

  warning(text: string, options?: ToastOptions): void {
    showToast(text, { ...options, type: 'warning' });
  }

  info(text: string, options?: ToastOptions): void {
    showToast(text, { ...options, type: 'info' });
  }
}
```

```ts
// dashboard.ts
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({ /* ... */ })
export class Dashboard {
  private readonly toast = inject(ToastService);

  showErrorToast(): void {
    this.toast.error('Dashboard-Daten konnten nicht geladen werden.');
  }
}
```

Weil `configureToaster()` beim ersten Erzeugen des (Singleton-)Services
läuft, muss der Rest der App nie wieder Farben, Timer-Stile oder Positionen
kennen — nur noch `success/error/warning/info`.

Das gleiche Muster funktioniert identisch in React (ein `useToast()`-Hook
bzw. ein Modul, das `configureToaster()` beim Import einmalig ausführt), Vue
(ein Plugin/Composable) oder Svelte (ein Store-Modul).

## Testprojekt / Demo

Im Ordner [`demo/`](demo/) liegt eine interaktive Testseite mit einem
UI-Baukasten für alle 5 Toast-Typen, mehrsprachigen Beispieltexten und
Code-Snippets für 5 Frameworks.

```bash
npm run demo
```

Danach `http://localhost:5050` öffnen.
