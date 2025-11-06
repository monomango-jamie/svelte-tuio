<script lang="ts">
	import { setTUIOHandler } from './context';
	import { TUIOHandler, type TUIOHandlerConfig } from './TUIOHandler.svelte';
	import type { SvelteSocket } from '@hardingjam/svelte-socket';

	interface TUIOProviderProps {
		children?: import('svelte').Snippet;
		svelteSocket: SvelteSocket;
		config?: Partial<Omit<TUIOHandlerConfig, 'svelteSocket'>>;
	}

	let { children, svelteSocket, config }: TUIOProviderProps = $props();
	const tuioHandler = new TUIOHandler({ svelteSocket, ...config });

	setTUIOHandler(tuioHandler);
</script>

{@render children?.()}
