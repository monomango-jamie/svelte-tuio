/**
 * Simulates a click event at normalized screen coordinates
 * Converts normalized u,v coordinates (0-1) to screen pixels and triggers a click on the element at that position
 * @param u - Normalized horizontal coordinate (0 = left edge, 1 = right edge)
 * @param v - Normalized vertical coordinate (0 = bottom edge, 1 = top edge)
 */
export default function defaultSimulateClick(u: number, v: number) {
	const x = u * window.innerWidth;
	const y = (1 - v) * window.innerHeight;
	const element = document.elementFromPoint(x, y);
	if (element) {
		try {
			(element as HTMLElement).click();
		} catch {
			console.error('Failed to click on element');
		}
	}
}
