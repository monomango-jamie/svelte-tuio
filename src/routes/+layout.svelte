<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import TUIOProvider from '$lib/tuio-provider/TUIOProvider.svelte';
	import { SvelteSocket } from '@hardingjam/svelte-socket';
	
	let { children } = $props();
	const svelteSocket = new SvelteSocket({ url: 'ws://localhost:9980/' });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TUIOProvider {svelteSocket}>
	{@render children?.()}
</TUIOProvider>
