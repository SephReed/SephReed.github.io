"use strict"

var ROBOT_SOUL;
var RS = ROBOT_SOUL = function(arg1, arg2) {
	if(typeof arg1 == "string" && arg2 == undefined)
		return DEVICES[arg1];

	else if(typeof arg1 == "string" 
		&& typeof arg2 == "function") {
		return Device(arg1, arg2);
	}
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
RS.Out = audioCtx.destination; 


RS.class = {};


RS.keyListeners = [];
RS.addKeyListener = function(addMe) {
	RS.keyListeners.push(addMe);
}

RS.removeKeyListener = function(target) {
	for(var i in RS.keyListeners) {
		if(RS.keyListeners[i] == target)
			return RS.keyListeners.splice(i, 1);
	}
}


U.docReady(function() {
	document.body.addEventListener("keyup", function(event) {
		for(var i in RS.keyListeners) 
			RS.keyListeners[i](event);
	});	
});





// RS.dragInPlace = function(domNode, onMovement) {

// 	document.body.classList.add("hide_cursor");

// 	var hasPointerLock = domNode.requestPointerLock !== undefined;
// 	if(hasPointerLock)
// 		domNode.requestPointerLock();

// 	var moveEvent = function(event) {			
// 		onMovement(event);
// 	}

// 	var releaseEvent = function(event) {
// 		document.body.removeEventListener("mousemove", moveEvent);
// 		document.body.removeEventListener("mouseup", releaseEvent);
// 		document.body.classList.remove("hide_cursor");
// 		if(hasPointerLock)
// 			document.exitPointerLock();
// 		else
// 			document.body.removeEventListener("mouseleave", releaseEvent)
// 	}


// 	document.body.addEventListener("mousemove", moveEvent);
// 	document.body.addEventListener("mouseup", releaseEvent);
// 	if(!hasPointerLock)
// 		document.body.addEventListener("mouseleave", releaseEvent);
// }









/************************
*
*	NOTE INPUTS
*
**************************/
RS.noteInputs = {};

var NoteInput = RS.class.NoteInput = function(name) {
	RS.noteInputs[name] = this;
	this.connections = [];

	this.recieveMidi = function(midiOut) {
		var midiPack;
		if(midiOut.id == undefined) {
			midiPack = {}
			midiPack.id = this;
			midiPack.midi = midiOut;
		}
		else midiPack = midiOut;
		// console.log(midiOut);
		for (var i in this.connections)
			this.connections[i].recieveMidi(midiPack);
	}

	
	this.connectMidi = function(midiReciever) {
		if(midiReciever.recieveMidi != undefined)
			this.connections.push(midiReciever);
		else
			PINE.err("can't connect a non midi reciever", midiReciever);
	}
}

var MasterNoteIn = new NoteInput("Master Note In");






// /************************
// *
// *	NOTE INPUT TRACKS
// *
// **************************/
// RS.noteInputTracks = {};
// var NoteInputTrack = RS.class.NoteInputTrack = function() 









/************************
*
*	KEYBOARD PIANO
*
**************************/
var KEYS = RS.Keys = {};

KEYS.noteInput = new NoteInput("Text Keyboard");
KEYS.noteInput.connectMidi(MasterNoteIn);
KEYS.octave = 4;


KEYS.layouts = {}

var wonderplan = KEYS.layouts["Wonderplan"] = {};

wonderplan.lowercase = "dgsmtnwryifaebo;h";
wonderplan.uppercase = "DGSMTNWRYIFAEBO:H";
wonderplan.octaveShift = "zx";

KEYS.currentLayout = wonderplan;




RS.addKeyListener(function(event) {
	var key = event.key;

	//try note
	var note = KEYS.currentLayout.lowercase.indexOf(key);

	if(note == -1)
		note = KEYS.currentLayout.uppercase.indexOf(key);		

	if(note != -1) {
		note += 12 * KEYS.octave;
		KEYS.noteInput.recieveMidi(note);
		return;
	}

	var octaveShift = KEYS.currentLayout.octaveShift.indexOf(key);	
	if(octaveShift == 0){
		KEYS.octave = Math.max(0, KEYS.octave-1);
		return;
	}
	if(octaveShift == 1){
		KEYS.octave = Math.min(8, KEYS.octave+1);
		return;
	}

});


















/************************
*
*	DEVICES
*
**************************/



var DEVICES = RS.Devices = {};

var Device = RS.class.Device = function(deviceName, initFn) {
	if(initFn == undefined) {
		return DEVICES[deviceName];
	}


	var master = function(track) {
		console.log(master);
		var clone = {};

		clone.name = function() {
			return master.deviceName;
		}

		clone.master = master;

		clone.audioNodes = {};

		clone.setParam = function(nodeName, paramName, newVal) {
			var node = clone.audioNodes[nodeName];
			if(node[paramName].value != undefined)
				node[paramName].value = newVal;
			else
				node[paramName] = newVal;
		}
		
		clone.isEnabled = false;
		clone.setEnabled = function(onOff) {
			if(onOff === true || onOff === false){
				for (var i in clone.audioNodes) {
					if(onOff && clone.audioNodes[i].start)
						clone.audioNodes[i].start();
					else if(clone.audioNodes[i].stop)
						clone.audioNodes[i].stop()
				}
				clone.isEnabled = onOff;		
			}
			else PINE.err("setEnabled(boolean) requires a boolean value ");
		}

		clone.getGUI = function() {
			if(clone.GUI)
				return clone.GUI;

			else {
				clone.GUI = master.GUI.cloneNode(true);
				El.attr(clone.GUI, "cloneCopy", "");
				clone.GUI.PVARS = {};
				clone.GUI.PVARS.soul = clone;
				return clone.GUI;
			}

			return undefined;
		}

		master.initFn.call(clone);

		clone.setTrack = function(newTrack) {
			if(newTrack == undefined)
				return PINE.err("no track given for setTrack()");

			if(clone.recieveMidi)
				newTrack.midiConnect(clone);
		}

		clone.setTrack(track);

		return clone;
	}

	console.log(master, deviceName, initFn);

	master.initFn = initFn;
	master.deviceName = deviceName;
	master.setGUI = function(newGUI) {
		master.GUI = newGUI;
	}

	DEVICES[master.deviceName] = master;

	return master;
}







PINE("[defineRSDevice]", function(initMe) {
	if(El.attr(initMe, "cloneCopy") !== undefined)
		return;

	var defining = El.attr(initMe, "defineRSDevice");
	var soul = RS(defining);

	if(soul == undefined)
		PINE.err("Device not yet defined.  Use RS(deviceName, func) before <defineRSDevice>");

	else soul.setGUI(initMe);
});



PINE("[defineRSDevice]", PINE.ops.GATHER, function(initMe) {
	var soul = initMe.PVARS.soul;

	if(soul)
		RS.connectGUI(soul, initMe);
});




RS.connectGUI = function(soul, gui) {
	RS.connectRanges(soul, gui);
	RS.connectSelects(soul, gui);
	// RS.connectButtons(soul, gui);	
	// RS.connectRadioButtons(soul, gui);	
}

RS.connectRanges = function(soul, gui) {
	var ranges = El.cssQuery(gui, "rsRange");

	for(var i = 0; i < ranges.length; i++) {
		var range = ranges[i];
		var args = RS.getNodeParam(range);

		new function(range, args) {
			range.FNS.onRangeChange(function(newVal) {
				soul.setParam(args.node, args.param, newVal);
			});
		}(range, args);
	}
}


RS.connectSelects = function(soul, gui) {
	var selects = El.cssQuery(gui, "select");

	for(var i = 0; i < selects.length; i++) {
		var args = RS.getNodeParam(selects[i]);
		selects[i].addEventListener("change", function(event) {
			soul.setParam(args.node, args.param, event.target.value);			
		});	
	}
}

RS.getNodeParam = function(domNode) {
	var out = {};
	out.node = El.attr(domNode, "node");
	out.param = El.attr(domNode, "param");
	return out;
}









/*************************
*
*     Knob
*
**************************/
var p_knob = PINE("knob", function(initMe) {

	var knobVal = 0.5;
	PINE.addFunctionToNode(initMe, "getKnobVal", function() {
		return knobVal;
	});



	var minRotation = El.attArg(initMe, ["knobMinRotation", "minRotation"], "int", -135);
	var maxRotation = El.attArg(initMe, ["knobMaxRotation", "maxRotation"], "int", 135);
	var dragRadius = El.attArg(initMe, ["knobDragRadius", "dragRadius"], "int", 150);

	var rotationWidth = maxRotation - minRotation;
	var unitPerPx = 0.5/dragRadius;
	console.log(dragRadius, unitPerPx);

	initMe.addEventListener("mousedown", function(mouseDownEvent) {
		var dy = 0;
		var startVal = knobVal;

		mouseDownEvent.preventDefault();
		U.dragInPlace(initMe, function(moveEvent) {

			var moveY = moveEvent.movementY
			if(moveEvent.shiftKey)
				moveY *= 0.1;

			dy -= moveY;

			var newVal = (unitPerPx * dy) + startVal;

			console.log(dy, newVal);

			initMe.FNS.setKnobVal(newVal);
		});
	});

	var knobChangeListeners = [];
	PINE.addFunctionToNode(initMe, "onKnobChange", function(listener) {
		knobChangeListeners.push(listener);
	});


	
	PINE.addFunctionToNode(initMe, "setKnobVal", function(newVal) {
		newVal = Math.max(newVal, 0);
		newVal = Math.min(newVal, 1);
		knobVal = newVal;

		for(var i in knobChangeListeners)
			knobChangeListeners[i](knobVal);

		var rotation = (knobVal * rotationWidth) + minRotation;
		initMe.style.transform = "rotate("+rotation+"deg)";
	});

});









U.dragInPlace = function(domNode, onMovement) {

	document.body.classList.add("hide_cursor");

	var hasPointerLock = domNode.requestPointerLock !== undefined;
	if(hasPointerLock)
		domNode.requestPointerLock();

	var moveEvent = function(event) {			
		onMovement(event);
	}

	var releaseEvent = function(event) {
		document.body.removeEventListener("mousemove", moveEvent);
		document.body.removeEventListener("mouseup", releaseEvent);
		document.body.classList.remove("hide_cursor");
		if(hasPointerLock)
			document.exitPointerLock();
		else
			document.body.removeEventListener("mouseleave", releaseEvent)
	}


	document.body.addEventListener("mousemove", moveEvent);
	document.body.addEventListener("mouseup", releaseEvent);
	if(!hasPointerLock)
		document.body.addEventListener("mouseleave", releaseEvent);
}










/************************
*
*	rsRange
*
**************************/


RS.createDCRange = function(initVal) {
	if(initVal == undefined)
		initVal = 1.0;

    var buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    data[0] = 1;

    var bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;

    var range = audioCtx.createGain();
    bufferSource.connect(range);
    bufferSource.start();
    range.gain.value = initVal;

    var out = {};
    out.bufferSource = bufferSource;
    out.range = range;
    return out;
}


var p_rsRange = PINE("rsRange", PINE.ops.GATHER, function(initMe) {

	console.log("rsRange found")
	var knob = El.cssQuery(initMe, ">knob");
	if(knob.length)
		knob = knob[0]
	else
		knob = undefined;


	var args = p_rsRange.getArgs(initMe);
	var max = args.max;
	var min = args.min;
	var width = max - min;



	if(knob) {
		initMe.PVARS.knob = knob;
		knob.FNS.onKnobChange(function(turnRatio) {
			var newVal = turnRatio * width;
			newVal += min;
			initMe.FNS.setRangeVal(newVal);
		});







		// knob.addEventListener("mousedown", function(mouseDownEvent) {
		// 	var args = p_rsRange.getArgs(initMe);
		// 	var max = args.max;
		// 	var min = args.min;
		// 	var unitPerPx = (max-min)/300.0; //300px total drag min to max;
			
		// 	var dy = 0;

		// 	mouseDownEvent.preventDefault();
		// 	RS.dragInPlace(initMe, function(moveEvent) {

		// 		var moveY = moveEvent.movementY
		// 		if(moveEvent.shiftKey)
		// 			moveY *= 0.1;

		// 		dy -= moveY;

		// 		var newVal = (unitPerPx * dy) + min;
		// 		newVal = Math.max(newVal, min);
		// 		newVal = Math.min(newVal, max);


		// 		var ratio = newVal/(max-min);
		// 		knob.style.transform = "rotate("+ (ratio*180) +"deg)";

		// 		for(var i in rangeChangeListeners)
		// 			rangeChangeListeners[i](newVal);
		// 	});
		// });
	}


	var rangeChangeListeners = [];
	PINE.addFunctionToNode(initMe, "onRangeChange", function(listener) {
		rangeChangeListeners.push(listener);
	});


	PINE.addFunctionToNode(initMe, "setRangeVal", function(newVal) {
		newVal = Math.min(max, newVal);
		newVal = Math.max(min, newVal);

		for(var i in rangeChangeListeners)
			rangeChangeListeners[i](newVal);	
	});

});




p_rsRange.getArgs = function(initMe) {
	var args = {};

	//max
	args.max = El.attr(initMe, "max");
	if(args.max === undefined)
		args.max = 1;
	else
		args.max = parseFloat(args.max);

	//min
	args.min = El.attr(initMe, "min");
	if(args.min === undefined)
		args.min = 0;
	else
		args.min = parseFloat(args.min);

	//drag radius
	args.dragRadius = El.attr(initMe, "dragRadius");
	if(args.dragRadius === undefined)
		args.dragRadius = 300;
	else
		args.dragRadius = parseFloat(args.dragRadius);

	return args;
}











/******************************
*
*	DEVICE HOLDERS aka TRACKS
*
********************************/

var Track = RS.class.Track = function(args) {
	for(var key in args)
		this[key] = args[key];
	
	this.id = TRACKS.maxId++;

	if(this.name == undefined)
		this.name = "Track "+this.id;

	TRACKS.list.push(this);
	TRACKS.byId[this.id] = this;

	this.addDevice = function(device) {
		var addMe;
		if(typeof device == "string")
			addMe = new Device(device)(this);

		else if(true || typeof device == "string") {
			console.log(typeof device);
			addMe = device;
		}

		addMe.setEnabled(true);
		var guiNode = addMe.getGUI();
		El.byId("track_details").appendChild(guiNode);
		PINE.updateAt(guiNode);
	}

	this.midiConnections = []
	this.midiConnect = function(device) {
		this.midiConnections.push(device);
	}

	this.midiDisconnect = function(device) {
		var target = this.midiConnections.indexOf(device)
		if(target != -1)
			this.midiConnections.splice(target, 1);
	}


	this.recieveMidi = function(midiIn) {
		for (var i in this.midiConnections)
			this.midiConnections[i].recieveMidi(midiIn);
	}

	MasterNoteIn.connectMidi(this);
}




var TRACKS = RS.Tracks = function(id) {
	return TRACKS.byId[id];
}
	
TRACKS.list = [];
TRACKS.byId = {}
TRACKS.maxId = 0;


new Track();
new Track();


var LogNode = RS.LogNode = audioCtx.createScriptProcessor(4096, 1, 1);

LogNode.log = function(numLogs) {
	LogNode.logCount = numLogs;
}

LogNode.logCount = 0;

LogNode.onaudioprocess = function(audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    var inputBuffer = audioProcessingEvent.inputBuffer;

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);

        // Loop through the 4096 samples
        for (var sample = 0; sample < inputBuffer.length; sample++) {
        	// make output equal to the same as the input
            outputData[sample] = inputData[sample];

            if(LogNode.logCount > 0) {
            	LogNode.logCount--;
            	// console.log(inputData[sample]);
            	console.log("LogNode:", inputData[sample]);
            }

            // add noise to each output sample
            // outputData[sample] += ((Math.random() * 2) - 1) * 0.2;         
        }
    }
}













