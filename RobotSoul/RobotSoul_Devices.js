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

DEVICES.initState = function() {
	DEVICES.clones.byID = {};
	DEVICES.clones.nextID = 0;

	for (var id in DEVICES.templates.byID)
		DEVICES.templates.byID[id].counter = 1;
}
DEVICES.initState();



DEVICES.toLoadable = function() {
	var save = {};
	save.templates = {};
	// save.templates.nextID = DEVICES.templates.nextID;
	save.templates.byID = {};

	save.clones = {};
	save.clones.nextID = DEVICES.clones.nextID;
	save.clones.list = [];

	for (var id in DEVICES.templates.byID) {
		save.templates.byID[id] = DEVICES.templates.byID[id].name; 
	}

	for (var id in DEVICES.clones.byID) {
		save.clones.list.push(DEVICES.clones.byID[id].toLoadable()); 
	}	

	return save;
};



DEVICES.load = function(loadMe) {
	DEVICES.clones.nextID = loadMe.clones.nextID;

	var templateNames = loadMe.templates.byID;

	for(var i in loadMe.clones.list) {
		var clone = loadMe.clones.list[i];
		console.log("clone", clone);
		var deviceName = templateNames[clone.template];

		var addMe = DEVICES.new(deviceName, clone);
	}
}



DEVICES.get = function(target) {
	var asInt = parseInt(target);

	if(isNaN(asInt) == false)
		return DEVICES.templates.byId[asInt];

	else if(typeof target == "string") 
		return DEVICES.templates.byName[target.toLowerCase()];		
}


DEVICES.getClone = function(target) {
	var asInt = parseInt(target);

	if(isNaN(asInt) == false)
		return DEVICES.clones.byID[asInt];
}


DEVICES.registerTemplate = function(deviceName, initFn) {
	var args = {};

	deviceName = deviceName.toLowerCase();

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




/**************************
*    DEVICE TEMPLATE
***************************/



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

	else  {
		template.GUI = newGUI;
		template.frontGUI = El.firstOfTag(template.GUI, "deviceFront");
		template.backGUI = El.firstOfTag(template.GUI, "deviceBack");
	}
	
}

DeviceTemplate.prototype.clone = function(cloneArgs) {
	return new DeviceClone(this, cloneArgs);
}





/**************************
*    DEVICE CLONE
***************************/



var DeviceClone = RS.class.DeviceClone = function(template, args) {
	var clone = this;

	clone.template = template;
	clone.subdevices = {};
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

	for(var id in clone.subdevices)
		clone.subdevices[id].setEnabled(onOff);

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
	save.template = clone.template.ID;

	if(clone.getPreset)
		save.preset = clone.getPreset();

	return save;
}

DeviceClone.prototype.getInputOrOutput = function(subPath, inNotOut) {
	var path = subPath.split('/');
	console.log(subPath, this);
	var ptr = this;
	var socketName;
	for(var i = 0; i < path.length; i++) {
		if(i < path.length - 1)
			ptr = ptr.subdevices[path[i]];
		else
			socketName = path[i];
	}
	console.log(ptr);

	var sockets = inNotOut ? ptr.inputs.byName : ptr.outputs.byName;
	return sockets[socketName];
}

DeviceClone.prototype.getConnections = function() {
	return IOH.getConnections(this);
}

DeviceClone.prototype.addOutput = function(outputName, valueType, audioNode) {
	var clone = this;
	return IOH.ProtoFNS.addIO(clone, true, outputName, valueType, audioNode);
}

DeviceClone.prototype.getOutput = function(outputName) {
	// return this.getInputOrOutput(outputName, false);
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
	// return this.getInputOrOutput(name, true);
	return this.inputs.byName[name];
}

DeviceClone.prototype.addSubdevice = function(subname, deviceName) {
	var sub = this.subdevices[subname] = DEVICES.new(deviceName);
	return sub;
}








PINE.createNeedle("[defineRSDevice]", function(device) {


	device.addInitFn(function() {
		var initMe = this.domNode;
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


	device.addInitFn(PINE.ops.GATHER, function() {
		var initMe = this.domNode;
		var soul = initMe.PVARS.soul;

		if(soul)
			RS.connectGUI(soul, initMe);
	});
	
});


PINE.createNeedle("subdevice", function(subDev) {
	subDev.addAttArg("device", ["subdeviceName", "deviceName", "name"], "string");
	subDev.addAttArg("back", ["back"], "exists");
	subDev.addAttArg("alreadyRan", ["subdeviceIncluded"], "exists");

	subDev.addInitFn(function() {
		var mod = this;

		if(mod.attArg.alreadyRan !== true) {
			var device = DEVICES.get(mod.attArg.device);
			console.log(device, mod.attArg.device);

			var addMe;
			if(mod.attArg.back !== true) 
				addMe = device.frontGUI.cloneNode(true);
			else
				addMe = device.backGUI.cloneNode(true);

			mod.domNode.appendChild(addMe);
			El.attr(mod.domNode, "subdeviceIncluded", "");
		}
	});
});










RS.connectGUI = function(soul, gui) {
	RS.connectRanges(soul, gui);
	// RS.connectSelects(soul, gui);
	RS.connectIOSockets(soul, gui);
	RS.connectSelectableLists(soul, gui);
	// RS.connectButtons(soul, gui);	
	// RS.connectRadioButtons(soul, gui);	
}





RS.connectRanges = function(soul, gui) {
	var knobareas = El.cssQuery(gui, "knobarea");

	for(var i = 0; i < knobareas.length; i++) {
		var knobarea = knobareas[i];

		var knob = El.firstOfTag(knobarea, "knob");

		knob.FNS.onKnobChange(function(turnRatio) {
			var inputName = El.attArg(knob, "deviceInput");
			var input = soul.getInput(inputName);
			if(input)
				input.reciever(turnRatio);
			else
				PINE.err("input not found", inputName, soul);
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


// RS.connectSelects = function(soul, gui) {
// 	var selects = El.cssQuery(gui, "select");

// 	for(var i = 0; i < selects.length; i++) {
// 		// var args = RS.getNodeParam(selects[i]);
// 		selects[i].addEventListener("change", function(event) {
// 			var selector = event.target;
// 			// soul.setParam(args.node, args.param, event.target.value);	
// 			var inputName = El.attArg(selector, "deviceInput");

// 			console.log(selector, inputName);
// 			if(inputName)
// 				soul.getInput(inputName).reciever(selector.value);
// 		});	
// 	}
// }

RS.connectSelectableLists = function(soul, gui) {
	var selList = El.cssQuery(gui, "[selectableList]");

	for(var i = 0; i < selList.length; i++) {
		(function(selectable) {
			selectable.addEventListener("selectionChange", function(event) {
				console.log(event);
				var selected = event.detail.currentlySelected[0];
				var wave = El.attr(selected, "value");

				var inputName = El.attArg(selectable, "deviceInput");
				var input = soul.getInput(inputName);
				if(input)
					input.reciever(wave);
				else
					PINE.err("input not found", inputName, soul);

				// console.log(selector, inputName);
				// if(inputName)
				// 	soul.getInput(inputName).reciever(selector.value);
			});	
		})(selList[i])
		
	}
}













