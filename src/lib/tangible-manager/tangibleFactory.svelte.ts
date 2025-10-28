import type { TUIOTouch } from '$lib/types/TUIO';

/**
 * Factory class for creating reactive Tangible instances.
 *
 * This class provides a static method to generate a new Tangible object
 * with reactive state, based on a given classId and initial coordinates.
 */
export class TangibleFactory {
	/**
	 * Create a new reactive TUIOTouch instance.
	 *
	 * @param touch - The TUIO tangible to create.
	 */
	static create(touch: TUIOTouch): TUIOTouch {
		// Create reactive state properties
		return $state<TUIOTouch>({
			...touch
		});
	}
}
