<script lang="ts" module>
	import { getTUIOHandlerContext } from '../tuio-provider/context';
	import type { TUIOTouch } from '../types/TUIO';
	import type { TouchZone } from '../tuio-provider/TUIOHandler.svelte';

	export interface DraggableConfig {
		/** Direction to track: 'x' for horizontal, 'y' for vertical */
		direction?: 'x' | 'y';
		/** Sensitivity threshold (0-1, representing percentage of screen) */
		sensitivity?: number;
		/** Whether to track tangibles (2Dobj) or finger touches (2Dcur) */
		trackTangibles?: boolean;
		/** Callback when pushed in positive direction (right/down) */
		onPushPositive?: () => void;
		/** Callback when pushed in negative direction (left/up) */
		onPushNegative?: () => void;
		/** Callback when movement ends */
		onRelease?: () => void;
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
	 * Svelte action that integrates with TUIO to track touch/tangible movements
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
			trackTangibles = true,
			onPushPositive,
			onPushNegative,
			onRelease
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
		let currentPosition = { u: 0, v: 0 };
		let isTracking = false;
		let zoneId = `draggable-${Math.random().toString(36).substr(2, 9)}`;

		// Reactive state that external components can bind to
		const state = $state<DraggableState>({
			isPushedUp: false,
			isPushedDown: false,
			isPushedLeft: false,
			isPushedRight: false,
			currentDelta: 0,
			isActive: false
		});

		// Calculate touch zone from element's position
		function calculateTouchZone(): Omit<TouchZone, 'id'> {
			const rect = node.getBoundingClientRect();
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;

			return {
				u: rect.left / windowWidth,
				v: rect.top / windowHeight,
				normalisedWidth: rect.width / windowWidth,
				normalisedHeight: rect.height / windowHeight
			};
		}

		// Check if touch is within the element's bounds
		function isWithinBounds(touch: TUIOTouch): boolean {
			const zone = calculateTouchZone();
			return (
				touch.u >= zone.u &&
				touch.u <= zone.u + zone.normalisedWidth &&
				touch.v >= zone.v &&
				touch.v <= zone.v + zone.normalisedHeight
			);
		}

		// Update state based on movement delta
		function updateState(delta: number) {
			state.currentDelta = delta;
			
			if (direction === 'y') {
				state.isPushedDown = delta >= sensitivity;
				state.isPushedUp = delta <= -sensitivity;
				
				if (state.isPushedDown) onPushPositive?.();
				if (state.isPushedUp) onPushNegative?.();
			} else {
				state.isPushedRight = delta >= sensitivity;
				state.isPushedLeft = delta <= -sensitivity;
				
				if (state.isPushedRight) onPushPositive?.();
				if (state.isPushedLeft) onPushNegative?.();
			}
		}

		// Reset state
		function resetState() {
			state.isPushedUp = false;
			state.isPushedDown = false;
			state.isPushedLeft = false;
			state.isPushedRight = false;
			state.currentDelta = 0;
			state.isActive = false;
			isTracking = false;
			onRelease?.();
		}

		// Touch zone callbacks
		const touchZone: TouchZone = {
			id: zoneId,
			...calculateTouchZone(),
			onTouchStart: (touch: TUIOTouch) => {
				if (!trackTangibles && isWithinBounds(touch)) {
					initialPosition = { u: touch.u, v: touch.v };
					currentPosition = { u: touch.u, v: touch.v };
					isTracking = true;
					state.isActive = true;
				}
			},
			onPlaceTangible: (touch: TUIOTouch) => {
				if (trackTangibles && isWithinBounds(touch)) {
					initialPosition = { u: touch.u, v: touch.v };
					currentPosition = { u: touch.u, v: touch.v };
					isTracking = true;
					state.isActive = true;
				}
			},
			onMoveTangible: (touch: TUIOTouch) => {
				if (trackTangibles && isTracking && isWithinBounds(touch)) {
					currentPosition = { u: touch.u, v: touch.v };
					
					const delta = direction === 'y' 
						? currentPosition.v - initialPosition.v
						: currentPosition.u - initialPosition.u;
					
					updateState(delta);
				}
			},
			onRemoveTangible: (touch: TUIOTouch) => {
				if (trackTangibles && isTracking) {
					resetState();
				}
			},
			onTouchEnd: (touch: TUIOTouch) => {
				if (!trackTangibles && isTracking) {
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
		const { direction = 'y', sensitivity = 50, onPushPositive, onPushNegative, onRelease } = config;
		
		let isMouseDown = false;
		let startX = 0;
		let startY = 0;

		const handleMouseDown = (event: MouseEvent) => {
			isMouseDown = true;
			startX = event.clientX;
			startY = event.clientY;
		};

		const handleMouseMove = (event: MouseEvent) => {
			if (!isMouseDown) return;

			const deltaX = event.clientX - startX;
			const deltaY = event.clientY - startY;
			const delta = direction === 'y' ? deltaY : deltaX;

			if (Math.abs(delta) >= sensitivity) {
				if (delta > 0) {
					onPushPositive?.();
				} else {
					onPushNegative?.();
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