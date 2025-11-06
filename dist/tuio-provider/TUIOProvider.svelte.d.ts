import { type TUIOHandlerConfig } from './TUIOHandler.svelte';
import type { SvelteSocket } from '@hardingjam/svelte-socket';
interface TUIOProviderProps {
    children?: import('svelte').Snippet;
    svelteSocket: SvelteSocket;
    config?: Partial<Omit<TUIOHandlerConfig, 'svelteSocket'>>;
}
declare const TUIOProvider: import("svelte").Component<TUIOProviderProps, {}, "">;
type TUIOProvider = ReturnType<typeof TUIOProvider>;
export default TUIOProvider;
