<script lang="ts" module>
	import { type TUIOTouch } from '$lib/types/TUIO';
	/**
	 * Manages tangibles in the UI.
	 * Tangibles are objects that are placed at screen co-ordinates and prompt UI responses.
	 * Websocket events are emitted from touchdesigner and received by the manager.
	 */
	export type TangibleNodeData = {
		tangible: TUIOTouch;
		position: { x: number; y: number };
		id: string;
		isDismounting?: boolean;
	};

	export class TangiblesManager {
		/** State tracking all active tangibles. */
		public tangibles = $state<TUIOTouch[]>([]);
		/** State tracking only the class IDs - for components that don't need position updates */
		public tangibleClassIds = $state<number[]>([]);
		/** Internal map for O(1) lookups by classId */
		private tangiblesMap = new Map<number, TUIOTouch>();

		/**
		 * Creates, initializes, and executes a new tangible instance.
		 * If the tangible already exists, it will be updated instead.
		 * @param touch - TUIO touch data including classId, u, and v coordinates
		 */
		public addTangible(touch: TUIOTouch): void {
			// If tangible already exists, update it instead (O(1) lookup)
			if (this.tangiblesMap.has(touch.classId)) {
				this.updateTangible(touch);
				return;
			}

			// Create new reactive tangible
			const newTangible = $state<TUIOTouch>({
				...touch
			});
			
			// Add to map for fast lookups
			this.tangiblesMap.set(touch.classId, newTangible);
			
			// Add to arrays (these trigger reactivity)
			this.tangibles = [...this.tangibles, newTangible];
			this.tangibleClassIds = [...this.tangibleClassIds, touch.classId];
		}

		/**
		 * Removes a tangible from the tangibles store.
		 * @param classId - The classId of the tangible to remove.
		 */
		public removeTangible(classId: number): void {
			// If the tangible doesn't exist, return (O(1) lookup)
			if (!this.tangiblesMap.has(classId)) {
				return;
			}

			// Remove from map
			this.tangiblesMap.delete(classId);

			// Remove from arrays
			this.tangibleClassIds = this.tangibleClassIds.filter((id) => id !== classId);
			this.tangibles = this.tangibles.filter((tangible) => tangible.classId !== classId);
		}

		/**
		 * Updates a tangible in the tangibles store.
		 * Optimized for high-frequency updates by directly mutating the reactive object.
		 * @param touch - TUIO touch data with updated u, v coordinates
		 */
		public updateTangible(touch: TUIOTouch): void {
			// Get existing tangible (O(1) lookup)
			const existing = this.tangiblesMap.get(touch.classId);

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
