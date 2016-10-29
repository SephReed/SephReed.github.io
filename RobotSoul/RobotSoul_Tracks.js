// var TRACKS = RS.Tracks = function(id) {
// 	return TRACKS.byId[id];
// }

var TRACKS = RS.Tracks = {}

	
TRACKS.list = [];
TRACKS.byId = {}
TRACKS.maxId = 0;

TRACKS.get = function(target) {
	var asInt = parseInt(target);

	if(isNaN(asInt) == false)
		return TRACKS.byId[asInt];

	else if(typeof target == "string") {
		for(var i in TRACKS.list) {
			if(TRACKS.list[i].name == target)
				return TRACKS.list[i];
		}
	}
}


TRACKS.add = function(addMe) {
	// if(addMe.ID == undefined)	
	// 	addMe.ID = TRACKS.maxId++;

	if(addMe.name == undefined)
		addMe.name = "Track "+addMe.ID;

	TRACKS.list.push(addMe);
	TRACKS.byId[addMe.ID] = addMe;
}


TRACKS.toLoadable = function() {
	var tracksOut = {};
	for(var id in TRACKS.byId)
		tracksOut[id] = TRACKS.byId[id].toLoadable();

	return tracksOut;
}

TRACKS.load = function(loadMe) {
	for(var i in loadMe) {
		
		var addMe = new MidiSequenceTrack();
		addMe.ID = loadMe[i].ID;
		// addMe.deviceRacks = [];

		var racks = loadMe[i].racks;
		for (var r in racks) {
			var device = DEVICES.getClone(racks[r]);
			addMe.deviceRacks.push(device);
		}

		MasterNoteIn.connectMidi(addMe);

		TRACKS.add(addMe);
	}
}




// TRACKS.types = {};

// var Track = RS.class.Track = function() {
// 	var track = this;
// 	track.deviceRacks = [];
// }

// Track.prototype.addType = function(typeName, initFn) {
// 	TRACKS.types[typeName] = initFn; 
// }


// var MidiSequenceTrack = RS.class.MidiSequenceTrack = function(insertAfter) {
// 	var midiTrack = this;
// 	Track.call(midiTrack);


// 	var deviceRack;
// 	if(RACKS.order.length == 0)
// 		deviceRack = DeviceRack.new();
// 	else {
// 		//Make choose instruments of prior track
// 		if(insertAfter == undefined)
// 			deviceRack = RACKS.order[RACKS.order.length - 1];
// 	}

// 	midiTrack.deviceRacks.push(deviceRack);

// 	midiTrack.recieveMidi = function(midiIn) {
// 		for(var i in midiTrack.deviceRacks)
// 			midiTrack.deviceRacks[i].inputs.byName["midi"].reciever(midiIn);
// 	}

// 	midiTrack.toLoadable = function() {
// 		var trackOut = {};
// 		trackOut.ID = midiTrack.ID;
// 		trackOut.name = midiTrack.name;
// 		trackOut.deviceRacks = [];

// 		for(var i in midiTrack.deviceRacks)
// 			trackOut.deviceRacks.push(midiTrack.deviceRacks[i].ID);

// 		return trackOut;
// 	}
// }	





var MidiSequenceTrack = RS.class.MidiSequenceTrack = function(insertAfter) {
	var midiTrack = this;
	midiTrack.midiClips = [];

	midiTrack.deviceRacks = [];

	// var deviceRack;
	// if(RACKS.all.length == 0)
	// 	deviceRack = DeviceRack.new();
	// else {
	// 	//Make choose instruments of prior track
	// 	if(insertAfter == undefined)
	// 		deviceRack = RACKS.all[RACKS.all.length - 1];
	// }

	// midiTrack.deviceRacks.push(deviceRack);

	midiTrack.recieveMidi = function(midiIn) {
		for(var i in midiTrack.deviceRacks)
			midiTrack.deviceRacks[i].inputs.byName["midi"].reciever(midiIn);
	}

	midiTrack.toLoadable = function() {
		var trackOut = {};
		trackOut.ID = midiTrack.ID;
		trackOut.name = midiTrack.name;
		trackOut.deviceRacks = [];

		for(var i in midiTrack.deviceRacks)
			trackOut.deviceRacks.push(midiTrack.deviceRacks[i].ID);

		return trackOut;
	}
}	











