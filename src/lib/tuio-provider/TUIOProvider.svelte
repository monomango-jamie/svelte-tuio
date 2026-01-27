<script lang="ts">
	import { setTUIOHandler } from './context';
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

	let { children, tuioHandler, svelteSocket, config }: TUIOProviderProps = $props();
	
	const handler = tuioHandler ?? (() => {
		if (!svelteSocket) {
			throw new Error('TUIOProvider requires either a tuioHandler prop or a svelteSocket prop');
		}
		return new TUIOHandler({ svelteSocket, ...config });
	})();

	setTUIOHandler(handler);
</script>

{@render children?.()}
