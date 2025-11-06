import { type TUIOTouch } from '../types/TUIO';
/**
 * Manages tangibles and touches in the UI.
 * Tangibles (2Dobj) are physical objects and touches (2Dcur) are finger touches
 * that are placed at screen co-ordinates and prompt UI responses.
 * Websocket events are emitted from touchdesigner and received by the manager.
 */
export type TangibleNodeData = {
    tangible: TUIOTouch;
    position: {
        x: number;
        y: number;
    };
    id: string;
    isDismounting?: boolean;
};
export declare class TangiblesManager {
    /** State tracking all active tangibles and touches. */
    tangibles: TUIOTouch[];
    /** State tracking only the class IDs of 2Dobj tangibles - for components that don't need position updates */
    tangibleClassIds: number[];
    /** Internal map for O(1) lookups by id (works for both 2Dobj and 2Dcur) */
    private tangiblesMap;
    /**
     * Creates, initializes, and executes a new tangible/touch instance.
     * If the tangible already exists, it will be updated instead.
     * Works for both 2Dobj (tangibles) and 2Dcur (finger touches).
     * @param touch - TUIO touch data including id, u, and v coordinates
     */
    addTangible(touch: TUIOTouch): void;
    /**
     * Removes a tangible/touch from the tangibles store.
     * Works for both 2Dobj (using classId or id) and 2Dcur (using id).
     * @param idOrClassId - The id or classId of the tangible/touch to remove.
     */
    removeTangible(idOrClassId: number): void;
    /**
     * Updates a tangible/touch in the tangibles store.
     * Optimized for high-frequency updates by directly mutating the reactive object.
     * Works for both 2Dobj (tangibles) and 2Dcur (finger touches).
     * @param touch - TUIO touch data with updated u, v coordinates
     */
    updateTangible(touch: TUIOTouch): void;
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
declare const TangiblesManager: $$__sveltets_2_IsomorphicComponent<Record<string, never>, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type TangiblesManager = InstanceType<typeof TangiblesManager>;
export default TangiblesManager;
