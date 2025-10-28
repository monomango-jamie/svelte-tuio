import { getTUIOHandlerContext } from './context';
/**
 * Hook for accessing the TUIOHandler instance in the application.
 *
 * @returns {TUIOHandler} The TUIOHandler instance
 */
export default function useTUIO() {
    const tuioHandler = getTUIOHandlerContext();
    return tuioHandler;
}
