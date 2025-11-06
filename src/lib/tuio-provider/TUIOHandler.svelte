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
		/* The onTouchStart is the function that is called when a touch starts in the touch zone. */
		onTouchStart?: TouchEventListener;
		/* The onTouchEnd is the function that is called when a touch ends in the touch zone. */
		onTouchEnd?: TouchEventListener;
	}

	export interface TUIOHandlerConfig {
		svelteSocket: SvelteSocket;
		onFingerTouchEnd?: (u: number, v: number) => void;
		onFingerTouchStart?: (u: number, v: number) => void;
		onPlaceTangible?: (touch: TUIOTouch) => void;
		onRemoveTangible?: (touch: TUIOTouch) => void;
		onMoveTangible?: (touch: TUIOTouch) => void;
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
			this.addSocketEventListeners();
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

		return console.log('🔌 Socket created', this.svelteSocket);
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
	 * Calls the custom callback if provided, otherwise does nothing by default.
	 *
	 * @param {TUIOTouch} touch - The touch event data containing position coordinates
	 * @private
	 */
	private handleFingerTouchStart(touch: TUIOTouch): void {
		this.onFingerTouchStart(touch.u, touch.v);
	}

	/**
	 * Handles finger touch end events from TUIO data (2Dcur profile).
	 * Simulates a click at the touch coordinates by default.
	 *
	 * @param {TUIOTouch} touch - The touch event data containing position coordinates
	 * @private
	 */
	private handleFingerTouchEnd(touch: TUIOTouch): void {
		this.onFingerTouchEnd(touch.u, touch.v);
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
		if (this.onPlaceTangible) {
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
		this.tangiblesManager.removeTangible(touch.classId);
		if (this.onRemoveTangible) {
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
		if (this.onMoveTangible) {
			this.onMoveTangible(touch);
		}
	}
	}
</script>
