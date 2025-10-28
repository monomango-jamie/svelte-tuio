<script lang="ts">
	import { setTUIOHandler } from './context';
	import { TUIOHandler } from './TUIOHandler.svelte';

	let { children, socket } = $props();
	const tuioHandler = new TUIOHandler(socket);
	setTUIOHandler(tuioHandler);
</script>

{@render children?.()}
