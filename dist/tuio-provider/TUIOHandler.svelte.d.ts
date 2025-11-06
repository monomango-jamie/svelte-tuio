import type { TUIOTouch } from '../types/TUIO';
import { TangiblesManager } from '../tangible-manager/TangiblesManager.svelte';
import type { SvelteSocket } from '@hardingjam/svelte-socket';
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
export declare class TUIOHandler {
    svelteSocket: SvelteSocket;
    touchZones: TouchZone[];
    tangiblesManager: TangiblesManager;
    private onFingerTouchEnd;
    private onFingerTouchStart;
    private onPlaceTangible?;
    private onRemoveTangible?;
    private onMoveTangible?;
    private debounceTime;
    private lastCallTimes;
    /**
     * Creates a new TUIOHandler instance with an existing WebSocket connection.
     * Sets up event listeners for messages, connection status, and errors.
     * Automatically handles TUIO touch events by parsing incoming JSON data.
     *
     * @param {TUIOHandlerConfig} config - Configuration object with socket and optional event handlers
     */
    constructor(config: TUIOHandlerConfig);
    /**
     * Checks if enough time has passed since the last call to allow this callback.
     * @param key - Unique key for the callback being throttled
     * @returns true if the callback should be called, false if throttled
     * @private
     */
    private shouldCallCallback;
    /**
     * Attaches event listeners to the existing WebSocket connection.
     * Sets up handlers for messages, connection status, and errors.
     * Automatically parses and routes TUIO events to appropriate handlers.
     *
     * @private
     */
    private addSocketEventListeners;
    /**
     * Registers a touch zone for tracking touch/tangible events in a specific screen region.
     * Touch zones are user-managed - you must implement your own hit detection logic.
     *
     * @param {TouchZone} zone - The touch zone configuration
     */
    registerTouchZone(zone: TouchZone): void;
    /**
     * Removes a touch zone by its ID.
     *
     * @param {string} zoneId - The ID of the zone to remove
     */
    unregisterTouchZone(zoneId: string): void;
    /**
     * Handles finger touch start events from TUIO data (2Dcur profile).
     * Calls the custom callback if provided, otherwise does nothing by default.
     *
     * @param {TUIOTouch} touch - The touch event data containing position coordinates
     * @private
     */
    private handleFingerTouchStart;
    /**
     * Handles finger touch end events from TUIO data (2Dcur profile).
     * Simulates a click at the touch coordinates by default.
     *
     * @param {TUIOTouch} touch - The touch event data containing position coordinates
     * @private
     */
    private handleFingerTouchEnd;
    /**
     * Handles tangible placement events from TUIO data (2Dobj profile).
     * Adds the tangible to the tangibles manager and calls custom callback if provided.
     *
     * @param {TUIOTouch} touch - The touch event data for the placed tangible
     * @private
     */
    private handlePlaceTangible;
    /**
     * Handles tangible removal events from TUIO data (2Dobj profile).
     * Removes the tangible from the tangibles manager and calls custom callback if provided.
     *
     * @param {TUIOTouch} touch - The touch event data for the removed tangible
     * @private
     */
    private handleRemoveTangible;
    /**
     * Handles tangible movement events from TUIO data (2Dobj profile).
     * Updates the tangible's position and rotation in the tangibles manager and calls custom callback if provided.
     *
     * @param {TUIOTouch} touch - The touch event data for the moved tangible
     * @private
     */
    private handleMoveTangible;
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
