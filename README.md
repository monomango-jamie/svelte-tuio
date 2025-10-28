# svelte-tuio

A Svelte 5 library for handling TUIO (Tangible User Interface Objects) protocol events through WebSocket connections. Built with runes and reactive state management for tracking tangible objects on interactive surfaces.

## Features

- 🎯 **WebSocket-based TUIO Handler** - Manages TUIO protocol events (2Dobj, 2Dcur profiles)
- 🔄 **Reactive State** - Built with Svelte 5 runes for automatic reactivity
- 📦 **Tangibles Manager** - Track and manage multiple tangible objects with positions and rotations
- 🎨 **Debug Component** - Visual debugger with real-time updates (Tailwind CSS)
- 🪝 **Simple Hook API** - Easy context-based access via `useTUIO()`
- 🎛️ **Touch Zones** - Define interactive zones with event handlers

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

```svelte
<script>
  import { TUIOProvider } from 'svelte-tuio';

  // Create WebSocket connection to your TUIO server
  // Replace with your TouchDesigner WebSocket server address
  const socket = new WebSocket('ws://localhost:8080');
</script>

<TUIOProvider {socket}>
  <!-- Your app components can now access TUIO data via useTUIO() -->
</TUIOProvider>
```

### TouchDesigner Setup

Your TouchDesigner project needs to run a WebSocket server that sends TUIO events in the JSON format shown above.

> **Note:** An example Python callbacks file for TouchDesigner is included in this package at `src/python/example_tuio_callbacks.py`

### Using the Hook

```svelte
<script>
  import { useTUIO } from 'svelte-tuio';

  const tuioHandler = useTUIO();
  
  // State is already reactive via Svelte 5 runes ($state)
  // No need for $: reactive statements!
</script>

<div>
  <p>Connected: {tuioHandler.isSocketConnected()}</p>
  
  {#each tuioHandler.tangiblesManager.tangibles as tangible}
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

### `TUIOHandler`

Main class for managing TUIO WebSocket connections.

```typescript
const handler = new TUIOHandler(socket, simulateClick?);

// Properties
handler.tangiblesManager   // TangiblesManager instance
handler.touchZones          // Array of touch zones ($state)

// Methods
handler.isSocketConnected() // Check connection status
handler.getSocket()         // Get WebSocket instance
handler.removeSocket()      // Close connection
```

### `TangiblesManager`

Manages tangible objects with reactive state. All tangible operations are handled internally by `TUIOHandler`.

```typescript
// Public Properties (read-only)
manager.tangibles          // TUIOTouch[] ($state) - All active tangibles
manager.tangibleClassIds   // number[] ($state) - Just the class IDs
```

### `useTUIO()`

Hook to access TUIOHandler from context.

```typescript
const tuioHandler = useTUIO();
```

## Touch Zones

Define interactive zones with event handlers:

```svelte
<script>
  import { useTUIO } from 'svelte-tuio';

  const tuioHandler = useTUIO();

  // Add a touch zone
  tuioHandler.touchZones.push({
    id: 'zone-1',
    u: 0.1,
    v: 0.1,
    normalisedWidth: 0.5,
    normalisedHeight: 0.5,
    onPlaceTangible: (touch) => console.log('Placed:', touch),
    onRemoveTangible: (touch) => console.log('Removed:', touch),
    onMoveTangible: (touch) => console.log('Moved:', touch)
  });
</script>

<div>
  Active zones: {tuioHandler.touchZones.length}
</div>
```

## Events

The library handles TUIO protocol events:

- **2Dobj** - Tangible objects (fiducial markers)
  - `touchesStart` → `handlePlaceTangible()`
  - `touchesMove` → `handleMoveTangible()`
  - `touchesEnd` → `handleRemoveTangible()`

- **2Dcur** - Finger/cursor touches
  - `touchesEnd` → `handleFingerTouchEnd()`

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { TUIOTouch, TUIOEvent, TouchZone } from 'svelte-tuio';
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
