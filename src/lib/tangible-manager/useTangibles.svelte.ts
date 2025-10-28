import { getTangiblesManagerContext } from './context';

/**
 * Hook for accessing the tangible manager in the application.
 * Provides access to reactive tangible state and management operations.
 *
 * This hook connects to the TangiblesManager context which handles tangible
 * creation, removal, and flow calculations.
 *
 * @returns An object containing:
 *   - `manager`: The TangiblesManager instance for direct access
 *   - `tangibles`: Reactive array of all active tangible objects
 *   - `nodes`: Direct access to the $state.raw nodes array
 *   - `edges`: Direct access to the $state.raw edges array
 *   - `tangibleClassIds`: Reactive array of active tangible class IDs for calculations
 */
export function useTangibles() {
	const manager = getTangiblesManagerContext();

	return {
		manager,
		get tangibles() {
			return manager.tangibles;
		},
		get nodes() {
			return manager.nodes;
		},
		get edges() {
			return manager.edges;
		},
		get tangibleClassIds() {
			return manager.tangibleClassIds;
		}
	};
}
