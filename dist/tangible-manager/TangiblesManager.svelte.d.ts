import { type TUIOTouch } from '../types/TUIO';
/**
 * Manages tangibles in the UI.
 * Tangibles are objects that are placed at screen co-ordinates and prompt UI responses.
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
    /** State tracking all active tangibles. */
    tangibles: TUIOTouch[];
    /** State tracking only the class IDs - for components that don't need position updates */
    tangibleClassIds: number[];
    /** Internal map for O(1) lookups by classId */
    private tangiblesMap;
    /**
     * Creates, initializes, and executes a new tangible instance.
     * If the tangible already exists, it will be updated instead.
     * @param touch - TUIO touch data including classId, u, and v coordinates
     */
    addTangible(touch: TUIOTouch): void;
    /**
     * Removes a tangible from the tangibles store.
     * @param classId - The classId of the tangible to remove.
     */
    removeTangible(classId: number): void;
    /**
     * Updates a tangible in the tangibles store.
     * Optimized for high-frequency updates by directly mutating the reactive object.
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
