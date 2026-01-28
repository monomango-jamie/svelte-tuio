/**
 * Simulates a click event at normalized screen coordinates.
 * Converts normalized u,v coordinates (0-1) to screen pixels and triggers a click on the element at that position.
 * @param u - Normalized horizontal coordinate (0 = left edge, 1 = right edge)
 * @param v - Normalized vertical coordinate (0 = bottom edge, 1 = top edge)
 */
export default function defaultSimulateClick(u: number, v: number) {
	// SSR safety - skip if not in browser
	if (typeof window === 'undefined') {
		return;
	}

	// Validate coordinates are in expected range
	if (u < 0 || u > 1 || v < 0 || v > 1) {
		console.warn(`defaultSimulateClick: coordinates out of range (u=${u}, v=${v})`);
		return;
	}

	const x = u * window.innerWidth;
	const y = (1 - v) * window.innerHeight;
	const element = document.elementFromPoint(x, y);

	if (element && element instanceof HTMLElement) {
		try {
			element.click();
		} catch {
			console.error('Failed to click on element');
		}
	}
}
