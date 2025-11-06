/**
 * Represents a TUIO touch object with position, rotation, and motion data
 */
export interface TUIOTouch {
	/** Unique identifier for this touch */
	id: number;

	/** Class identifier (the number on the object) */
	classId: number;

	/** Touch profile identifier, used to differentiate between objects and touches */
	profile: '2Dobj' | '2Dcur';

	/** Position coordinates (typically normalized 0-1) */
	u: number;
	v: number;
	w: number;

	/** Rotation angles in degrees */
	angleX: number;
	angleY: number;
	angleZ: number;

	/** Physical dimensions */
	width: number;
	height: number;
	depth: number;

	/** Touch area */
	area: number;

	/** Touch volume */
	volume: number;

	/** Velocity in each axis */
	velocityX: number;
	velocityY: number;
	velocityZ: number;

	/** Rotation velocity in each axis */
	rotationX: number;
	rotationY: number;
	rotationZ: number;

	/** Motion acceleration */
	motionAccel: number;

	/** Rotation acceleration */
	rotationAccel: number;
}

/**
 * Represents a TUIO event containing touch state changes
 */
export interface TUIOEvent {
	/** TUIO timestamp in seconds since Jan 1, 1900 */
	timestamp: number;

	/** Touches that started in this event */
	touchesStart: TUIOTouch[];

	/** Touches that moved in this event */
	touchesMove: TUIOTouch[];

	/** Touches that ended in this event */
	touchesEnd: TUIOTouch[];

	/** Pre-existing touches that didn't change in this event */
	touchesNoChange: TUIOTouch[];
}
