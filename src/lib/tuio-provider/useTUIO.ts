import { getTUIOHandlerContext } from './context';
import type { TUIOHandler } from './TUIOHandler.svelte';

/**
 * Hook for accessing the TUIOHandler instance from Svelte context.
 * Must be called within a component that is a descendant of TUIOProvider.
 *
 * @returns {TUIOHandler} The TUIOHandler instance from context
 * @throws {Error} If called outside of a TUIOProvider context
 *
 * @example
 * ```svelte
 * <script>
 *   import { useTUIO } from 'svelte-tuio';
 *
 *   const tuioHandler = useTUIO();
 *   let tangibles = $derived(tuioHandler.tangiblesManager.tangibles);
 * </script>
 * ```
 */
export default function useTUIO(): TUIOHandler {
	const tuioHandler = getTUIOHandlerContext();

	return tuioHandler;
}
