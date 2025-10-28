/** The TUIO info is the info that is sent from the TUIO server. This is a subset of the TUIO touch object. */
export type TUIOTangible = {
	/** The ID persists throughout the object's journey across the screen i.e. sliding a tangible */
	id: number;
	/** The classId is the number identifier of a tangible. */
	classId: number;
	/** The profile is the type of object in contact with the screen. Always '2Dobj' for tangible objects. */
	profile: '2Dobj';
	/** The u and v are the coordinates of the tangible on the screen. */
	u: number;
	/** The v coordinate of the tangible on the screen. */
	v: number;
};
