import type { TUIOTouch } from '../types/TUIO';
import { TangiblesManager } from '../tangible-manager/TangiblesManager.svelte';
type TouchEventListener = (touch: TUIOTouch) => void;
export interface TouchZone {
    id: string;
    u: number;
    v: number;
    normalisedWidth: number;
    normalisedHeight: number;
    onPlaceTangible?: TouchEventListener;
    onRemoveTangible?: TouchEventListener;
    onMoveTangible?: TouchEventListener;
    onTouchStart?: TouchEventListener;
    onTouchEnd?: TouchEventListener;
}
/**
 * Manages WebSocket connections for TUIO (Tangible User Interface Objects) events.
 * Handles touch start, end, and move events from a TUIO-compatible server.
 */
export declare class TUIOHandler {
    private socket;
    touchZones: TouchZone[];
    tangiblesManager: TangiblesManager;
    private simulateClick;
    /**
     * Creates a new TUIOHandler instance with an existing WebSocket connection.
     * Sets up event listeners for messages, connection status, and errors.
     * Automatically handles TUIO touch events by parsing incoming JSON data.
     *
     * @param {WebSocket} socket - The WebSocket instance to use for TUIO events
     * @param {function} simulateClick - Optional function to simulate clicks at coordinates
     */
    constructor(socket: WebSocket, simulateClick?: (u: number, v: number) => void);
    /**
     * Attaches event listeners to the existing WebSocket connection.
     * Sets up handlers for messages, connection status, and errors.
     * Automatically parses and routes TUIO events to appropriate handlers.
     *
     * @private
     */
    private addSocketEventListeners;
    /**
     * Closes the current WebSocket connection.
     */
    removeSocket(): void;
    /**
     * Handles finger touch end events from TUIO data (2Dcur profile).
     * Simulates a click at the touch coordinates.
     *
     * @param {TUIOTouch} touch - The touch event data containing position coordinates
     */
    handleFingerTouchEnd(touch: TUIOTouch): void;
    /**
     * Handles tangible placement events from TUIO data (2Dobj profile).
     * Adds the tangible to the tangibles manager.
     *
     * @param {TUIOTouch} touch - The touch event data for the placed tangible
     */
    handlePlaceTangible(touch: TUIOTouch): void;
    /**
     * Handles tangible removal events from TUIO data (2Dobj profile).
     * Removes the tangible from the tangibles manager.
     *
     * @param {TUIOTouch} touch - The touch event data for the removed tangible
     */
    handleRemoveTangible(touch: TUIOTouch): void;
    /**
     * Handles tangible movement events from TUIO data (2Dobj profile).
     * Updates the tangible's position and rotation in the tangibles manager.
     *
     * @param {TUIOTouch} touch - The touch event data for the moved tangible
     */
    handleMoveTangible(touch: TUIOTouch): void;
    /**
     * Gets the current WebSocket instance.
     *
     * @returns {WebSocket | null} The current WebSocket instance
     */
    getSocket(): WebSocket | null;
    /**
     * Checks if the WebSocket is currently connected and ready for communication.
     *
     * @returns {boolean} True if the socket is connected and in OPEN state, false otherwise
     */
    isSocketConnected(): boolean;
}
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
declare const TUIOHandler: $$__sveltets_2_IsomorphicComponent<Record<string, never>, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type TUIOHandler = InstanceType<typeof TUIOHandler>;
export default TUIOHandler;
