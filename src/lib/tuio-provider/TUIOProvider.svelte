<script lang="ts">
	import { onDestroy } from 'svelte';
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

	let handler: TUIOHandler;
	let ownsHandler = false;

	if (tuioHandler) {
		handler = tuioHandler;
	} else {
		if (!svelteSocket) {
			throw new Error('TUIOProvider requires either a tuioHandler prop or a svelteSocket prop');
		}
		handler = new TUIOHandler({ svelteSocket, ...config });
		ownsHandler = true;
	}

	setTUIOHandler(handler);

	// Clean up the handler if we created it
	onDestroy(() => {
		if (ownsHandler) {
			handler.destroy();
		}
	});
</script>

{@render children?.()}
