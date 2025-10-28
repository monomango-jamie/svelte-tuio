<script lang="ts" module>
	import { type TUIOTouch } from '$lib/types/TUIO';
	import { TangibleFactory } from '$lib/tangible-manager/tangibleFactory.svelte';

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

		/**
		 * Retrieves the tangibles array.
		 * @returns The tangibles array.
		 */
		public getTangibles(): TUIOTouch[] {
			return this.tangibles;
		}

		/**
		 * Creates, initializes, and executes a new tangible instance.
		 * @param touch - TUIO touch data including classId, u, and v coordinates
		 * @returns A void promise that updates the tangibles store.
		 */
		public async addTangible(touch: TUIOTouch): Promise<void> {
			if (this.tangibleClassIds.includes(touch.classId)) {
				return;
			}

			// Check if tangible already exists
			if (this.tangibleClassIds.includes(touch.classId)) {
				// Tangible already exists, just update it
				this.updateTangible(touch);
				return;
			}

			// Create new tangible only if it doesn't exist
			const newTangible = TangibleFactory.create(touch);
			this.tangibles = [...this.tangibles, newTangible];
			this.tangibleClassIds = [...this.tangibleClassIds, touch.classId];
		}

		/**
		 * Removes a tangible from the tangibles store with conditional animation.
		 * @param classId - The classId of the tangible to remove.
		 */
		public removeTangible(classId: number): void {
			// If the tangible classID doesn't exist in the tangibles array, return
			if (!this.tangibleClassIds.includes(classId)) {
				return;
			}

			this.tangibleClassIds = this.tangibleClassIds.filter((id) => id !== classId);
			this.tangibles = this.tangibles.filter((tangible) => tangible.classId !== classId);
		}

		/**
		 * Updates a tangible in the tangibles store.
		 * @param touch - TUIO touch data with updated u, v coordinates
		 */
		public updateTangible(touch: TUIOTouch): void {
			// If the tangible doesn't exist, add it
			if (!this.tangibleClassIds.includes(touch.classId)) {
				this.addTangible(touch);
				return;
			}
			// Otherwise, update the tangible's position
			this.tangibles = this.tangibles.map((tangible) =>
				tangible.classId === touch.classId ? { ...tangible, ...touch } : tangible
			);
		}
	}
</script>
