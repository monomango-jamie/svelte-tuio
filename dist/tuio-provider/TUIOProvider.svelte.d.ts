import { TUIOHandler, type TUIOHandlerConfig } from './TUIOHandler.svelte';
import type { SvelteSocket } from '@hardingjam/svelte-socket';
interface TUIOProviderProps {
    children?: import('svelte').Snippet;
    /** Pre-configured TUIOHandler instance. If provided, svelteSocket and config are ignored. */
    tuioHandler?: TUIOHandler;
    /** SvelteSocket instance. Required if tuioHandler is not provided. */
    svelteSocket?: SvelteSocket;
    /** Configuration for creating a TUIOHandler. Only used if tuioHandler is not provided. */
    config?: Partial<Omit<TUIOHandlerConfig, 'svelteSocket'>>;
}
declare const TUIOProvider: import("svelte").Component<TUIOProviderProps, {}, "">;
type TUIOProvider = ReturnType<typeof TUIOProvider>;
export default TUIOProvider;
