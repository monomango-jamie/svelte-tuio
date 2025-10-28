/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TUIOHandler, type TouchZone } from './TUIOHandler.svelte';
import type { TUIOEvent, TUIOTouch } from '$lib/types/TUIO';

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock WebSocket
class MockWebSocket {
	url: string;
	readyState: number = WebSocket.CONNECTING;
	onopen: ((event: Event) => void) | null = null;
	onclose: ((event: CloseEvent) => void) | null = null;
	onmessage: ((event: MessageEvent) => void) | null = null;
	onerror: ((event: Event) => void) | null = null;

	private eventListeners: { [key: string]: ((event: any) => void)[] } = {};

	constructor(url: string) {
		this.url = url;
		// Simulate immediate connection
		setTimeout(() => {
			this.readyState = WebSocket.OPEN;
			this.dispatchEvent({ type: 'open' });
		}, 0);
	}

	addEventListener(type: string, listener: (event: any) => void) {
		if (!this.eventListeners[type]) {
			this.eventListeners[type] = [];
		}
		this.eventListeners[type].push(listener);
	}

	removeEventListener(type: string, listener: (event: any) => void) {
		if (this.eventListeners[type]) {
			const index = this.eventListeners[type].indexOf(listener);
			if (index > -1) {
				this.eventListeners[type].splice(index, 1);
			}
		}
	}

	dispatchEvent(event: any) {
		if (this.eventListeners[event.type]) {
			this.eventListeners[event.type].forEach((listener) => listener(event));
		}
	}

	close() {
		this.readyState = WebSocket.CLOSED;
		this.dispatchEvent({ type: 'close' });
	}

	send() {}
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as any;
Object.defineProperty(global.WebSocket, 'CONNECTING', { value: 0 });
Object.defineProperty(global.WebSocket, 'OPEN', { value: 1 });
Object.defineProperty(global.WebSocket, 'CLOSING', { value: 2 });
Object.defineProperty(global.WebSocket, 'CLOSED', { value: 3 });

// Helper function to create mock TUIOTouch objects with all required fields
function createMockTUIOTouch(overrides: Partial<TUIOTouch> = {}): TUIOTouch {
	return {
		id: 1,
		classId: 14,
		profile: '2Dcur',
		u: 0.5,
		v: 0.5,
		w: 0.5,
		angleX: 0,
		angleY: 0,
		angleZ: 0,
		width: 1,
		height: 1,
		depth: 1,
		area: 1,
		volume: 1,
		velocityX: 0,
		velocityY: 0,
		velocityZ: 0,
		rotationX: 0,
		rotationY: 0,
		rotationZ: 0,
		motionAccel: 0,
		rotationAccel: 0,
		...overrides
	};
}

// Mock TangiblesManager
const mockTangiblesManager = {
	addTangible: vi.fn(),
	removeTangible: vi.fn(),
	updateTangible: vi.fn(),
	getTangibles: vi.fn(() => []),
	clear: vi.fn()
} as any;

describe('TUIOHandler', () => {
	let tuioHandler: TUIOHandler;
	let mockSimulateClick: ReturnType<typeof vi.fn>;
	let mockSocket: WebSocket;

	beforeEach(() => {
		vi.clearAllMocks();
		mockSimulateClick = vi.fn();
		mockSocket = new WebSocket('ws://localhost:8080') as WebSocket;
	});

	afterEach(() => {
		if (tuioHandler) {
			tuioHandler.removeSocket();
		}
	});

	describe('Constructor and Connection', () => {
		it('should initialize with WebSocket and create handler in browser environment', () => {
			tuioHandler = new TUIOHandler(mockSocket);

			expect(tuioHandler).toBeDefined();
			expect(tuioHandler.getSocket()).toBeDefined();
		});

		it('should initialize with simulateClick function', () => {
			tuioHandler = new TUIOHandler(mockSocket, mockSimulateClick);

			expect(tuioHandler).toBeDefined();
			expect(tuioHandler.getSocket()).toBeDefined();
		});

		it('should handle missing simulateClick function gracefully', () => {
			tuioHandler = new TUIOHandler(mockSocket);

			expect(() => {
				tuioHandler.handleFingerTouchEnd(createMockTUIOTouch());
			}).not.toThrow();
		});

		it('should return socket when not connected initially', () => {
			tuioHandler = new TUIOHandler(mockSocket);

			// Socket starts in CONNECTING state
			expect(tuioHandler.isSocketConnected()).toBe(false);
		});

		it('should report connected when socket is in OPEN state', async () => {
			tuioHandler = new TUIOHandler(mockSocket);

			// Wait for mock connection to open
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(tuioHandler.isSocketConnected()).toBe(true);
		});
	});

	describe('Socket Management', () => {
		beforeEach(() => {
			tuioHandler = new TUIOHandler(mockSocket);
		});

		it('should close socket connection', async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(tuioHandler.isSocketConnected()).toBe(true);

			tuioHandler.removeSocket();

			expect(tuioHandler.isSocketConnected()).toBe(false);
		});

		it('should handle closing socket gracefully', () => {
			tuioHandler.removeSocket(); // Close once
			tuioHandler.removeSocket(); // Close again

			expect(tuioHandler.isSocketConnected()).toBe(false);
		});

		it('should handle socket connection errors', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioHandler.getSocket() as unknown as MockWebSocket;
			socket.dispatchEvent({ type: 'error', error: new Error('Connection failed') });

			expect(consoleSpy).toHaveBeenCalledWith('🔌 Socket error:', expect.any(Object));
			consoleSpy.mockRestore();
		});
	});

	describe('Touch Zone Management', () => {
		beforeEach(() => {
			tuioHandler = new TUIOHandler(mockSocket);
		});

		it('should have touchZones property', () => {
			expect(tuioHandler.touchZones).toBeDefined();
			expect(Array.isArray(tuioHandler.touchZones)).toBe(true);
		});

		it('should allow direct manipulation of touch zones', () => {
			const zone: TouchZone = {
				id: 'test-zone',
				u: 0.1,
				v: 0.1,
				normalisedWidth: 0.2,
				normalisedHeight: 0.2
			};

			tuioHandler.touchZones.push(zone);

			expect(tuioHandler.touchZones).toHaveLength(1);
			expect(tuioHandler.touchZones[0].id).toBe('test-zone');
		});

		it('should support multiple touch zones', () => {
			const zone1: TouchZone = {
				id: 'zone1',
				u: 0,
				v: 0,
				normalisedWidth: 0.5,
				normalisedHeight: 0.5
			};
			const zone2: TouchZone = {
				id: 'zone2',
				u: 0.5,
				v: 0.5,
				normalisedWidth: 0.5,
				normalisedHeight: 0.5
			};

			tuioHandler.touchZones.push(zone1);
			tuioHandler.touchZones.push(zone2);

			expect(tuioHandler.touchZones).toHaveLength(2);
			expect(tuioHandler.touchZones.map((z) => z.id)).toContain('zone1');
			expect(tuioHandler.touchZones.map((z) => z.id)).toContain('zone2');
		});
	});

	describe('TangiblesManager Integration', () => {
		beforeEach(() => {
			tuioHandler = new TUIOHandler(mockSocket, mockSimulateClick);
		});

		it('should have TangiblesManager instance', () => {
			expect(tuioHandler.tangiblesManager).toBeDefined();
		});

		it('should use TangiblesManager for tangible placement', () => {
			tuioHandler.tangiblesManager = mockTangiblesManager;

			const touch = createMockTUIOTouch({
				id: 1,
				classId: 14,
				profile: '2Dobj',
				u: 0.3,
				v: 0.7
			});

			tuioHandler.handlePlaceTangible(touch);

			expect(mockTangiblesManager.addTangible).toHaveBeenCalledWith(touch);
		});

		it('should use TangiblesManager for tangible removal', () => {
			tuioHandler.tangiblesManager = mockTangiblesManager;

			const touch = createMockTUIOTouch({
				classId: 16
			});

			tuioHandler.handleRemoveTangible(touch);

			expect(mockTangiblesManager.removeTangible).toHaveBeenCalledWith(16);
		});

		it('should use TangiblesManager for tangible movement', () => {
			tuioHandler.tangiblesManager = mockTangiblesManager;

			const touch = createMockTUIOTouch({
				id: 2,
				classId: 19,
				profile: '2Dobj',
				u: 0.8,
				v: 0.2
			});

			tuioHandler.handleMoveTangible(touch);

			expect(mockTangiblesManager.updateTangible).toHaveBeenCalledWith(touch);
		});

		it('should call addTangible even for unknown classIds', () => {
			tuioHandler.tangiblesManager = mockTangiblesManager;

			const touch = createMockTUIOTouch({
				id: 1,
				classId: 999, // Not in possibleTangibles
				profile: '2Dobj'
			});

			tuioHandler.handlePlaceTangible(touch);

			// TUIOHandler passes all tangible touches to TangiblesManager
			// TangiblesManager is responsible for filtering valid tangibles
			expect(mockTangiblesManager.addTangible).toHaveBeenCalledWith(touch);
		});
	});

	describe('Finger Touch Handling', () => {
		beforeEach(() => {
			tuioHandler = new TUIOHandler(mockSocket, mockSimulateClick);
		});

		it('should call simulateClick for finger touch end events', () => {
			const fingerTouch = createMockTUIOTouch({
				profile: '2Dcur',
				u: 0.25,
				v: 0.75
			});

			tuioHandler.handleFingerTouchEnd(fingerTouch);

			expect(mockSimulateClick).toHaveBeenCalledWith(0.25, 0.75);
		});

		it('should handle finger touch end without simulateClick function', () => {
			const handlerWithoutClick = new TUIOHandler(mockSocket);
			const fingerTouch = createMockTUIOTouch({
				profile: '2Dcur'
			});

			expect(() => {
				handlerWithoutClick.handleFingerTouchEnd(fingerTouch);
			}).not.toThrow();
		});
	});

	describe('TUIO Event Message Processing', () => {
		beforeEach(() => {
			tuioHandler = new TUIOHandler(mockSocket, mockSimulateClick);
			tuioHandler.tangiblesManager = mockTangiblesManager;
		});

		it('should process touchesStart events for tangibles', async () => {
			const tangibleTouch = createMockTUIOTouch({
				id: 1,
				classId: 13,
				profile: '2Dobj',
				u: 0.4,
				v: 0.6
			});

			const tuioEvent: TUIOEvent = {
				timestamp: Date.now(),
				touchesStart: [tangibleTouch],
				touchesMove: [],
				touchesEnd: [],
				touchesNoChange: []
			};

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioHandler.getSocket() as unknown as MockWebSocket;
			socket.dispatchEvent({
				type: 'message',
				data: JSON.stringify(tuioEvent)
			});

			expect(mockTangiblesManager.addTangible).toHaveBeenCalledWith(tangibleTouch);
		});

		it('should process touchesEnd events for tangibles', async () => {
			const tangibleTouch = createMockTUIOTouch({
				classId: 17,
				profile: '2Dobj'
			});

			const tuioEvent: TUIOEvent = {
				timestamp: Date.now(),
				touchesStart: [],
				touchesMove: [],
				touchesEnd: [tangibleTouch],
				touchesNoChange: []
			};

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioHandler.getSocket() as unknown as MockWebSocket;
			socket.dispatchEvent({
				type: 'message',
				data: JSON.stringify(tuioEvent)
			});

			expect(mockTangiblesManager.removeTangible).toHaveBeenCalledWith(17);
		});

		it('should process touchesMove events for tangibles', async () => {
			const tangibleTouch = createMockTUIOTouch({
				id: 3,
				classId: 21,
				profile: '2Dobj',
				u: 0.1,
				v: 0.9
			});

			const tuioEvent: TUIOEvent = {
				timestamp: Date.now(),
				touchesStart: [],
				touchesMove: [tangibleTouch],
				touchesEnd: [],
				touchesNoChange: []
			};

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioHandler.getSocket() as unknown as MockWebSocket;
			socket.dispatchEvent({
				type: 'message',
				data: JSON.stringify(tuioEvent)
			});

			expect(mockTangiblesManager.updateTangible).toHaveBeenCalledWith(tangibleTouch);
		});

		it('should process touchesEnd events for fingers', async () => {
			const fingerTouch = createMockTUIOTouch({
				profile: '2Dcur',
				u: 0.33,
				v: 0.67
			});

			const tuioEvent: TUIOEvent = {
				timestamp: Date.now(),
				touchesStart: [],
				touchesMove: [],
				touchesEnd: [fingerTouch],
				touchesNoChange: []
			};

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioHandler.getSocket() as unknown as MockWebSocket;
			socket.dispatchEvent({
				type: 'message',
				data: JSON.stringify(tuioEvent)
			});

			expect(mockSimulateClick).toHaveBeenCalledWith(0.33, 0.67);
		});

		it('should process multiple touches in a single event', async () => {
			const tangible1 = createMockTUIOTouch({
				id: 1,
				classId: 14,
				profile: '2Dobj'
			});
			const tangible2 = createMockTUIOTouch({
				id: 2,
				classId: 15,
				profile: '2Dobj'
			});

			const tuioEvent: TUIOEvent = {
				timestamp: Date.now(),
				touchesStart: [tangible1, tangible2],
				touchesMove: [],
				touchesEnd: [],
				touchesNoChange: []
			};

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioHandler.getSocket() as unknown as MockWebSocket;
			socket.dispatchEvent({
				type: 'message',
				data: JSON.stringify(tuioEvent)
			});

			expect(mockTangiblesManager.addTangible).toHaveBeenCalledTimes(2);
		});

		it('should handle events with empty touch arrays', async () => {
			const tuioEvent: TUIOEvent = {
				timestamp: Date.now(),
				touchesStart: [],
				touchesMove: [],
				touchesEnd: [],
				touchesNoChange: []
			};

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioHandler.getSocket() as unknown as MockWebSocket;

			expect(() => {
				socket.dispatchEvent({
					type: 'message',
					data: JSON.stringify(tuioEvent)
				});
			}).not.toThrow();

			expect(mockTangiblesManager.addTangible).not.toHaveBeenCalled();
			expect(mockSimulateClick).not.toHaveBeenCalled();
		});
	});

	describe('Tangible ClassId Handling', () => {
		beforeEach(() => {
			tuioHandler = new TUIOHandler(mockSocket);
			tuioHandler.tangiblesManager = mockTangiblesManager;
		});

		it('should call addTangible for all valid classIds', () => {
			const mappingTestCases = [13, 14, 15, 16, 17, 19, 20, 21];

			mappingTestCases.forEach((classId) => {
				vi.clearAllMocks(); // Clear between iterations

				const touch = createMockTUIOTouch({
					classId,
					profile: '2Dobj',
					u: 0.5,
					v: 0.5
				});

				tuioHandler.handlePlaceTangible(touch);

				expect(mockTangiblesManager.addTangible).toHaveBeenCalledWith(touch);
			});
		});
	});

	describe('Edge Cases and Error Handling', () => {
		beforeEach(() => {
			tuioHandler = new TUIOHandler(mockSocket, mockSimulateClick);
		});

		it('should handle extremely large coordinate values', () => {
			const extremeTouch = createMockTUIOTouch({
				u: 999999,
				v: -999999,
				profile: '2Dcur'
			});

			expect(() => {
				tuioHandler.handleFingerTouchEnd(extremeTouch);
			}).not.toThrow();

			expect(mockSimulateClick).toHaveBeenCalledWith(999999, -999999);
		});

		it('should handle zero and boundary coordinate values', () => {
			const boundaryTouch = createMockTUIOTouch({
				u: 0,
				v: 1,
				profile: '2Dcur'
			});

			tuioHandler.handleFingerTouchEnd(boundaryTouch);

			expect(mockSimulateClick).toHaveBeenCalledWith(0, 1);
		});
	});
});
