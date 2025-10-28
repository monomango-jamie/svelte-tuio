/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TUIOSocket, type TouchZone } from './TUIOSocket.svelte';
import type { TUIOEvent, TUIOTouch } from '../types/TUIO';
import type { TangiblesManager } from '$lib/providers/tangibles/TangiblesManager.svelte';

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock possibleTangibles with correct structure
vi.mock('$lib/types/tangible', () => ({
	possibleTangibles: [
		{
			id: 13,
			classId: 13,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-solar-panel',
				type: 'Erzeuger',
				label: 'Solar Panel',
				color: 'green',
				flows: [
					{ target: 19, color: 'yellow', amount: 0, unit: 'kWh' },
					{ target: 17, color: 'yellow', amount: 0, unit: 'kWh' },
					{ target: 16, color: 'yellow', amount: 0, unit: 'kWh' }
				],
				totalEnergyConsumed: { amount: 0, unit: 'kWh' },
				totalEnergyOutput: { amount: 0, unit: 'kWh' },
				maxOutputAmount: 300000,
				maxConsumptionAmount: 0,
				minimumIntegerDigits: 6
			}
		},
		{
			id: 14,
			classId: 14,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-factory',
				type: 'Verbraucher',
				label: 'Industrieverbrauch',
				color: 'blue',
				flows: [],
				totalEnergyConsumed: { amount: 0, unit: 'kWh' },
				totalEnergyOutput: { amount: 0, unit: 'kWh' },
				maxOutputAmount: 0,
				maxConsumptionAmount: 100000,
				minimumIntegerDigits: 6
			}
		},
		{
			id: 15,
			classId: 15,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-house',
				type: 'Verbraucher',
				label: 'Hausverbrauch',
				color: 'green',
				flows: [],
				totalEnergyConsumed: { amount: 0, unit: 'kWh' },
				totalEnergyOutput: { amount: 0, unit: 'kWh' },
				maxOutputAmount: 0,
				maxConsumptionAmount: 6000,
				minimumIntegerDigits: 4
			}
		},
		{
			id: 16,
			classId: 16,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-h2-tank',
				type: 'Speicher',
				label: 'H2 Produktion',
				color: 'blue',
				flows: [
					{ target: 17, color: 'yellow', amount: 0, unit: 'kWh' },
					{ target: 20, color: 'blue', amount: 0, unit: 'KG' }
				],
				totalEnergyConsumed: { amount: 0, unit: 'KG' },
				totalEnergyOutput: { amount: 0, unit: 'KG' },
				maxOutputAmount: 100000,
				maxConsumptionAmount: 100000,
				minimumIntegerDigits: 6
			}
		},
		{
			id: 17,
			classId: 17,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-stromnetz',
				type: 'Stromnetz',
				label: '',
				color: 'red',
				flows: [
					{ target: 19, color: 'yellow', amount: 0, unit: 'kWh' },
					{ target: 14, color: 'yellow', amount: 0, unit: 'kWh' },
					{ target: 15, color: 'yellow', amount: 0, unit: 'kWh' }
				],
				totalEnergyConsumed: { amount: 0, unit: 'kWh' },
				totalEnergyOutput: { amount: 0, unit: 'kWh' },
				maxOutputAmount: 270000,
				maxConsumptionAmount: 400000,
				minimumIntegerDigits: 6
			}
		},
		{
			id: 19,
			classId: 19,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-battery',
				type: 'Speicher',
				label: 'Energie-Speicher',
				color: 'green',
				flows: [{ target: 17, color: 'yellow', amount: 0, unit: 'kWh' }],
				totalEnergyConsumed: { amount: 0, unit: 'kWh' },
				totalEnergyOutput: { amount: 0, unit: 'kWh' },
				maxOutputAmount: 50000,
				maxConsumptionAmount: 50000,
				minimumIntegerDigits: 6
			}
		},
		{
			id: 20,
			classId: 20,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-h2-bus',
				type: 'Verbraucher',
				label: 'Wasserstoff-Bus',
				color: 'blue',
				flows: [],
				totalEnergyConsumed: { amount: 0, unit: 'KG' },
				totalEnergyOutput: { amount: 0, unit: 'KG' },
				maxOutputAmount: 0,
				maxConsumptionAmount: 500,
				minimumIntegerDigits: 3
			}
		},
		{
			id: 21,
			classId: 21,
			profile: '2Dobj',
			guiInfo: {
				iconName: 'tangible-turbine',
				type: 'Erzeuger',
				label: 'Windrad',
				color: 'green',
				flows: [
					{ target: 19, color: 'yellow', amount: 0, unit: 'kWh' },
					{ target: 17, color: 'yellow', amount: 0, unit: 'kWh' },
					{ target: 16, color: 'yellow', amount: 0, unit: 'kWh' }
				],
				totalEnergyConsumed: { amount: 0, unit: 'kWh' },
				totalEnergyOutput: { amount: 0, unit: 'kWh' },
				maxOutputAmount: 100000,
				maxConsumptionAmount: 0,
				minimumIntegerDigits: 6
			}
		}
	],
	TangibleByClassId: {
		CAR_CHARGER: 4,
		SOLAR_PANEL: 13,
		FACTORY: 14,
		HOUSE: 15,
		H2_TANK: 16,
		STROMNETZ: 17,
		BATTERY: 19,
		H2_BUS: 20,
		TURBINE: 21
	}
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
const mockTangiblesManager: TangiblesManager = {
	addTangible: vi.fn(),
	removeTangible: vi.fn(),
	updateTangible: vi.fn(),
	getTangibles: vi.fn(() => []),
	clear: vi.fn()
} as any;

describe('TUIOSocket', () => {
	let tuioSocket: TUIOSocket;
	let mockSimulateClick: ReturnType<typeof vi.fn>;
	const testUrl = 'ws://localhost:8080';

	beforeEach(() => {
		vi.clearAllMocks();
		mockSimulateClick = vi.fn();
	});

	afterEach(() => {
		if (tuioSocket) {
			tuioSocket.removeSocket();
		}
	});

	describe('Constructor and Connection', () => {
		it('should initialize with URL and create socket in browser environment', () => {
			tuioSocket = new TUIOSocket(testUrl);

			expect(tuioSocket).toBeDefined();
			expect(tuioSocket.getSocket()).toBeDefined();
		});

		it('should initialize with simulateClick function', () => {
			tuioSocket = new TUIOSocket(testUrl, mockSimulateClick);

			expect(tuioSocket).toBeDefined();
			expect(tuioSocket.getSocket()).toBeDefined();
		});

		it('should handle missing simulateClick function gracefully', () => {
			tuioSocket = new TUIOSocket(testUrl);

			expect(() => {
				tuioSocket.handleFingerTouchEnd(createMockTUIOTouch());
			}).not.toThrow();
		});

		it('should return null socket when not connected initially', () => {
			tuioSocket = new TUIOSocket(testUrl);

			// Socket starts in CONNECTING state
			expect(tuioSocket.isConnected()).toBe(false);
		});

		it('should report connected when socket is in OPEN state', async () => {
			tuioSocket = new TUIOSocket(testUrl);

			// Wait for mock connection to open
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(tuioSocket.isConnected()).toBe(true);
		});
	});

	describe('Socket Management', () => {
		beforeEach(() => {
			tuioSocket = new TUIOSocket(testUrl);
		});

		it('should close socket connection', async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(tuioSocket.isConnected()).toBe(true);

			tuioSocket.removeSocket();

			expect(tuioSocket.getSocket()).toBeNull();
			expect(tuioSocket.isConnected()).toBe(false);
		});

		it('should handle closing non-existent socket gracefully', () => {
			tuioSocket.removeSocket(); // Close once
			tuioSocket.removeSocket(); // Close again

			expect(tuioSocket.getSocket()).toBeNull();
		});

		it('should handle socket recreation', () => {
			const firstSocket = tuioSocket.getSocket();

			// Manually trigger socket recreation
			tuioSocket['createSocket']();
			const secondSocket = tuioSocket.getSocket();

			expect(secondSocket).toBeDefined();
			expect(secondSocket).not.toBe(firstSocket);
		});

		it('should handle socket connection errors', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			await new Promise((resolve) => setTimeout(resolve, 10));

			const socket = tuioSocket.getSocket() as unknown as MockWebSocket;
			socket.dispatchEvent({ type: 'error', error: new Error('Connection failed') });

			expect(consoleSpy).toHaveBeenCalledWith('🔌 Socket error:', expect.any(Object));
			consoleSpy.mockRestore();
		});
	});

	describe('Touch Zone Management', () => {
		beforeEach(() => {
			tuioSocket = new TUIOSocket(testUrl);
		});

		it('should register a touch zone and return its ID', () => {
			const zone: TouchZone = {
				id: 'test-zone',
				u: 0.1,
				v: 0.1,
				normalisedWidth: 0.2,
				normalisedHeight: 0.2
			};

			const zoneId = tuioSocket.registerTouchZone(zone);

			expect(zoneId).toBe('test-zone');
			const zones = tuioSocket.getTouchZones();
			expect(zones).toHaveLength(1);
			expect(zones[0].id).toBe('test-zone');
		});

		it('should register multiple touch zones', () => {
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

			tuioSocket.registerTouchZone(zone1);
			tuioSocket.registerTouchZone(zone2);

			const zones = tuioSocket.getTouchZones();
			expect(zones).toHaveLength(2);
			expect(zones.map((z) => z.id)).toContain('zone1');
			expect(zones.map((z) => z.id)).toContain('zone2');
		});
	});

	describe('TangiblesManager Integration', () => {
		beforeEach(() => {
			tuioSocket = new TUIOSocket(testUrl, mockSimulateClick);
		});

		it('should use TangiblesManager for tangible placement', () => {
			tuioSocket.setTangiblesManager(mockTangiblesManager);

			const touch = createMockTUIOTouch({
				id: 1,
				classId: 14,
				profile: '2Dobj',
				u: 0.3,
				v: 0.7
			});

			tuioSocket.handlePlaceTangible(touch);

			expect(mockTangiblesManager.addTangible).toHaveBeenCalledWith(touch);
		});

		it('should use TangiblesManager for tangible removal', () => {
			tuioSocket.setTangiblesManager(mockTangiblesManager);

			const touch = createMockTUIOTouch({
				classId: 16
			});

			tuioSocket.handleRemoveTangible(touch);

			expect(mockTangiblesManager.removeTangible).toHaveBeenCalledWith(16);
		});

		it('should use TangiblesManager for tangible movement', () => {
			tuioSocket.setTangiblesManager(mockTangiblesManager);

			const touch = createMockTUIOTouch({
				id: 2,
				classId: 19,
				profile: '2Dobj',
				u: 0.8,
				v: 0.2
			});

			tuioSocket.handleMoveTangible(touch);

			expect(mockTangiblesManager.updateTangible).toHaveBeenCalledWith(touch);
		});

		it('should call addTangible even for unknown classIds', () => {
			tuioSocket.setTangiblesManager(mockTangiblesManager);

			const touch = createMockTUIOTouch({
				id: 1,
				classId: 999, // Not in possibleTangibles
				profile: '2Dobj'
			});

			tuioSocket.handlePlaceTangible(touch);

			// TUIOSocket passes all tangible touches to TangiblesManager
			// TangiblesManager is responsible for filtering valid tangibles
			expect(mockTangiblesManager.addTangible).toHaveBeenCalledWith(touch);
		});
	});

	describe('Finger Touch Handling', () => {
		beforeEach(() => {
			tuioSocket = new TUIOSocket(testUrl, mockSimulateClick);
		});

		it('should call simulateClick for finger touch end events', () => {
			const fingerTouch = createMockTUIOTouch({
				profile: '2Dcur',
				u: 0.25,
				v: 0.75
			});

			tuioSocket.handleFingerTouchEnd(fingerTouch);

			expect(mockSimulateClick).toHaveBeenCalledWith(0.25, 0.75);
		});

		it('should handle finger touch end without simulateClick function', () => {
			const socketWithoutClick = new TUIOSocket(testUrl);
			const fingerTouch = createMockTUIOTouch({
				profile: '2Dcur'
			});

			expect(() => {
				socketWithoutClick.handleFingerTouchEnd(fingerTouch);
			}).not.toThrow();
		});
	});

	describe('TUIO Event Message Processing', () => {
		beforeEach(() => {
			tuioSocket = new TUIOSocket(testUrl, mockSimulateClick);
			tuioSocket.setTangiblesManager(mockTangiblesManager);
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

			const socket = tuioSocket.getSocket() as unknown as MockWebSocket;
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

			const socket = tuioSocket.getSocket() as unknown as MockWebSocket;
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

			const socket = tuioSocket.getSocket() as unknown as MockWebSocket;
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

			const socket = tuioSocket.getSocket() as unknown as MockWebSocket;
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

			const socket = tuioSocket.getSocket() as unknown as MockWebSocket;
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

			const socket = tuioSocket.getSocket() as unknown as MockWebSocket;

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
			tuioSocket = new TUIOSocket(testUrl);
			tuioSocket.setTangiblesManager(mockTangiblesManager);
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

				tuioSocket.handlePlaceTangible(touch);

				expect(mockTangiblesManager.addTangible).toHaveBeenCalledWith(touch);
			});
		});
	});

	describe('Edge Cases and Error Handling', () => {
		beforeEach(() => {
			tuioSocket = new TUIOSocket(testUrl, mockSimulateClick);
		});

		it('should handle extremely large coordinate values', () => {
			const extremeTouch = createMockTUIOTouch({
				u: 999999,
				v: -999999,
				profile: '2Dcur'
			});

			expect(() => {
				tuioSocket.handleFingerTouchEnd(extremeTouch);
			}).not.toThrow();

			expect(mockSimulateClick).toHaveBeenCalledWith(999999, -999999);
		});

		it('should handle zero and boundary coordinate values', () => {
			const boundaryTouch = createMockTUIOTouch({
				u: 0,
				v: 1,
				profile: '2Dcur'
			});

			tuioSocket.handleFingerTouchEnd(boundaryTouch);

			expect(mockSimulateClick).toHaveBeenCalledWith(0, 1);
		});
	});
});
