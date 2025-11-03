<script lang="ts" module>
	import type { TUIOEvent, TUIOTouch } from '$lib/types/TUIO';
	import { TangiblesManager } from '$lib/tangible-manager/TangiblesManager.svelte';
	import defaultSimulateClick from '$lib/tuio-provider/defaultSimulateClick';

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
		socket: WebSocket;
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
		public socket: WebSocket;
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
			this.socket = config.socket;
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
			this.socket.addEventListener('message', (event: MessageEvent) => {
				const data: TUIOEvent = JSON.parse(event.data);

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

			this.socket.addEventListener('open', () => {
				console.log('🔌 Socket connected');
			});

			this.socket.addEventListener('error', (error) => {
				console.error('🔌 Socket error:', error);
			});

			return console.log('🔌 Socket created', this.socket);
		}

		/**
		 * Closes the current WebSocket connection.
		 */
		public removeSocket(): void {
			if (this.socket) {
				console.log('🔌 Closing socket connection');
				this.socket.close();
			}
			return;
		}

		/**
		 * Handles finger touch start events from TUIO data (2Dcur profile).
		 * Calls the custom callback if provided, otherwise does nothing by default.
		 *
		 * @param {TUIOTouch} touch - The touch event data containing position coordinates
		 */
		public handleFingerTouchStart(touch: TUIOTouch): void {
			this.onFingerTouchStart(touch.u, touch.v);
		}

		/**
		 * Handles finger touch end events from TUIO data (2Dcur profile).
		 * Simulates a click at the touch coordinates by default.
		 *
		 * @param {TUIOTouch} touch - The touch event data containing position coordinates
		 */
		public handleFingerTouchEnd(touch: TUIOTouch): void {
			this.onFingerTouchEnd(touch.u, touch.v);
		}

		/**
		 * Handles tangible placement events from TUIO data (2Dobj profile).
		 * Adds the tangible to the tangibles manager and calls custom callback if provided.
		 *
		 * @param {TUIOTouch} touch - The touch event data for the placed tangible
		 */
		public handlePlaceTangible(touch: TUIOTouch): void {
			if (this.tangiblesManager) {
				this.tangiblesManager.addTangible(touch);
			}
			if (this.onPlaceTangible) {
				this.onPlaceTangible(touch);
			}
		}

		/**
		 * Handles tangible removal events from TUIO data (2Dobj profile).
		 * Removes the tangible from the tangibles manager and calls custom callback if provided.
		 *
		 * @param {TUIOTouch} touch - The touch event data for the removed tangible
		 */
		public handleRemoveTangible(touch: TUIOTouch): void {
			if (this.tangiblesManager) {
				this.tangiblesManager.removeTangible(touch.classId);
			}
			if (this.onRemoveTangible) {
				this.onRemoveTangible(touch);
			}
		}

		/**
		 * Handles tangible movement events from TUIO data (2Dobj profile).
		 * Updates the tangible's position and rotation in the tangibles manager and calls custom callback if provided.
		 *
		 * @param {TUIOTouch} touch - The touch event data for the moved tangible
		 */
		public handleMoveTangible(touch: TUIOTouch): void {
			if (this.tangiblesManager) {
				this.tangiblesManager.updateTangible(touch);
			}
			if (this.onMoveTangible) {
				this.onMoveTangible(touch);
			}
		}

		/**
		 * Gets the current WebSocket instance.
		 *
		 * @returns {WebSocket | null} The current WebSocket instance
		 */
		public getSocket(): WebSocket | null {
			return this.socket;
		}

		/**
		 * Checks if the WebSocket is currently connected and ready for communication.
		 *
		 * @returns {boolean} True if the socket is connected and in OPEN state, false otherwise
		 */
		public isSocketConnected(): boolean {
			return this.socket?.readyState === WebSocket.OPEN;
		}
	}
</script>
