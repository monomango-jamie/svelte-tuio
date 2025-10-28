import { getContext, setContext } from 'svelte';
import type { TUIOSocket } from './TUIOSocket.svelte';

/**
 * The context key used to store and retrieve the TUIOSocket instance
 */
export const TUIO_SOCKET_CONTEXT_KEY = 'monomango:TUIOsocket';

/**
 * Sets the TUIOSocket instance in Svelte's context
 *
 * @param {TUIOSocket} socket - The TUIOSocket instance to store in context
 * @returns {void}
 */
export function setSocket(socket: TUIOSocket) {
	setContext(TUIO_SOCKET_CONTEXT_KEY, socket);
}

/**
 * Retrieves the TUIOSocket instance from Svelte's context
 *
 * @returns {TUIOSocket} The TUIOSocket instance
 * @throws {Error} If no TUIOSocket is found in context
 */
export function getSocketContext(): TUIOSocket {
	const socket = getContext<TUIOSocket | undefined>(TUIO_SOCKET_CONTEXT_KEY);
	if (!socket) {
		throw new Error('TUIOSocket not found. Did you forget to setSocket?');
	}
	return socket;
}
