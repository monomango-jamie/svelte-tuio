import type { TUIOHandler } from './TUIOHandler.svelte';
/**
 * The context key used to store and retrieve the TUIOHandler instance
 */
export declare const TUIO_HANDLER_CONTEXT_KEY = "monomango:TUIOHandler";
/**
 * Sets the TUIOHandler instance in Svelte's context
 *
 * @param {TUIOHandler} socket - The TUIOHandler instance to store in context
 * @returns {void}
 */
export declare function setTUIOHandler(socket: TUIOHandler): void;
/**
 * Retrieves the TUIOHandler instance from Svelte's context
 *
 * @returns {TUIOHandler} The TUIOHandler instance
 * @throws {Error} If no TUIOHandler is found in context
 */
export declare function getTUIOHandlerContext(): TUIOHandler;
