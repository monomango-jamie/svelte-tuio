<script lang="ts">
	import { setTUIOHandler } from './context';
	import { TUIOHandler } from './TUIOHandler.svelte';

	let { children, socket, tuioHandler = new TUIOHandler({ socket }) } = $props();

	setTUIOHandler(tuioHandler);
</script>

{@render children?.()}
