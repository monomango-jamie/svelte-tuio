<script lang="ts" module>
	import { getTUIOHandlerContext } from '../tuio-provider/context';
	import type { TUIOTouch } from '../types/TUIO';
	import type { TouchZone } from '../tuio-provider/TUIOHandler.svelte';

	export interface DraggableConfig {
		/** Direction to track: 'x' for horizontal, 'y' for vertical */
		direction?: 'x' | 'y';
		/** Sensitivity threshold (0-1, representing percentage of screen) */
		sensitivity?: number;
		/** Callback when pushed in positive direction (right/down) */
		onPushPositive?: () => void;
		/** Callback when pushed in negative direction (left/up) */
		onPushNegative?: () => void;
		/** Callback when movement ends */
		onRelease?: () => void;
		/** Callback on every move with the current delta */
		onMove?: (delta: number) => void;
	}

	export interface DraggableState {
		isPushedUp: boolean;
		isPushedDown: boolean;
		isPushedLeft: boolean;
		isPushedRight: boolean;
		currentDelta: number;
		isActive: boolean;
	}

	/**
	 * Svelte action that integrates with TUIO to track finger touch movements (2Dcur)
	 * and determine directional pushes based on sensitivity thresholds.
	 *
	 * @example
	 * ```svelte
	 * <div use:draggable={{ direction: 'y', sensitivity: 0.05 }}>
	 *   Drag me up or down!
	 * </div>
	 * ```
	 */
	export function draggable(node: HTMLElement, config: DraggableConfig = {}) {
		const {
			direction = 'y',
			sensitivity = 0.05,
			onPushPositive,
			onPushNegative,
			onRelease,
			onMove
		} = config;

		// Get TUIO handler from context
		let tuioHandler: ReturnType<typeof getTUIOHandlerContext>;
		try {
			tuioHandler = getTUIOHandlerContext();
		} catch (error) {
			console.warn('draggable action requires TUIOProvider. Falling back to mouse events.');
			return setupMouseFallback(node, config);
		}

		// State tracking
		let initialPosition = { u: 0, v: 0 };
		let isTracking = false;
		let zoneId = `draggable-${Math.random().toString(36).substr(2, 9)}`;
		let activeTouchId: number | null = null;

		// Calculate touch zone from element's position
		// Note: v-coordinate is inverted because TUIO uses 0 at bottom, 1 at top
		function calculateTouchZone(): Omit<TouchZone, 'id'> {
			const rect = node.getBoundingClientRect();
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;

			// Invert v-coordinate: TUIO uses 0 at bottom, screen uses 0 at top
			const screenV = rect.top / windowHeight;
			const invertedV = 1 - screenV - (rect.height / windowHeight);

			return {
				u: rect.left / windowWidth,
				v: invertedV,
				normalisedWidth: rect.width / windowWidth,
				normalisedHeight: rect.height / windowHeight
			};
		}

		// Update state based on movement delta
		function updateMovement(delta: number) {
			// Call the onMove callback with current delta
			onMove?.(delta);

			// Check if we've exceeded the sensitivity threshold
			if (direction === 'y') {
				const isPushedDown = delta >= sensitivity;
				const isPushedUp = delta <= -sensitivity;

				if (isPushedDown) onPushPositive?.();
				if (isPushedUp) onPushNegative?.();
			} else {
				const isPushedRight = delta >= sensitivity;
				const isPushedLeft = delta <= -sensitivity;

				if (isPushedRight) onPushPositive?.();
				if (isPushedLeft) onPushNegative?.();
			}
		}

		// Reset state
		function resetState() {
			isTracking = false;
			activeTouchId = null;
			onRelease?.();
		}

		// Touch zone callbacks for finger touches (2Dcur)
		const touchZone: TouchZone = {
			id: zoneId,
			...calculateTouchZone(),
			onTouchStart: (touch: TUIOTouch) => {
				// Start tracking this touch
				initialPosition = { u: touch.u, v: touch.v };
				isTracking = true;
				activeTouchId = touch.id;
			},
			onTouchMove: (touch: TUIOTouch) => {
				// Only track the touch that started in this zone
				if (isTracking && touch.id === activeTouchId) {
					const delta =
						direction === 'y' ? touch.v - initialPosition.v : touch.u - initialPosition.u;

					updateMovement(delta);
				}
			},
			onTouchEnd: (touch: TUIOTouch) => {
				// Only reset if it's our tracked touch
				if (isTracking && touch.id === activeTouchId) {
					resetState();
				}
			}
		};

		// Register the touch zone
		tuioHandler.registerTouchZone(touchZone);

		// Cleanup
		return {
			destroy() {
				tuioHandler.unregisterTouchZone(zoneId);
			},
			update(newConfig: DraggableConfig) {
				// Update configuration if needed
				Object.assign(config, newConfig);
			}
		};
	}

	/**
	 * Fallback to mouse events when TUIO is not available
	 */
	function setupMouseFallback(node: HTMLElement, config: DraggableConfig) {
		const {
			direction = 'y',
			sensitivity = 50,
			onPushPositive,
			onPushNegative,
			onRelease,
			onMove
		} = config;

		let isMouseDown = false;
		let startX = 0;
		let startY = 0;
		let lastTriggeredPositive = false;
		let lastTriggeredNegative = false;

		const handleMouseDown = (event: MouseEvent) => {
			isMouseDown = true;
			startX = event.clientX;
			startY = event.clientY;
			lastTriggeredPositive = false;
			lastTriggeredNegative = false;
		};

		const handleMouseMove = (event: MouseEvent) => {
			if (!isMouseDown) return;

			const deltaX = event.clientX - startX;
			const deltaY = event.clientY - startY;
			const delta = direction === 'y' ? deltaY : deltaX;

			// Normalize delta to 0-1 range (convert pixels to percentage of window)
			const normalizedDelta =
				direction === 'y' ? delta / window.innerHeight : delta / window.innerWidth;

			// Call onMove with normalized delta
			onMove?.(normalizedDelta);

			// Check sensitivity threshold
			if (Math.abs(normalizedDelta) >= sensitivity) {
				if (normalizedDelta > 0 && !lastTriggeredPositive) {
					onPushPositive?.();
					lastTriggeredPositive = true;
					lastTriggeredNegative = false;
				} else if (normalizedDelta < 0 && !lastTriggeredNegative) {
					onPushNegative?.();
					lastTriggeredNegative = true;
					lastTriggeredPositive = false;
				}
			}
		};

		const handleMouseUp = () => {
			if (isMouseDown) {
				isMouseDown = false;
				onRelease?.();
			}
		};

		node.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return {
			destroy() {
				node.removeEventListener('mousedown', handleMouseDown);
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
			}
		};
	}
</script>
