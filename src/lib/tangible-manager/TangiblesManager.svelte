<script lang="ts" module>
	import { type TUIOTouch } from '$lib/types/TUIO';
	/**
	 * Manages tangibles in the UI.
	 * Tangibles (2Dobj) are physical objects that are placed at screen co-ordinates
	 * and prompt UI responses. Touch events (2Dcur) are not tracked by this manager.
	 * Websocket events are emitted from touchdesigner and received by the manager.
	 */
	export type TangibleNodeData = {
		tangible: TUIOTouch;
		position: { x: number; y: number };
		id: string;
		isDismounting?: boolean;
	};

	export class TangiblesManager {
		/** State tracking all active tangibles (2Dobj only). */
		public tangibles = $state<TUIOTouch[]>([]);
		/** State tracking only the class IDs of tangibles - for components that don't need position updates */
		public tangibleClassIds = $state<number[]>([]);
		/** Internal map for O(1) lookups by id (2Dobj only) */
		private tangiblesMap = new Map<number, TUIOTouch>();

		/**
		 * Creates, initializes, and executes a new tangible instance.
		 * If the tangible already exists, it will be updated instead.
		 * Only works for 2Dobj (tangibles) - 2Dcur (finger touches) are ignored.
		 * @param touch - TUIO touch data including id, u, and v coordinates
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
		 * Updates a tangible in the tangibles store.
		 * Optimized for high-frequency updates by directly mutating the reactive object.
		 * Only works for 2Dobj tangibles - 2Dcur events are filtered out.
		 * @param touch - TUIO touch data with updated u, v coordinates
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
