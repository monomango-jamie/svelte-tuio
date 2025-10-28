<script lang="ts">
	import { setTangiblesManagerContext } from './context';
	import { TangiblesManager } from './TangiblesManager.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		tangiblesManager?: TangiblesManager;
	}

	let { children, tangiblesManager }: Props = $props();

	// Use provided manager or create a new one
	const manager = tangiblesManager || new TangiblesManager();

	setTangiblesManagerContext(manager);
</script>

{@render children?.()}
