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
    /**
     * Retrieves the tangibles array.
     * @returns The tangibles array.
     */
    getTangibles(): TUIOTouch[];
    /**
     * Creates, initializes, and executes a new tangible instance.
     * @param touch - TUIO touch data including classId, u, and v coordinates
     * @returns A void promise that updates the tangibles store.
     */
    addTangible(touch: TUIOTouch): Promise<void>;
    /**
     * Removes a tangible from the tangibles store with conditional animation.
     * @param classId - The classId of the tangible to remove.
     */
    removeTangible(classId: number): void;
    /**
     * Updates a tangible in the tangibles store.
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
