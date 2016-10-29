/************************
*
*	DEVICES
*
**************************/



var DEVICES = RS.Devices = {};
// var Device_Clones = [];

DEVICES.templates = {};
DEVICES.templates.byID = {};
DEVICES.templates.byName = {};
DEVICES.templates.nextID = 0;

DEVICES.clones = {};
DEVICES.clones.byID = {};
DEVICES.clones.nextID = 0;


DEVICES.get = function(target) {
	var asInt = parseInt(target);

	if(isNaN(asInt) == false)
		return DEVICES.templates.byId[asInt];

	else if(typeof target == "string") 
		return DEVICES.templates.byName[target];		
}


DEVICES.getClone = function(target) {
	var asInt = parseInt(target);

	if(isNaN(asInt) == false)
		return DEVICES.clones.byID[asInt];
}


DEVICES.registerTemplate = function(deviceName, initFn) {
	var args = {};

	var id;
	var preID = DEVICES.templates.byName[deviceName];
	if(preID != undefined) {
	 	if(typeof preID != "number")
			PINE.err("device already created ", deviceName);
		else
			id = preID;
	}
	else id = DEVICES.templates.nextID++;

	var addMe = new DeviceTemplate(deviceName, initFn);
	addMe.ID = id;
	
	DEVICES.templates.byID[addMe.ID] = addMe;
	DEVICES.templates.byName[addMe.name] = addMe;
}


DEVICES.new = function(deviceName, cloneArgs) {
	if(cloneArgs == undefined) {
		cloneArgs = {};
		cloneArgs.ID = DEVICES.clones.nextID++;
	}

	var clone = DEVICES.get(deviceName).clone(cloneArgs);
	DEVICES.clones.byID[clone.ID] = clone;
	return clone;
}


var DeviceTemplate = RS.class.DeviceTemplate = function(deviceName, initFn) {
	var template = this;
	template.name = deviceName;
	template.initFn = initFn;
	template.counter = 1;
}

DeviceTemplate.prototype.setGUI = function(newGUI) {
	var template = this;
	if(template.GUI != undefined)
		PINE.err("double setting GUI for ", template.name);

	else
		template.GUI = newGUI;
}

DeviceTemplate.prototype.clone = function(cloneArgs) {
	return new DeviceClone(this, cloneArgs);
}





var DeviceClone = RS.class.DeviceClone = function(template, args) {
	var clone = this;

	clone.template = template;
	clone.ID = args.ID;
	clone.name = template.name + " " + template.counter++;
	clone.isEnabled = false;

	clone.outputs = {};
	clone.outputs.all = [];
	clone.outputs.byName = {};
	clone.outputs.byType = {};

	clone.inputs = {};
	clone.inputs.all = [];
	clone.inputs.byName = {};
	clone.inputs.byType = {};


	template.initFn.call(template, clone);

	if(args.preset)
		clone.loadPreset(args.preset);
}

// IOH.inheritIOFunctions(DeviceClone);




DeviceClone.prototype.setEnabled = function(onOff) {
	var clone = this;

	if(onOff == true && clone.start)
		clone.start();
	else if (onOff == false && clone.stop)
		clone.stop();

	clone.isEnabled = false || onOff;
}


DeviceClone.prototype.getGUI = function() {
	var clone = this;

	if(clone.GUI == undefined) {
			//
		clone.GUI = clone.template.GUI.cloneNode(true);

		El.attr(clone.GUI, "masterRsDevice", clone.name);
		clone.GUI.removeAttribute("defineRSDevice");

		clone.GUI.PVARS = {};
		clone.GUI.PVARS.soul = clone;

		//these must go elsewhere
		PINE.updateAt(clone.GUI);
		RS.connectGUI(clone, clone.GUI);
	}

	return clone.GUI;
}

DeviceClone.prototype.delete = function() {
	if(this.GUI)
		this.GUI.remove();
}

DeviceClone.prototype.toLoadable = function() {
	var clone = this;
	var save = {};
	save.ID = clone.ID;
	save.template = template.ID;

	if(clone.getPreset)
		save.preset = clone.getPreset();

	return save;
}

DeviceClone.prototype.getConnections = function() {
	return IOH.getConnections(this);
}

DeviceClone.prototype.addOutput = function(outputName, valueType, audioNode) {
	var clone = this;
	return IOH.ProtoFNS.addIO(clone, true, outputName, valueType, audioNode);
}

DeviceClone.prototype.getOutput = function(outputName) {
	return this.outputs.byName[outputName];
}


DeviceClone.prototype.outputTo = function(device, outputOrNameOf, inputName) {
	IOH.ProtoFNS.outputTo(this, device, outputOrNameOf, inputName);
}

DeviceClone.prototype.sendOutputToRecievers = function(outputName, newVal) {
	this.outputs.byName[outputName].sendVal(newVal);
}


DeviceClone.prototype.addInput = function(name, valueType, audioNode) {
	var clone = this;
	return IOH.ProtoFNS.addIO(clone, false, name, valueType, audioNode);
}

DeviceClone.prototype.getInput = function(name) {
	return this.inputs.byName[name];
}


// Device.nextDeviceID = 0;
// Device.nextCloneID = 0;



DEVICES.toLoadable = function() {
	var save = {};
	save.templates = {};
	save.templates.nextID = DEVICES.templates.nextID;
	save.templates.byId = {};

	save.clones = {};
	save.clones.nextID = DEVICES.clones.nextID;
	save.clones.list = [];

	for (var id in DEVICES.templates.byId) {
		save.templates.byId[id] = DEVICES.templates.byId[id].deviceName; 
	}

	for (var id in DEVICES.clones.byId) {
		save.clones.list.push(DEVICES.clones.byId[id].toLoadable()); 
	}	

	return save;
};

DEVICES.load = function(loadMe) {
	// DEVICES.templates.nextID = loadMe.templates.nextID;
	DEVICES.clones.nextID = loadMe.clones.nextID;

	var templateNames = loadMe.templates.byID;
	// for(var id in templateNames) {
	// 	var intId = parseInt(id);
	// 	var name = templateNames[id];
	// 	DEVICES.templates.byID[intId] = name;
	// 	DEVICES.templates.byName[name] = intId;
	// }

	for(var i in loadMe.clones.list) {
		var clone = loadMe.clones.list[i];
		console.log("clone", clone);
		var deviceName = templateNames[clone.template];

		var addMe = DEVICES.new(deviceName, clone);
	}
}





PINE("[defineRSDevice]", function(initMe) {
	var defining = El.attr(initMe, "defineRSDevice");
	var soul = RS.Devices.get(defining);

	if (soul !== undefined)  {
		var width = El.attArg(initMe, "unitWidth", "int", 1);
		var height = El.attArg(initMe, "unitHeight", "int", 1);

		initMe.style.width = (50 * width) +'px';
		initMe.style.height = (50 * height) +'px';

		soul.setGUI(initMe);
	}

	else PINE.err("Device '"+defining+"'' not yet defined.  Use RS(deviceName, func) before <defineRSDevice>");
});



PINE("[defineRSDevice]", PINE.ops.GATHER, function(initMe) {
	var soul = initMe.PVARS.soul;

	if(soul)
		RS.connectGUI(soul, initMe);
});




RS.connectRanges = function(soul, gui) {
	var knobareas = El.cssQuery(gui, "knobarea");

	for(var i = 0; i < knobareas.length; i++) {
		var knobarea = knobareas[i];

		var knob = El.firstOfTag(knobarea, "knob");

		knob.FNS.onKnobChange(function(turnRatio) {
			var inputName = El.attArg(knob, "deviceInput");
			soul.getInput(inputName).reciever(turnRatio);
			// initMe.FNS.setRangeVal(newVal, [knob]);
		});
		// knob.addEventListener("change", function(event))
		// var args = RS.getNodeParam(range);

		// new function(range, args) {
		// 	range.FNS.onRangeChange(function(newVal) {
		// 		soul.setParam(args.node, args.param, newVal);
		// 	});
		// }(range, args);
	}
}


RS.connectSelects = function(soul, gui) {
	var selects = El.cssQuery(gui, "select");

	for(var i = 0; i < selects.length; i++) {
		// var args = RS.getNodeParam(selects[i]);
		selects[i].addEventListener("change", function(event) {
			var selector = event.target;
			// soul.setParam(args.node, args.param, event.target.value);	
			var inputName = El.attArg(selector, "deviceInput");

			console.log(selector, inputName);
			if(inputName)
				soul.getInput(inputName).reciever(selector.value);
		});	
	}
}













