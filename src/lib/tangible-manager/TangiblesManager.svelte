<script lang="ts" module>
	import { type TUIOTouch } from '$lib/types/TUIO';

	/**
	 * Represents the data structure for a tangible node in the UI.
	 * Used for tracking tangible objects with their screen positions and lifecycle state.
	 */
	export type TangibleNodeData = {
		/** The TUIO touch data for the tangible */
		tangible: TUIOTouch;
		/** Screen position in pixels */
		position: { x: number; y: number };
		/** Unique identifier for the node */
		id: string;
		/** Whether the tangible is in the process of being removed */
		isDismounting?: boolean;
	};

	/**
	 * Manages tangible objects (2Dobj profile) with reactive state.
	 * Touch events (2Dcur profile) are not tracked by this manager.
	 *
	 * @example
	 * const manager = tuioHandler.tangiblesManager;
	 * let tangibles = $derived(manager.tangibles);
	 * let hasSpecificTangible = $derived(manager.tangibleClassIds.includes(14));
	 */
	export class TangiblesManager {
		/**
		 * Reactive array of all active tangible objects (2Dobj profile only).
		 * Use with `$derived` for reactive access in Svelte components.
		 */
		public tangibles = $state<TUIOTouch[]>([]);
		/**
		 * Reactive array of class IDs for all active tangibles.
		 * Use for presence checks without position data.
		 */
		public tangibleClassIds = $state<number[]>([]);
		/** Internal map for O(1) lookups by id (2Dobj only) */
		private tangiblesMap = new Map<number, TUIOTouch>();

		/**
		 * Adds a tangible to the store. Updates if it already exists.
		 * Only processes 2Dobj profile; 2Dcur is ignored.
		 * @param touch - TUIO touch data
		 */
		public addTangible(touch: TUIOTouch): void {
			// Only add 2Dobj tangibles, not 2Dcur touches
			if (touch.profile !== '2Dobj') {
				return;
			}

			// If tangible already exists, update it instead (O(1) lookup using id)
			if (this.tangiblesMap.has(touch.id)) {
				this.updateTangible(touch);
				return;
			}

			// Create new reactive tangible
			const newTangible = $state<TUIOTouch>({
				...touch
			});

			// Add to map for fast lookups (using id as key)
			this.tangiblesMap.set(touch.id, newTangible);

			// Add to arrays (these trigger reactivity)
			this.tangibles = [...this.tangibles, newTangible];
			this.tangibleClassIds = [...this.tangibleClassIds, touch.classId];
		}

		/**
		 * Removes a tangible from the tangibles store.
		 * Only works for 2Dobj tangibles.
		 * @param idOrClassId - The id or classId of the tangible to remove.
		 */
		public removeTangible(idOrClassId: number): void {
			// If the tangible doesn't exist, return (O(1) lookup)
			if (!this.tangiblesMap.has(idOrClassId)) {
				return;
			}

			// Get the touch to check its profile before removing
			const touch = this.tangiblesMap.get(idOrClassId);

			// Remove from map
			this.tangiblesMap.delete(idOrClassId);

			// Remove from arrays
			this.tangibles = this.tangibles.filter((tangible) => tangible.id !== idOrClassId);

			// Only remove from classIds if it's a 2Dobj tangible
			if (touch && touch.profile === '2Dobj') {
				this.tangibleClassIds = this.tangibleClassIds.filter((id) => id !== touch.classId);
			}
		}

		/**
		 * Updates a tangible in the store. Adds if it doesn't exist.
		 * Mutates the reactive object directly for high-frequency updates.
		 * @param touch - TUIO touch data with updated coordinates
		 */
		public updateTangible(touch: TUIOTouch): void {
			// Get existing tangible (O(1) lookup using id)
			const existing = this.tangiblesMap.get(touch.id);

			// If the tangible doesn't exist, add it
			if (!existing) {
				this.addTangible(touch);
				return;
			}

			// Directly mutate the reactive object instead of recreating the array
			// This is much faster for high-frequency updates and Svelte 5's fine-grained
			// reactivity will track individual property changes
			Object.assign(existing, touch);
		}
	}
</script>
