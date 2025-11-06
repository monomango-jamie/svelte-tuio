<script lang="ts" module>
	import type { TUIOEvent, TUIOTouch } from '$lib/types/TUIO';
	import { TangiblesManager } from '$lib/tangible-manager/TangiblesManager.svelte';
	import defaultSimulateClick from '$lib/tuio-provider/defaultSimulateClick';
	import type { SvelteSocket } from '@hardingjam/svelte-socket';

	type TouchEventListener = (touch: TUIOTouch) => void;

	/* The touch zone is the area of the screen that is used to detect touches. */
	export interface TouchZone {
		/* The id is the name given of the touch zone. Usually the kebab-cased name of the component. */
		id: string;
		/* The u and v are the coordinates of the touch zone on the screen. */
		u: number;
		v: number;
		/* The normalisedWidth and normalisedHeight are the width and height of the touch zone as a percentage of the screen. */
		normalisedWidth: number;
		normalisedHeight: number;
		/* The onPlaceTangible is the function that is called when a tangible is placed on the touch zone. */
		onPlaceTangible?: TouchEventListener;
		/* The onRemoveTangible is the function that is called when a tangible is removed from the touch zone. */
		onRemoveTangible?: TouchEventListener;
		/* The onMoveTangible is the function that is called when a tangible is moved in the touch zone. */
		onMoveTangible?: TouchEventListener;
		/* The onTouchStart is the function that is called when a finger touch starts in the touch zone. */
		onTouchStart?: TouchEventListener;
		/* The onTouchMove is the function that is called when a finger touch moves in the touch zone. */
		onTouchMove?: TouchEventListener;
		/* The onTouchEnd is the function that is called when a finger touch ends in the touch zone. */
		onTouchEnd?: TouchEventListener;
	}

	export interface TUIOHandlerConfig {
		svelteSocket: SvelteSocket;
		onFingerTouchEnd?: (u: number, v: number) => void;
		onFingerTouchStart?: (u: number, v: number) => void;
		onPlaceTangible?: (touch: TUIOTouch) => void;
		onRemoveTangible?: (touch: TUIOTouch) => void;
		onMoveTangible?: (touch: TUIOTouch) => void;
		/** Minimum time in milliseconds between callback invocations (throttling) */
		debounceTime?: number;
	}

	/**
	 * Manages WebSocket connections for TUIO (Tangible User Interface Objects) events.
	 * Handles touch start, end, and move events from a TUIO-compatible server.
	 */
	export class TUIOHandler {
		public svelteSocket: SvelteSocket;
		public touchZones = $state<TouchZone[]>([]);
		public tangiblesManager: TangiblesManager;
		private onFingerTouchEnd: (u: number, v: number) => void;
		private onFingerTouchStart: (u: number, v: number) => void;
		private onPlaceTangible?: (touch: TUIOTouch) => void;
		private onRemoveTangible?: (touch: TUIOTouch) => void;
		private onMoveTangible?: (touch: TUIOTouch) => void;
		private debounceTime: number;
		private lastCallTimes: Map<string, number> = new Map();

		/**
		 * Creates a new TUIOHandler instance with an existing WebSocket connection.
		 * Sets up event listeners for messages, connection status, and errors.
		 * Automatically handles TUIO touch events by parsing incoming JSON data.
		 *
		 * @param {TUIOHandlerConfig} config - Configuration object with socket and optional event handlers
		 */
		constructor(config: TUIOHandlerConfig) {
			this.tangiblesManager = new TangiblesManager();
			this.svelteSocket = config.svelteSocket;
			this.onFingerTouchEnd = config.onFingerTouchEnd || defaultSimulateClick;
			this.onFingerTouchStart = config.onFingerTouchStart || (() => {});
			this.onPlaceTangible = config.onPlaceTangible;
			this.onRemoveTangible = config.onRemoveTangible;
			this.onMoveTangible = config.onMoveTangible;
			this.debounceTime = config.debounceTime || 0;
			this.addSocketEventListeners();
		}

		/**
		 * Checks if enough time has passed since the last call to allow this callback.
		 * @param key - Unique key for the callback being throttled
		 * @returns true if the callback should be called, false if throttled
		 * @private
		 */
		private shouldCallCallback(key: string): boolean {
			if (this.debounceTime === 0) return true;

			const now = Date.now();
			const lastCall = this.lastCallTimes.get(key);

			if (!lastCall || now - lastCall >= this.debounceTime) {
				this.lastCallTimes.set(key, now);
				return true;
			}

			return false;
		}

		/**
		 * Attaches event listeners to the existing WebSocket connection.
		 * Sets up handlers for messages, connection status, and errors.
		 * Automatically parses and routes TUIO events to appropriate handlers.
		 *
		 * @private
		 */
		private addSocketEventListeners(): void {
			this.svelteSocket.addEventListener('message', (event: Event) => {
				const data: TUIOEvent = JSON.parse((event as MessageEvent).data);

				if (data.touchesStart && data.touchesStart.length > 0) {
					data.touchesStart.forEach((touch: TUIOTouch) => {
						if (touch.profile === '2Dobj') {
							this.handlePlaceTangible(touch);
						} else if (touch.profile === '2Dcur') {
							this.handleFingerTouchStart(touch);
						}
					});
				}

				if (data.touchesEnd && data.touchesEnd.length > 0) {
					data.touchesEnd.forEach((touch: TUIOTouch) => {
						if (touch.profile === '2Dobj') {
							this.handleRemoveTangible(touch);
						} else if (touch.profile === '2Dcur') {
							this.handleFingerTouchEnd(touch);
						}
					});
				}

				if (data.touchesMove && data.touchesMove.length > 0) {
					data.touchesMove.forEach((touch: TUIOTouch) => {
						if (touch.profile === '2Dobj') {
							this.handleMoveTangible(touch);
						} else if (touch.profile === '2Dcur') {
							this.handleFingerTouchMove(touch);
						}
					});
				}
			});

			this.svelteSocket.addEventListener('open', () => {
				console.log('🔌 Socket connected');
			});

			this.svelteSocket.addEventListener('error', (error) => {
				console.error('🔌 Socket error:', error);
			});

			console.log('🔌 Socket created', this.svelteSocket);
		}

		/**
		 * Registers a touch zone for tracking touch/tangible events in a specific screen region.
		 * Touch zones are user-managed - you must implement your own hit detection logic.
		 *
		 * @param {TouchZone} zone - The touch zone configuration
		 */
		public registerTouchZone(zone: TouchZone): void {
			this.touchZones.push(zone);
		}

		/**
		 * Removes a touch zone by its ID.
		 *
		 * @param {string} zoneId - The ID of the zone to remove
		 */
		public unregisterTouchZone(zoneId: string): void {
			this.touchZones = this.touchZones.filter((zone) => zone.id !== zoneId);
		}

		/**
		 * Handles finger touch start events from TUIO data (2Dcur profile).
		 * Adds the touch to the tangibles manager and calls custom callback if provided.
		 *
		 * @param {TUIOTouch} touch - The touch event data containing position coordinates
		 * @private
		 */
		private handleFingerTouchStart(touch: TUIOTouch): void {
			// Add finger touch to tangibles manager
			this.tangiblesManager.addTangible(touch);

			if (this.shouldCallCallback('fingerTouchStart')) {
				this.onFingerTouchStart(touch.u, touch.v);
			}
			// Also notify touch zones
			this.touchZones.forEach((zone) => {
				if (zone.onTouchStart && this.isTouchInZone(touch, zone)) {
					zone.onTouchStart(touch);
				}
			});
		}

		/**
		 * Handles finger touch move events from TUIO data (2Dcur profile).
		 * Updates the touch position in the tangibles manager and notifies touch zones.
		 *
		 * @param {TUIOTouch} touch - The touch event data containing position coordinates
		 * @private
		 */
		private handleFingerTouchMove(touch: TUIOTouch): void {
			// Update finger touch in tangibles manager
			this.tangiblesManager.updateTangible(touch);

			this.touchZones.forEach((zone) => {
				if (zone.onTouchMove && this.isTouchInZone(touch, zone)) {
					zone.onTouchMove(touch);
				}
			});
		}

		/**
		 * Handles finger touch end events from TUIO data (2Dcur profile).
		 * Removes the touch from the tangibles manager and simulates a click at the touch coordinates by default.
		 *
		 * @param {TUIOTouch} touch - The touch event data containing position coordinates
		 * @private
		 */
		private handleFingerTouchEnd(touch: TUIOTouch): void {
			// Remove finger touch from tangibles manager
			this.tangiblesManager.removeTangible(touch.id);

			if (this.shouldCallCallback('fingerTouchEnd')) {
				this.onFingerTouchEnd(touch.u, touch.v);
			}
			// Also notify touch zones
			this.touchZones.forEach((zone) => {
				if (zone.onTouchEnd && this.isTouchInZone(touch, zone)) {
					zone.onTouchEnd(touch);
				}
			});
		}

		/**
		 * Checks if a touch is within a zone's bounds.
		 * Inverts v-coordinate because TUIO uses 0 at bottom, 1 at top,
		 * while screen coordinates use 0 at top, 1 at bottom.
		 *
		 * @param {TUIOTouch} touch - The touch to check
		 * @param {TouchZone} zone - The zone to check against
		 * @returns {boolean} True if the touch is within the zone
		 * @private
		 */
		private isTouchInZone(touch: TUIOTouch, zone: TouchZone): boolean {
			// Invert v-coordinate for TUIO system (0 at bottom, 1 at top)
			const invertedTouchV = 1 - touch.v;
			const invertedZoneV = 1 - zone.v;

			return (
				touch.u >= zone.u &&
				touch.u <= zone.u + zone.normalisedWidth &&
				invertedTouchV >= invertedZoneV &&
				invertedTouchV <= invertedZoneV + zone.normalisedHeight
			);
		}

		/**
		 * Handles tangible placement events from TUIO data (2Dobj profile).
		 * Adds the tangible to the tangibles manager and calls custom callback if provided.
		 *
		 * @param {TUIOTouch} touch - The touch event data for the placed tangible
		 * @private
		 */
		private handlePlaceTangible(touch: TUIOTouch): void {
			this.tangiblesManager.addTangible(touch);
			if (this.onPlaceTangible && this.shouldCallCallback(`placeTangible-${touch.classId}`)) {
				this.onPlaceTangible(touch);
			}
		}

		/**
		 * Handles tangible removal events from TUIO data (2Dobj profile).
		 * Removes the tangible from the tangibles manager and calls custom callback if provided.
		 *
		 * @param {TUIOTouch} touch - The touch event data for the removed tangible
		 * @private
		 */
		private handleRemoveTangible(touch: TUIOTouch): void {
			this.tangiblesManager.removeTangible(touch.id);
			if (this.onRemoveTangible && this.shouldCallCallback(`removeTangible-${touch.classId}`)) {
				this.onRemoveTangible(touch);
			}
		}

		/**
		 * Handles tangible movement events from TUIO data (2Dobj profile).
		 * Updates the tangible's position and rotation in the tangibles manager and calls custom callback if provided.
		 *
		 * @param {TUIOTouch} touch - The touch event data for the moved tangible
		 * @private
		 */
		private handleMoveTangible(touch: TUIOTouch): void {
			this.tangiblesManager.updateTangible(touch);
			if (this.onMoveTangible && this.shouldCallCallback(`moveTangible-${touch.classId}`)) {
				this.onMoveTangible(touch);
			}
		}
	}
</script>
