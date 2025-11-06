# svelte-tuio

A Svelte 5 library for handling TUIO (Tangible User Interface Objects) protocol events through WebSocket connections. Built with runes and reactive state management for tracking tangible objects on interactive surfaces.

## Features

- 🎯 **WebSocket-based TUIO Handler** - Manages TUIO protocol events.
- 🔄 **Reactive State** - Built with Svelte 5 runes for automatic reactivity.
- 📦 **Tangibles Manager** - Track and manage multiple tangible objects with positions and rotations.
- 🎨 **Debug Component** - Visual debugger with real-time updates.
- 🪝 **Simple Hook API** - Easy context-based access via `useTUIO()`.

## Overview

This library is designed to receive TUIO messages from a **TUIO server** (such as TouchDesigner) and make them available in your Svelte web frontend.

### How It Works

1. **TUIO Server** - Your TouchDesigner (or other TUIO) project runs a WebSocket server
2. **WebSocket Connection** - Pass a WebSocket instance to `TUIOProvider` that connects to your TUIO server
3. **Event Transmission** - The TUIO server transmits touch and tangible events over the WebSocket
4. **Reactive State** - The library automatically updates reactive state that your Svelte components can consume

### Requirements

- A TUIO server (e.g., TouchDesigner) running a WebSocket server on the same network
- The server should send TUIO events in JSON format with the following structure:
  ```json
  {
    "timestamp": 123456789,
    "touchesStart": [...],
    "touchesMove": [...],
    "touchesEnd": [...],
    "touchesNoChange": [...]
  }
  ```

## Installation

```bash
npm install svelte-tuio
```

## Usage

### Basic Setup

The simplest way to use the library is with `TUIOProvider`, which automatically creates a `TUIOHandler` for you:

```svelte
<script>
	import { TUIOProvider } from 'svelte-tuio';
	import { SvelteSocket } from '@hardingjam/svelte-socket';
	let { children } = $props();

	// Create WebSocket connection to your TUIO server
	// Replace with your TouchDesigner WebSocket server address
	const svelteSocket = new SvelteSocket('ws://localhost:8080');
</script>

<TUIOProvider {svelteSocket}>
	<!-- Your app components can now access TUIO data via useTUIO() -->
	{@render children?.()}
</TUIOProvider>
```

**Custom Handler Configuration:**

You can also create your own `TUIOHandler` with custom callbacks and pass it to the provider:

```svelte
<script>
	import { TUIOProvider, TUIOHandler } from 'svelte-tuio';
	import { SvelteSocket } from '@hardingjam/svelte-socket';
	let { children } = $props();

	const svelteSocket = new SvelteSocket('ws://localhost:8080');

	const tuioHandler = new TUIOHandler({
		svelteSocket,
		onFingerTouchEnd: (u, v) => {
			console.log(`Touch at ${u}, ${v}`);
		},
		onPlaceTangible: (touch) => {
			console.log(`Tangible ${touch.classId} placed`);
		}
	});
</script>

<TUIOProvider {tuioHandler}>
	<!-- Your app components can now access TUIO data via useTUIO() -->
	{@render children?.()}
</TUIOProvider>
```

### TouchDesigner Setup

Your TouchDesigner project needs to run a WebSocket server that sends TUIO events in the JSON format shown above.

> **Note:** An example Python callbacks file for TouchDesigner is included in this package at [`src/python/example_tuio_callbacks.py`](https://github.com/monomango-jamie/svelte-tuio/blob/main/src/python/example_tuio_callbacks.py)

### Using the Hook

```svelte
<script>
	import { useTUIO } from 'svelte-tuio';

	const tuioHandler = useTUIO();
	let tangibles = $derived(tuioHandler.tangiblesManager.tangibles);
	let isConnected = $derived(tuioHandler.svelteSocket.isConnected);
</script>

<div>
	<p>Connected: {isConnected}</p>

	{#each tangibles as tangible}
		<div>
			Tangible {tangible.classId} at ({tangible.u}, {tangible.v})
		</div>
	{/each}
</div>
```

### Debug Component

```svelte
<script>
	import { TangiblesDebugger } from 'svelte-tuio';
</script>

<TangiblesDebugger />
```

## API

### `TUIOProvider`

Wrapper component that sets up TUIO context for your app.

**Props:**

- `svelteSocket` - SvelteSocket instance from `@hardingjam/svelte-socket` (automatically creates handler)
- `tuioHandler` - Optional pre-configured TUIOHandler instance

### `TUIOHandler`

Main class for managing TUIO WebSocket connections.

```typescript
import type { TUIOHandlerConfig } from 'svelte-tuio';
import { SvelteSocket } from '@hardingjam/svelte-socket';

const svelteSocket = new SvelteSocket('ws://localhost:8080');

const config: TUIOHandlerConfig = {
	svelteSocket,
	onFingerTouchEnd: (u, v) => {
		/* ... */
	},
	onFingerTouchStart: (u, v) => {
		/* ... */
	},
	onPlaceTangible: (touch) => {
		/* ... */
	},
	onRemoveTangible: (touch) => {
		/* ... */
	},
	onMoveTangible: (touch) => {
		/* ... */
	},
	debounceTime: 100  // Optional: throttle callbacks to once per 100ms
};

const handler = new TUIOHandler(config);

// Properties
handler.tangiblesManager; // TangiblesManager instance
handler.touchZones; // Array of touch zones ($state)
handler.svelteSocket; // SvelteSocket instance
```

### Touch Zones

Touch zones allow you to define regions of the screen and attach callbacks for touch/tangible events within those regions. Touch zones are **user-managed** - you register zones and implement your own logic to check if touches fall within zones.

```typescript
import type { TouchZone } from 'svelte-tuio';

const tuioHandler = useTUIO();

// Define a touch zone
const zone: TouchZone = {
	id: 'my-zone',
	u: 0.1,              // Left edge (normalized 0-1)
	v: 0.1,              // Bottom edge (normalized 0-1)
	normalisedWidth: 0.3,
	normalisedHeight: 0.3,
	onPlaceTangible: (touch) => {
		console.log('Tangible placed in zone', touch);
	},
	onRemoveTangible: (touch) => {
		console.log('Tangible removed from zone', touch);
	},
	onMoveTangible: (touch) => {
		console.log('Tangible moved in zone', touch);
	}
};

// Register the zone
tuioHandler.registerTouchZone(zone);

// Remove a zone when done
tuioHandler.unregisterTouchZone('my-zone');

// You must implement your own logic to check if touches are within zones
// and call the appropriate zone callbacks
```

**Note:** The library provides touch zone registration and storage, but you are responsible for implementing the hit detection logic and calling zone callbacks.

### `TangiblesManager`

Manages tangible objects with reactive state. All tangible operations are handled internally by `TUIOHandler`.

```typescript
// Public Properties (read-only)
manager.tangibles; // TUIOTouch[] ($state) - All active tangibles
manager.tangibleClassIds; // number[] ($state) - Just the class IDs
```

### `useTUIO()`

Hook to access TUIOHandler from context.

```typescript
const tuioHandler = useTUIO();
```

## Custom Event Callbacks

The library provides optional callbacks for all TUIO events. By default:

- **`handleFingerTouchEnd`** - Uses [`defaultSimulateClick`](https://github.com/monomango-jamie/svelte-tuio/blob/main/src/lib/tuio-provider/defaultSimulateClick.ts) to click HTML elements
- **`handleFingerTouchStart`** - Does nothing (no-op)
- **`handlePlaceTangible`** - Automatic (managed by TangiblesManager)
- **`handleRemoveTangible`** - Automatic (managed by TangiblesManager)
- **`handleMoveTangible`** - Automatic (managed by TangiblesManager)

**Custom Callbacks:**

You can provide custom callbacks for any TUIO event:

```svelte
<script>
	import { TUIOProvider, TUIOHandler } from 'svelte-tuio';
	import { SvelteSocket } from '@hardingjam/svelte-socket';

	const svelteSocket = new SvelteSocket('ws://localhost:8080');

	const tuioHandler = new TUIOHandler({
		svelteSocket,
		onFingerTouchEnd: (u, v) => {
			console.log(`Finger touch end at: ${u}, ${v}`);
		},
		onFingerTouchStart: (u, v) => {
			console.log(`Finger touch start at: ${u}, ${v}`);
		},
		onPlaceTangible: (touch) => {
			console.log(`Tangible ${touch.classId} placed`);
		},
		onRemoveTangible: (touch) => {
			console.log(`Tangible ${touch.classId} removed`);
		},
		onMoveTangible: (touch) => {
			console.log(`Tangible ${touch.classId} moved to ${touch.u}, ${touch.v}`);
		}
	});
</script>

<TUIOProvider {tuioHandler}>
	<!-- Your app -->
</TUIOProvider>
```

> **Note:** Custom tangible callbacks are called _in addition to_ the automatic TangiblesManager updates, allowing you to add extra functionality without losing the built-in state management.

### Throttling Callbacks

For performance optimization, especially with high-frequency touch events, you can throttle callback invocations using the `debounceTime` option:

```typescript
const tuioHandler = new TUIOHandler({
	svelteSocket,
	debounceTime: 100, // Minimum 100ms between callback invocations
	onMoveTangible: (touch) => {
		// This will only be called at most once per 100ms per tangible
		console.log(`Tangible ${touch.classId} moved`);
	}
});
```

**How it works:**
- `debounceTime` sets the minimum time (in milliseconds) between callback invocations
- Each callback type (fingerTouchStart, fingerTouchEnd, etc.) is throttled independently  
- For tangible callbacks, throttling is per tangible (by classId)
- TangiblesManager state updates are NOT throttled (state always stays up-to-date)
- Set to `0` (default) to disable throttling

**Use cases:**
- Throttle `onMoveTangible` to reduce expensive operations during dragging
- Throttle touch events to prevent UI lag from rapid touches
- Improve performance on lower-end devices

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { TUIOTouch, TUIOEvent, TouchZone, TUIOHandlerConfig } from 'svelte-tuio';
```

## Development

```bash
npm install
npm run dev
npm run test
npm run build
```

## License

MIT
