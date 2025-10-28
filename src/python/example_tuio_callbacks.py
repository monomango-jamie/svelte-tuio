# me - this DAT
#
# dat - the DAT receiving the TUIO messages
# events - a list of TUIOEvent objects in order of oldest to newest
#
# each TUIOEvent objects as the following members
#	timestamp - the TUIO timestamp of this event, in 'seconds since Jan 1, 1900'
# 	touchesStart - a list of touches that started this event
# 	touchesMove - a list of touches that moved this event
#	touchesEnd - a list of touches that ended this event
# 	touchesNoChange - a list of pre-existing touches that didn't move 
#						or end this event
#
# each of those touches is a TUIOTouch object which has the following members
#	id
#	profile
#	u, v, w
#	angleX, angleY, angleZ
#	width, height, depth
#	area
#	volume
#	velocityX, velocityY, velocityZ
#	rotationX, rotationY, rotationZ
#	motionAccel
#	rotationAccel
#	classId

import json

# Dictionary to store previous touch states
previous_touch_states = {}

def get_tuio_touch_event(touch):
	# Invert the v coordinate, since TUIO inexplicably reverses the screen y-axis.
	inverted_v = tdu.remap(touch.v, 0., 1., 1., 0.)
	touch_data = {
		"id": touch.id,
		"profile": touch.profile,
		"u": touch.u,
		"v": inverted_v,
		"w": touch.w,
		"angleX": touch.angleX,
		"angleY": touch.angleY,
		"angleZ": touch.angleZ,
		"width": touch.width,
		"height": touch.height,
		"depth": touch.depth,
		"area": touch.area,
		"volume": touch.volume,
		"velocityX": touch.velocityX,
		"velocityY": touch.velocityY,
		"velocityZ": touch.velocityZ,
		"rotationX": touch.rotationX,
		"rotationY": touch.rotationY,
		"rotationZ": touch.rotationZ,
		"motionAccel": touch.motionAccel,
		"rotationAccel": touch.rotationAccel,
		"classId": touch.classId
	}

	return touch_data

def has_coordinates_changed(touch):
	"""Check if the touch coordinates have changed from the previous state"""
	global previous_touch_states
	
	touch_id = touch.id
	current_coords = (touch.u, touch.v)
	
	if touch_id in previous_touch_states:
		previous_coords = previous_touch_states[touch_id]
		if current_coords == previous_coords:
			return False
	
	# Update the stored state
	previous_touch_states[touch_id] = current_coords
	return True

# the parent component of this operator has a parent shortcut "TUIO"
# the tuio component has a parameter Webserver which is a reference to the web_server component
# the web_server component contains a child operator at the path (relative to webServer) 'webserver1
def onTouches(dat, events):
	webserverDAT = parent.TUIO.par.Webserver.eval().op('webserver1')
	connections = webserverDAT.webSocketConnections
	# loop through the events
	for event in events:
		#print(event.timestamp)
		
		# loop through the different tuioTouch
		for touch in event.touchesStart:
			event_data = {
				"timestamp": event.timestamp,
				"touchesStart": []
			}

			touch_data = get_tuio_touch_event(touch)

			event_data["touchesStart"].append(touch_data)
			json_data = json.dumps(event_data)
			for connection in connections:
				webserverDAT.webSocketSendText(connection, json_data)
			pass
		for touch in event.touchesMove:
			# Only send event if coordinates have actually changed
			if has_coordinates_changed(touch):
				debug('touchesMove', touch.classId, touch.u, touch.v)
				event_data = {
					"timestamp": event.timestamp,
					"touchesMove": []
				}

				touch_data = get_tuio_touch_event(touch)

				event_data["touchesMove"].append(touch_data)
				json_data = json.dumps(event_data)
				for connection in connections:
					webserverDAT.webSocketSendText(connection, json_data)

		for touch in event.touchesEnd:
			# Clean up stored state when touch ends
			if touch.id in previous_touch_states:
				del previous_touch_states[touch.id]
			
			event_data = {
				"timestamp": event.timestamp,
				"touchesEnd": []
			}

			touch_data = get_tuio_touch_event(touch)

			event_data["touchesEnd"].append(touch_data)
			json_data = json.dumps(event_data)
			for connection in connections:
				webserverDAT.webSocketSendText(connection, json_data)
	return