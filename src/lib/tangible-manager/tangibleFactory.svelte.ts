import type { TUIOTouch } from '$lib/types/TUIO';
import type { Tangible } from '../types/tangible';
import { possibleTangibles, type TangibleGuiInfo } from '../types/tangible';

/**
 * Factory class for creating reactive Tangible instances.
 *
 * This class provides a static method to generate a new Tangible object
 * with reactive state, based on a given classId and initial coordinates.
 */
export class TangibleFactory {
	/**
	 * Create a new reactive Tangible instance.
	 *
	 * @param classId - The class ID of the tangible to create.
	 * @param u - The initial X coordinate (normalized, 0-1).
	 * @param v - The initial Y coordinate (normalized, 0-1).
	 * @returns A new Tangible instance with reactive state.
	 * @throws {Error} If the classId does not correspond to a known tangible.
	 */
	static create(touch: TUIOTouch): TUIOTouch {
		
		// Create reactive state properties
		return $state<TUIOTouch>({
			...touch
		});
	}
}
