import { getContext, setContext } from 'svelte';
import { TangiblesManager } from './TangiblesManager.svelte';

/**
 * The context key used to store and retrieve the TangiblesManager instance
 */
export const TANGIBLES_MANAGER_CONTEXT_KEY = 'monomango:tangiblesManager';

/**
 * Sets the TangiblesManager instance in Svelte's context
 *
 * @param {TangiblesManager} manager - The TangiblesManager instance to store in context
 * @returns {void}
 */
export function setTangiblesManagerContext(manager: TangiblesManager) {
	setContext(TANGIBLES_MANAGER_CONTEXT_KEY, manager);
}

/**
 * Retrieves the TangiblesManager instance from Svelte's context
 *
 * @returns {TangiblesManager} The TangiblesManager instance
 * @throws {Error} If no TangiblesManager is found in context
 */
export function getTangiblesManagerContext(): TangiblesManager {
	const manager = getContext<TangiblesManager | undefined>(TANGIBLES_MANAGER_CONTEXT_KEY);
	if (!manager) {
		throw new Error('TangiblesManager not found. Did you forget to setTangiblesManagerContext?');
	}
	return manager;
}
