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
// RS.Out = audioCtx.destination; 
RS.Out = audioCtx.createGain();
RS.Out.connect(audioCtx.destination);
RS.Out.gain.value = 0.5;


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

	document.body.addEventListener("keydown", function(event) {
		if(event.key == "z" && (event.metaKey == true || event.ctrlKey == true)) {
			if(event.shiftKey == true)
				RS.redo();
			else
				RS.undo();
		}
		// else if(event.key == "Escape") {
		// 	RS.switchFullscreen();
		// }
	});
});



RS.switchFullscreen = function() {
	if(document.fullscreenElement != null)
		document.exitFullscreen();

	else document.body.requestFullscreen();
}


var ActHist = RS.ActionHistory = {};
ActHist.undoPile = [];
ActHist.redoPile = [];
ActHist.ingoreNextEvent = false;

ActHist.addEvent = function(event) {
	if(ActHist.ingoreNextEvent) {
		ActHist.ingoreNextEvent = false;
		return;
	}

	if(ActHist.redoPile.length)
		ActHist.redoPile = [];

	ActHist.undoPile.push(event);
}

RS.undo = function() {
	var event = ActHist.undoPile.pop();
	if(event) {
		event.undo();
		ActHist.redoPile.push(event);
	}
}

RS.redo = function() {
	var event = ActHist.redoPile.pop();
	if(event) {
		ActHist.ingoreNextEvent = true;
		event.redo();
		ActHist.undoPile.push(event);
	}
}
















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
		if(midiOut.ID == undefined) {
			midiPack = {}
			midiPack.ID = this;
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









RS.clearProject = function() {
	RS.projectName = "untitled";
	DEVICES.initState();
	RACKS.initState();
	TRACKS.initState();
	CONNECTIONS.initState();
}






RS.defaultFile = {
	projectName : "Default File",
	devices : {
		templates : {
			byID : { 0 : "DeviceRack" }
		},
		clones : {
			nextID : 1,
			list : [{ ID : 0,	template : 0 }]
		}
	},
	racks : [
		{
			ID: 0,
			devices : []
		}
	],

	tracks : [
		{
			ID: 0,
			racks : [0]
		}
	],
	connections : []
}



RS.projectName = "BeatsAndGeeks";

RS.load = function(loadFile) {
	var loadMe = loadFile;
	if(typeof loadFile == "string")
		loadMe = JSON.parse(loadFile);

	RS.clearProject();

	RS.projectName = loadMe.projectName;
	DEVICES.load(loadMe.devices);
	RACKS.load(loadMe.racks);
	TRACKS.load(loadMe.tracks);
	CONNECTIONS.load(loadMe.connections);

	
}


RS.new = function() {
	RS.load(RS.defaultFile);
}






RS.toLoadable = function() {
	var save = {};
	save.projectName = RS.projectName;
	save.devices = DEVICES.toLoadable();
	save.racks = RACKS.toLoadable();
	save.tracks = TRACKS.toLoadable();
	save.connections = CONNECTIONS.toLoadable();

	return JSON.stringify(save);
}



RS.save = function() {
	var data = RS.toLoadable();
	var filename = RS.projectName + ".sol";
	var type = "json";
	RS.download(data, filename, type);
}


RS.download = function(data, filename, type) {
    var a = document.createElement("a");
    var	file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        console.log(url);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
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
	
	var rangeVal = 1;
	PINE.addFunctionToNode(initMe, "getRangeVal", function() {
		return rangeVal;
	});

	var min = El.attArg(initMe, ["rangeMin", "min"], "float", 0);
	var max = El.attArg(initMe, ["rangeMax", "max"], "float", 1);
	var width = max - min;


	var displayItems = [];


	var knob = El.firstOfTag(initMe, "knob");

	var ignoreKnobUpdate = false;
	if(knob) {
		displayItems.push(knob);
		initMe.PVARS.knob = knob;
		knob.FNS.onKnobChange(function(turnRatio) {
				//
			if(ignoreKnobUpdate) return;

			var newVal = turnRatio * width;
			newVal += min;
			initMe.FNS.setRangeVal(newVal, [knob]);
		});
	}



	var readout = El.firstOfTag(initMe, "numreadout");

	var ignoreReadoutUpdate = false;
	if(readout) {
		readout.FNS.setNumReadoutLow(min);
		readout.FNS.setNumReadoutHigh(max);
		
		readout.FNS.onNumReadoutChange(function(newVal) {
				//
			if(ignoreReadoutUpdate) return;

			initMe.FNS.setRangeVal(newVal, [readout]);
		});
	}



	var rangeChangeListeners = [];
	PINE.addFunctionToNode(initMe, "onRangeChange", function(listener) {
		rangeChangeListeners.push(listener);
	});


	PINE.addFunctionToNode(initMe, "setRangeVal", function(newVal, doNotUpdate) {
		newVal = Math.min(max, newVal);
		newVal = Math.max(min, newVal);
		rangeVal = newVal;

		for(var i in rangeChangeListeners)
			rangeChangeListeners[i](rangeVal);	

		
		if(knob && doNotUpdate.includes(knob) == false) {
			ignoreKnobUpdate = true;
			var ratio = width/(rangeVal - min)
			knob.FNS.setKnobVal(ratio);
		}

		if(readout && doNotUpdate.includes(readout) == false) {
			ignoreReadoutUpdate = true;
			readout.FNS.setNumReadoutVal(rangeVal);
		}
		

	});

});
























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



U.docReady(function() {
	document.body.addEventListener("keydown", function(event) {
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
});




