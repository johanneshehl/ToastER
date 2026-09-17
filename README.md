# toaster

[![Web Builder](https://img.shields.io/badge/Web%20Builder-toaster.johanneshehl.com-2563eb?style=flat-square)](https://toaster.johanneshehl.com)

[![npm version](https://img.shields.io/npm/v/dein-paketname.svg)](https://www.npmjs.com/package/dein-paketname)
[![npm downloads](https://img.shields.io/npm/dm/dein-paketname.svg)](https://www.npmjs.com/package/dein-paketname)

Zero-config toast notifications for the browser. No CSS import, no build
step, no framework lock-in — `npm install` and call `showToast(...)`.

> Want to design your toasts visually instead of hand-writing config? Use
> the hosted builder at **[toaster.johanneshehl.com](https://toaster.johanneshehl.com)**
> to configure types, colors, animations and timers, then copy the generated
> code straight into your project.

```js
const { showToast } = require('toaster');

showToast('Saved!', { type: 'success' });
```

## Installation

Locally as a `file:` dependency (see the main project's README for details
on `npm link` vs. a `file:` path):

```json
"dependencies": {
  "toaster": "file:../ToastER"
}
```

```bash
npm install
```

## Quick start

```js
import { showToast } from 'toaster';

showToast('Hello world!');

showToast('That worked.', {
  type: 'success',
  position: 'top-center',
  duration: 4000,
});
```

## Options (`ToastOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `duration` | `number` | `3000` | Visible duration in ms. |
| `position` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Where the toast appears. |
| `type` | `string` | `'default'` | Any type key. `'default'/'success'/'error'/'warning'/'info'` ship with ready-made colors; any other name is a fully custom type (configure its look via `typePresets`). |
| `animation` | `'fade' \| 'slide' \| 'zoom' \| 'bounce'` | `'slide'` | Enter/exit animation. |
| `timer` | `'none' \| 'bar-bottom' \| 'bar-top' \| 'border' \| 'clock'` | `'bar-bottom'` | Visual countdown indicator. |
| `colors` | `ToastColors` | `{}` | Color overrides, see below. |
| `maxToasts` | `number` | `0` (unlimited) | Maximum toasts visible at once. The oldest is removed immediately when exceeded. |
| `dedupe` | `boolean` | `false` | When the same message (same `position`+`type`+text) fires again, bump a counter (×2, ×3, ...) on the existing toast instead of creating a second one. |
| `dedupeBadge` | `'corner' \| 'suffix' \| 'pill' \| 'stack'` | `'corner'` | How the counter is displayed, see below. |
| `dedupeTimer` | `'reset' \| 'continue' \| 'extend'` | `'reset'` | What happens to the countdown on a repeat, see below. |
| `title` | `string` | – | Optional title, bold, above the message. |
| `show` | `'message' \| 'title' \| 'both'` | `'both'` if `title` is set, else `'message'` | What gets rendered. |
| `titleColor` / `titleSize` | `string` / `string \| number` | – | Title color/size, independent of `colors.text`. |
| `messageColor` / `messageSize` | `string` / `string \| number` | – | Message color/size, independent of `colors.text`. |

### Custom types

`type` isn't a fixed enum — any string is valid. The 5 built-in names come
with ready-made colors out of the box; any other name is a fully custom type
whose look is defined via `typePresets`:

```js
configureToaster({
  typePresets: {
    shipmentConfirmed: {
      colors: { background: '#0f766e' },
      timer: 'clock',
      show: 'both',
      title: 'Shipment confirmed',
    },
  },
});

showToast('Your order is on its way.', { type: 'shipmentConfirmed' });
```

### `colors`

| Field | Description |
|---|---|
| `background` | Background color of the toast. |
| `text` | Text color. |
| `border` | Static border color (default: transparent/invisible), independent of the timer. Any CSS color value works, including `rgba(...)` for custom transparency. |
| `timerColor` | Color of the timer indicator (bar/line/clock). |

### Timer styles

- **`bar-bottom` / `bar-top`** – a bar at the bottom/top edge shrinks over the duration.
- **`border`** – a thin line traces exactly along the toast's rounded edge and depletes like a clock (SVG `stroke-dashoffset`, no color change, no background overhang at the corners).
- **`clock`** – a small circle top-right counts down like a clock face (uses CSS `@property`, needs a modern browser).
- **`none`** – no countdown indicator.

### Stacking duplicates (`dedupe`)

If the same call (same `position`+`type`+text) fires repeatedly, no second
toast is created — a counter on the existing one is updated instead:

```js
showToast('Saved!', { type: 'success', dedupe: true });
showToast('Saved!', { type: 'success', dedupe: true }); // -> same toast, shows ×2
```

**`dedupeBadge`** (how the counter is shown):
- `'corner'` – small round badge in the top-left corner of the toast.
- `'suffix'` – counter is appended directly to the text ("Saved  ×2").
- `'pill'` – rounded chip at the end of the line, inside the text area.
- `'stack'` – like `'corner'`, plus a peeking card behind it once there are 2 messages, capped at a stack depth of 3 (2 peek layers) for 3 or more. The peek layers fade in/out with the same animation as the toast itself, including on expiry.

**`dedupeTimer`** (what happens to the countdown on a repeat):
- `'reset'` – the countdown restarts from full `duration`, counted from the latest duplicate.
- `'continue'` – the original countdown keeps running unaffected, only the counter increases.
- `'extend'` – remaining time + new `duration` are added together, so the indicator runs proportionally longer.

## Global defaults: `configureToaster()`

Call this once at app startup to set defaults for every subsequent
`showToast()` call. Any individual call can still override any field.

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

`typePresets` sets per-type (`default`/`success`/`error`/`warning`/`info`, or
any custom name) defaults for `duration`, `position`, `animation`, `timer`,
`colors`, `dedupe*`, and `title`/`show`/title-message styling. Resolution
order per call:

`explicit option in the showToast() call` → `typePresets[type]` → `global configureToaster() defaults` → `built-in fallback`

## Recommendation: a dedicated wrapper class instead of scattered calls

Repeating `showToast(text, { ...ten options })` all over your codebase
quickly drifts out of sync (`duration: 3000` here, `4000` there, a slightly
wrong shade of a color). Centralize the configuration in **one** place instead:

1. Call `configureToaster()` **once** at app startup (design system: colors,
   timer style, positions, `maxToasts`).
2. Expose your own class/service with meaningful methods (`success()`,
   `error()`, `warning()`, `info()`) instead of typing `type: '...'`
   everywhere.
3. Only that one class knows the `toaster` API — the rest of the app just
   calls `toast.success('Saved')`. Swapping the underlying package later
   only touches one file.

### Example: Angular

```ts
// toast.service.ts
import { Injectable } from '@angular/core';
import { showToast, configureToaster, ToastOptions } from 'toaster';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor() {
    // Central design decisions — set once, in one place.
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
        warning: { colors: { background: '#d97706' } },
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
    this.toast.error('Failed to load dashboard data.');
  }
}
```

Because `configureToaster()` runs the first time the (singleton) service is
created, the rest of the app never needs to know colors, timer styles, or
positions again — just `success/error/warning/info`.

The same pattern works identically in React (a `useToast()` hook or a module
that runs `configureToaster()` once on import), Vue (a plugin/composable), or
Svelte (a store module).
