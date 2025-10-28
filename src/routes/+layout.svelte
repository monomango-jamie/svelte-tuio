<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import TUIOProvider from '$lib/tuio-provider/TUIOProvider.svelte';

	let { children } = $props();
	const socket = new WebSocket('ws://localhost:9980/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TUIOProvider socket={socket}>
{@render children?.()}
</TUIOProvider>
