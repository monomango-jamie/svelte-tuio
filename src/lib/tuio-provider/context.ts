import { getContext, setContext } from 'svelte';
import type { TUIOHandler } from './TUIOHandler.svelte';

/**
 * The context key used to store and retrieve the TUIOHandler instance
 */
export const TUIO_SOCKET_CONTEXT_KEY = 'monomango:TUIOHandler';

/**
 * Sets the TUIOHandler instance in Svelte's context
 *
 * @param {TUIOHandler} socket - The TUIOHandler instance to store in context
 * @returns {void}
 */
export function setSocket(socket: TUIOHandler) {
	setContext(TUIO_SOCKET_CONTEXT_KEY, socket);
}

/**
 * Retrieves the TUIOHandler instance from Svelte's context
 *
 * @returns {TUIOHandler} The TUIOHandler instance
 * @throws {Error} If no TUIOHandler is found in context
 */
export function getSocketContext(): TUIOHandler {
	const socket = getContext<TUIOHandler | undefined>(TUIO_SOCKET_CONTEXT_KEY);
	if (!socket) {
		throw new Error('TUIOHandler not found. Did you forget to setSocket?');
	}
	return socket;
}
