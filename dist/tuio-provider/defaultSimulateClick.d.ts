/**
 * Simulates a click event at normalized screen coordinates
 * Converts normalized u,v coordinates (0-1) to screen pixels and triggers a click on the element at that position
 * @param u - Normalized horizontal coordinate (0 = left edge, 1 = right edge)
 * @param v - Normalized vertical coordinate (0 = bottom edge, 1 = top edge)
 */
export default function defaultSimulateClick(u: number, v: number): void;
