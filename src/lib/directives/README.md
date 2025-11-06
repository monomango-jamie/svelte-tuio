# Draggable Action

A Svelte action that integrates with the TUIO system to detect directional movements (up/down or left/right) based on touch or tangible interactions.

## Features

- ✨ Seamless TUIO integration for tangible and touch interactions
- 🎯 Configurable direction tracking (x or y axis)
- ⚡ Adjustable sensitivity thresholds
- 🔄 Real-time state updates for movement detection
- 🖱️ Mouse event fallback when TUIO is not available
- 🎨 Lifecycle management with proper cleanup

## Basic Usage

```svelte
<script>
	import { draggable } from 'svelte-tuio';

	let message = $state('Drag me!');
</script>

<div
	use:draggable={{
		direction: 'y',
		sensitivity: 0.05,
		onPushPositive: () => (message = 'Pushed down!'),
		onPushNegative: () => (message = 'Pushed up!'),
		onRelease: () => (message = 'Released!')
	}}
>
	{message}
</div>
```

## Configuration Options

### `DraggableConfig`

| Property         | Type         | Default     | Description                                                     |
| ---------------- | ------------ | ----------- | --------------------------------------------------------------- |
| `direction`      | `'x' \| 'y'` | `'y'`       | Axis to track: 'x' for horizontal, 'y' for vertical             |
| `sensitivity`    | `number`     | `0.05`      | Threshold for detecting movement (0-1, as percentage of screen) |
| `trackTangibles` | `boolean`    | `true`      | Track tangibles (2Dobj) vs finger touches (2Dcur)               |
| `onPushPositive` | `() => void` | `undefined` | Callback when pushed right (x) or down (y)                      |
| `onPushNegative` | `() => void` | `undefined` | Callback when pushed left (x) or up (y)                         |
| `onRelease`      | `() => void` | `undefined` | Callback when touch/tangible is released                        |

## Advanced Examples

### Vertical Slider

```svelte
<script>
	import { draggable } from 'svelte-tuio';

	let volume = $state(50);

	const config = {
		direction: 'y',
		sensitivity: 0.02,
		onPushPositive: () => (volume = Math.max(0, volume - 5)),
		onPushNegative: () => (volume = Math.min(100, volume + 5))
	};
</script>

<div class="slider" use:draggable={config}>
	Volume: {volume}%
</div>
```

### Horizontal Navigation

```svelte
<script>
	import { draggable } from 'svelte-tuio';

	let currentPage = $state(0);
	const pages = ['Home', 'About', 'Contact'];

	const config = {
		direction: 'x',
		sensitivity: 0.1,
		onPushPositive: () => {
			currentPage = Math.min(pages.length - 1, currentPage + 1);
		},
		onPushNegative: () => {
			currentPage = Math.max(0, currentPage - 1);
		}
	};
</script>

<div class="carousel" use:draggable={config}>
	{pages[currentPage]}
</div>
```

### Multi-Directional Game Controller

```svelte
<script>
	import { draggable } from 'svelte-tuio';

	let position = $state({ x: 0, y: 0 });

	// Vertical control
	const verticalConfig = {
		direction: 'y',
		sensitivity: 0.03,
		onPushPositive: () => (position.y += 10),
		onPushNegative: () => (position.y -= 10)
	};

	// Horizontal control
	const horizontalConfig = {
		direction: 'x',
		sensitivity: 0.03,
		onPushPositive: () => (position.x += 10),
		onPushNegative: () => (position.x -= 10)
	};
</script>

<div class="game-area">
	<div class="vertical-control" use:draggable={verticalConfig}>↕️ Up/Down</div>

	<div class="horizontal-control" use:draggable={horizontalConfig}>↔️ Left/Right</div>

	<div class="player" style="transform: translate({position.x}px, {position.y}px)">🎮</div>
</div>
```

## State Tracking

While the action primarily uses callbacks, you can also implement state tracking in your component:

```svelte
<script>
	import { draggable } from 'svelte-tuio';

	let isPushedUp = $state(false);
	let isPushedDown = $state(false);
	let isActive = $state(false);

	const config = {
		direction: 'y',
		sensitivity: 0.05,
		onPushPositive: () => {
			isPushedDown = true;
			isPushedUp = false;
			isActive = true;
		},
		onPushNegative: () => {
			isPushedUp = true;
			isPushedDown = false;
			isActive = true;
		},
		onRelease: () => {
			isPushedUp = false;
			isPushedDown = false;
			isActive = false;
		}
	};
</script>

<div
	class="draggable"
	class:active={isActive}
	class:pushed-up={isPushedUp}
	class:pushed-down={isPushedDown}
	use:draggable={config}
>
	{#if isPushedUp}
		⬆️ Pushing Up
	{:else if isPushedDown}
		⬇️ Pushing Down
	{:else}
		Drag me!
	{/if}
</div>

<style>
	.draggable {
		transition: all 0.3s ease;
	}

	.draggable.pushed-up {
		transform: translateY(-20px);
		background: lightblue;
	}

	.draggable.pushed-down {
		transform: translateY(20px);
		background: lightcoral;
	}
</style>
```

## How It Works

1. **Initialization**: When the action is applied to an element, it:
   - Gets the TUIOHandler from Svelte context
   - Calculates the element's position as a touch zone
   - Registers the zone with the TUIO system

2. **Touch Detection**: When a touch or tangible is detected:
   - Records the initial position
   - Begins tracking movement

3. **Movement Tracking**: As the touch/tangible moves:
   - Calculates the delta from the initial position
   - Compares against the sensitivity threshold
   - Triggers appropriate callbacks when threshold is exceeded

4. **Cleanup**: When the element is unmounted:
   - Unregisters the touch zone
   - Removes all event listeners

## Coordinate System

The action uses normalized coordinates (0-1) where:

- `u` represents horizontal position (0 = left edge, 1 = right edge)
- `v` represents vertical position (0 = top edge, 1 = bottom edge)

The `sensitivity` parameter is also normalized:

- `0.05` = 5% of screen width/height
- `0.1` = 10% of screen width/height
- etc.

## Mouse Fallback

When TUIO is not available (no TUIOProvider in context), the action automatically falls back to mouse events:

```javascript
// Mouse fallback uses pixel-based sensitivity instead of normalized
const config = {
	direction: 'y',
	sensitivity: 50 // 50 pixels when using mouse fallback
	// ... other options
};
```

## Requirements

- Must be used within a `TUIOProvider` component for TUIO functionality
- Requires Svelte 5+ for `$state` runes
- Element must have a defined size (width/height)

## Best Practices

1. **Sensitivity Tuning**: Start with `0.05` (5%) and adjust based on your use case
2. **Visual Feedback**: Always provide visual feedback for user interactions
3. **Debouncing**: Consider debouncing callback functions for performance
4. **Accessibility**: Provide alternative input methods for non-TUIO users
5. **Touch Zones**: Ensure touch zones don't overlap unexpectedly

## Troubleshooting

### Action not responding to touches

- Ensure the element is within a `TUIOProvider`
- Check that the element has a defined size
- Verify the TUIO server is connected and sending data
- Check browser console for connection errors

### Callbacks firing too frequently

- Increase the `sensitivity` threshold
- Use the `debounceTime` option on the TUIOHandler

### Touch detection not accurate

- Ensure the element's position is static or properly tracked
- Consider recalculating touch zones if elements move dynamically
- Check that coordinate calculations match your layout

## License

Part of the svelte-tuio package. See main package README for license information.
