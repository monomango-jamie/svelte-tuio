<script lang="ts">
	import { setTUIOHandler } from './context';
	import { TUIOHandler } from './TUIOHandler.svelte';

	let { children, svelteSocket, tuioHandler = new TUIOHandler({ svelteSocket }) } = $props();

	setTUIOHandler(tuioHandler);
</script>

{@render children?.()}
