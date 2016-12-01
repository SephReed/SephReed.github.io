var IOH = RS.IOHelper = {};
IOH.ProtoFNS = {};




IOH.valueTypes = {};
IOH.encodingTypes = ["number", "string"];

IOH.registerValueType = function(name, isARate, encoding) {
	var type = {};
	type.name = name;
	type.isARate = isARate;
	
	if(IOH.encodingTypes.indexOf(encoding) == -1)
		IOH.encodingTypes.push(encoding);

	IOH.valueTypes[type.name] = type;
}

IOH.registerValueType("wave", 		true, 	"number");
IOH.registerValueType("frequency", 	true, 	"number");
IOH.registerValueType("gain", 		true, 	"number");
IOH.registerValueType("interval", 	true, 	"number");
	//
IOH.registerValueType("midi", 		false, 	"midi");
IOH.registerValueType("wave_type", 	false, 	"string");
IOH.registerValueType("knob", 		false, 	"number");

IOH.registerValueType("rackMidi", 	false, 	"midi");
IOH.registerValueType("rackIn", 	false, 	"number");
IOH.registerValueType("rackOut", 	false, 	"number");




// IOH.hasIOType = function(device, valueType, inputNotOutput) {
// 	var io = inputNotOutput ? device.inputs : device.outputs;
// 	return io.byType[valueType] && io.byType[valueType].length;
// }



IOH.getValueType = function(valueTypeOrNameOf) {
	var out;

	if(typeof valueTypeOrNameOf == "string") {
		out = IOH.valueTypes[valueTypeOrNameOf];

		if(out == undefined) {
			PINE.err("value type not defined :: ", valueTypeOrNameOf);
		}
	}
	else out = valueTypeOrNameOf;

	return out;
}





// var IOProcessesor = RS.class.IOProcessesor = function() {
// 	var iop = this;
// 	Outputter.call(this);
// }

// IOProcessesor.prototype.getConnections = function() {
// 	var iop = this;
// 	var out = [];

// 	for(var IO_off = 0; IO_off < 2; IO_off++) {
// 		var sockets = IO_off == 0 ? iop.inputs.all : iop.outputs.all;
// 		for(var i = 0; sockets && i < sockets.length; i++)
// 			out = out.concat(sockets[i].connections);
// 	}

// 	return out;
// };


// IOH.inheritIOFunctions = function(benefactor) {
// 	IOH.inheritOutputFunctions(benefactor);
// 	IOH.inheritInputFunctions(benefactor);

// 	benefactor.getConnections = function() {
// 		var out = [];

// 		for(var IO_off = 0; IO_off < 2; IO_off++) {
// 			var sockets = IO_off == 0 ? benefactor.inputs.all : benefactor.outputs.all;
// 			for(var i = 0; sockets && i < sockets.length; i++)
// 				out = out.concat(sockets[i].connections);
// 		}

// 		return out;
// 	}
// }



IOH.getConnections = function(device) {
	var out = [];

	for(var IO_off = 0; IO_off < 2; IO_off++) {
		var sockets = IO_off == 0 ? device.inputs.all : device.outputs.all;
		for(var i = 0; sockets && i < sockets.length; i++)
			out = out.concat(sockets[i].connections);
	}

	return out;
}





/************************
*
*	Device Output Functions
*
**************************/



// IOH.inheritOutputFunctions = function (benefactor) {
// 	benefactor.prototype.outputs = {};
// 	benefactor.prototype.outputs.all = [];
// 	benefactor.prototype.outputs.byName = {};
// 	benefactor.prototype.outputs.byType = {};
	

// 	benefactor.prototype.addOutput = function(outputName, valueType, audioNode) {
// 		var modMe = this;
// 		console.log(modMe);
// 		return IOH.ProtoFNS.addIO(modMe, true, outputName, valueType, audioNode);
// 	}

// 	benefactor.prototype.getOutput = function(outputName) {
// 		return benefactor.outputs.byName[outputName];
// 	}

// 	// benefactor.prototype.doesOutput = function(valueType) {
// 	// 	return benefactor.hasType(valueType, false);
// 	// }


// 	benefactor.prototype.outputTo = function(device, outputOrNameOf, inputName) {
// 		IOH.ProtoFNS.outputTo(benefactor, device, outputOrNameOf, inputName);
// 	}

// 	benefactor.prototype.sendOutputToRecievers = function(outputName, newVal) {
// 		benefactor.outputs.byName[outputName].sendVal(newVal);
// 	}
// }




IOH.ProtoFNS.addIO = function(modMe, isOutput, socketName, arg1, fnOrNode) {
	var newSocket;

	// console.log(arg1);
	if(arg1 instanceof IOH.Socket) {
		newSocket = arg1;
		valueType = newSocket.valueType;
	}
	else {
		valueType = IOH.getValueType(arg1 || socketName);

		var createSocket = isOutput ? IOH.createOutput : IOH.createInput;
		newSocket = createSocket(socketName, valueType, fnOrNode);
		newSocket.device = modMe;
	}

	var filings = isOutput ? modMe.outputs : modMe.inputs;

	// console.log(socketName, modMe, isOutput ? "output": "input");
	filings.all.push(newSocket);
	filings.byName[socketName] = newSocket;

	var valType = valueType.name;
	if(filings.byType[valType] == undefined)
		filings.byType[valType] = [];

	filings.byType[valType].push(newSocket);


	return newSocket;
}





IOH.ProtoFNS.outputTo = function(modMe, device, outputOrNameOf, inputOrNameOf) {
	// console.log("connecting ", outputOrNameOf, modMe, "to", device);

	//if an across the board 'just try to connect'
	if(outputOrNameOf == undefined) {
		//for each output type, get the first element and try connecting that to the device
		for(var key in modMe.outputs.byType) {
			var typeGroup = modMe.outputs.byType[key];
			if(typeGroup.length) {
				var output = typeGroup[0];
				modMe.outputTo(device, output);
			}
		}
	}
	else {
		//get the output from either name or object
		var output;
		if(typeof outputOrNameOf == "string")
			output = modMe.outputs.byName[outputOrNameOf];
		else
			output = outputOrNameOf;


		//once you have an output, get the input from either name, object, or first possible of the device
		if(output) {
			var input;

			if(inputOrNameOf) {
				if(typeof inputOrNameOf == "string") {
					input = device.getInput(inputOrNameOf);
					if(input == undefined)
						PINE.err("input '"+inputOrNameOf+"' does not exist in", device.inputs.byName, "\n for device \n", device);
				}
				else input = inputOrNameOf;
			}
			else {
				var possibleInputs = device.inputs.byType[output.valueType.name];
				for(var i = 0; input == undefined && possibleInputs && i < possibleInputs.length; i++) {
					if(possibleInputs[i].connections.length == 0)	
						input = possibleInputs[0];
				}
			}


			//if a good input exists, connect it
			if(input) {
				return new IOH.Connection(output, input);
			}
		}
		else PINE.err("output '"+outputOrNameOf+"' does not exist in", modMe.outputs.byName, "\n for device \n", modMe);
		
	}
}







/************************
*
*	Device Input Functions
*
**************************/

// IOH.inheritInputFunctions = function(benefactor) {
// 	benefactor.prototype.inputs = {};
// 	benefactor.prototype.inputs.all = [];
// 	benefactor.prototype.inputs.byName = {};
// 	benefactor.prototype.inputs.byType = {};

// 	benefactor.prototype.addInput = function(name, valueType, fnOrNode) {
// 		var modMe = this;
// 		return IOH.ProtoFNS.addIO(modMe, false, name, valueType, fnOrNode);
// 	}

// 	benefactor.prototype.getInput = function(name) {
// 		return benefactor.inputs.byName[name];
// 	}

// 	// modMe.doesRecieve = function(valueType) {
// 	// 	return modMe.hasType(valueType, true);
// 	// }
// }














/************************
*
*	Socket
*
**************************/




IOH.Socket = function(name, valueType, fnOrNode, defaultVal) {
	var socket = this;

	socket.name = name;
	socket.valueType = valueType;
	socket.isARate = valueType.isARate;
	socket.defaultVal = defaultVal;
	socket.connections = [];
	
	socket.fnOrNodeChangeListeners = [];

	if(fnOrNode !== undefined)
		this.setFnOrNode(fnOrNode);
}


// IOH.Socket.prototype.addConnection = function(con) {
// 	this.connections.push(con);
// }

// IOH.Socket.prototype.removeConnection = function(con) {
// 	var socket = this;
// 	return U.removeFromArray(con, socket.connections);
// }

IOH.Socket.prototype.setFnOrNode = function(fnOrNode) {
	var socket = this;

	if(typeof fnOrNode == "function")
		socket.fnOrNode = fnOrNode;

	else if(typeof fnOrNode == "object")
		socket.fnOrNode = fnOrNode;
	
	for (var i in socket.fnOrNodeChangeListeners)
		socket.fnOrNodeChangeListeners[i](fnOrNode);
}


IOH.Socket.prototype.onFnOrNodeChange = function(listener) {
	this.fnOrNodeChangeListeners.push(listener);
}

IOH.Socket.prototype.removeFnOrNodeChangeListener = function(listener) {
	var socket = this;
	return U.removeFromArray(listener, socket.removeFnOrNodeChangeListeners);
}











/************************
*
*	IO Sockets
*
**************************/



IOH.createInput = function(name, valueType, recieverFnOrNode, defaultVal) {
	var input = new IOH.Socket(name, valueType, recieverFnOrNode, defaultVal);



	input.addConnection = function(con) {
		input.connections.push(con);
		con.setReciever(input.reciever);
	}

	input.removeConnection = function(con) {
		con.setReciever(undefined, true);
		return U.removeFromArray(con, input.connections);
	}

	input.setReciever = input.setFnOrNode;

	input.onFnOrNodeChange(function(reciever) {
		for(var i in input.connections)
			input.connections[i].setReciever(reciever);
	});

	Object.defineProperty(input, 'reciever', {
		get: function() { return input.fnOrNode; }
	});

	return input;
}







IOH.createOutput = function(name, valueType, senderFnOrNode, defaultVal) {
	var output = new IOH.Socket(name, valueType, senderFnOrNode, defaultVal);

	output.addConnection = function(con) {
		output.connections.push(con);
		con.setSender(output.sender);
	}

	output.removeConnection = function(con) {
		con.setSender(undefined, true);
		return U.removeFromArray(con, output.connections);
	}

	output.setSender = output.setFnOrNode;

	output.onFnOrNodeChange(function(sender) {
		for(var i in output.connections)
			output.connections[i].setSender(sender);
	});

	Object.defineProperty(output, 'sender', {
		get: function() { return output.fnOrNode; }
	});


	output.sendVal = function(val) {
		for(var i in output.connections)
			output.connections[i].send(val);
	}

	return output;
}














/************************
*
*	Connections
*
**************************/


var CONNECTIONS = IOH.Connections = {};


CONNECTIONS.initState = function() {
	CONNECTIONS.nextID = 0;
	CONNECTIONS.list = [];
}
CONNECTIONS.initState();


CONNECTIONS.toLoadable = function() {
	var save = [];
	for(var i in CONNECTIONS.list) {
		var con = CONNECTIONS.list[i];
		save.push(con.toLoadable());
	}
	return save;
}

CONNECTIONS.load = function(loadMe) {
	for(var i in loadMe) {
		var con = loadMe[i];
		// console.log(con);
		var input = DEVICES.getClone(con.input.device).getInput(con.input.name);
		var output = DEVICES.getClone(con.output.device).getOutput(con.output.name);

		var addMe = new IOH.Connection(output, input);
		addMe.ID = con.ID;
	}
}




IOH.Connection = function(output, input) {
		//
	var con = this;
	con.ID = CONNECTIONS.nextID++;
	CONNECTIONS.list.push(con);

	if(output == undefined || input == undefined)
		PINE.err("all connections must have both an input and an output");

	if(output.valueType.isARate != input.valueType.isARate)
		PINE.err("input and output have different isARate states", input, output);


	con.isARate = output.valueType.isARate;

	con.setInput(input);
	con.setOutput(output);

	// console.log("creating connection ", con.ID, con.sender, con.reciever);
}





IOH.Connection.prototype.setInput = function(input, iKnowBetterThanToDisconnectAndLeave) {
	this.setInputOrOutput(true, input, iKnowBetterThanToDisconnectAndLeave);
}

IOH.Connection.prototype.setOutput = function(output, iKnowBetterThanToDisconnectAndLeave) {
	this.setInputOrOutput(false, output, iKnowBetterThanToDisconnectAndLeave);
}


IOH.Connection.prototype.setInputOrOutput = function(isInput, newSocket, iKnowBetterThanToDisconnectAndLeave) {
	if(newSocket == undefined && iKnowBetterThanToDisconnectAndLeave == false)
		PINE.err("can not set socket to undefined.  If trying to delete connection use Connection.remove()")

	var con = this;

	var socket = isInput ? con.input : con.output;

	//if socket change
	if(newSocket !== socket) {

		//if a socket exists, unplug it	
		if(socket !== undefined)
			socket.removeConnection(con);	

		//if a new socket is being set, add a connection
		if(newSocket !== undefined) 
			newSocket.addConnection(con);


		if(isInput) 
			con.input = newSocket;
		else
			con.output = newSocket;
	}
	
	
	
}


IOH.Connection.prototype.setReciever = function(reciever) {
	this.setRecieverOrSender(true, reciever);
};

IOH.Connection.prototype.setSender = function(sender) {
	this.setRecieverOrSender(false, sender);
};

IOH.Connection.prototype.setRecieverOrSender = function(isReciever, recieverOrSender) {
	var con = this;
	if(con.isARate) {
		if(con.sender != undefined && con.reciever != undefined)
			con.sender.disconnect(con.reciever);

		if(isReciever)
			con.reciever = recieverOrSender;
		else
			con.sender = recieverOrSender;

		if(con.sender != undefined && con.reciever != undefined)
			con.sender.connect(con.reciever);

	}
	else {
		if(isReciever)
			con.reciever = recieverOrSender;
		else {
			console.log("what's the use of this again?", recieverOrSender);
			con.sender = recieverOrSender;
		}
	}
};


IOH.Connection.prototype.send = function(value) {
	var con = this;
	if(con.isARate) 
		PINE.err("calling send on an aRate connection is forbid");



	else if(con.reciever)
		con.reciever(value);
}



IOH.Connection.prototype.remove = function() {
	var con = this;

	console.log("removing connection ", con.ID, con.sender, con.reciever);
	con.sender.disconnect(con.reciever);


	for (var i in con.output.connections) {
		var reconnectMe = con.output.connections[i];

		if(reconnectMe !== con) {
			console.log("reconnecting ", reconnectMe.ID, reconnectMe.sender, reconnectMe.reciever);
			reconnectMe.sender.connect(reconnectMe.reciever);
		}
	}

	for (var i in con.input.connections) {
		var reconnectMe = con.input.connections[i];
		if(reconnectMe !== con) {
			console.log("reconnecting ", reconnectMe.ID, reconnectMe.sender, reconnectMe.reciever);
			reconnectMe.sender.connect(reconnectMe.reciever);
		}
	}

	U.removeFromArray(con, con.input.connections);
	U.removeFromArray(con, con.output.connections);

	U.removeFromArray(con, CONNECTIONS.list);
}




IOH.Connection.prototype.toLoadable = function() {
	var con = this;
	var save = {}
	save.ID = con.ID;
	save.output = {}
	save.output.name = con.output.name;
	save.output.device = con.output.device.ID;

	save.input = {}
	save.input.name = con.input.name;
	save.input.device = con.input.device.ID;
	
	return save;
}















IOH.oneUnitDC;
IOH.init = function() {
	buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    data[0] = 1;

    IOH.oneUnitDC = audioCtx.createBufferSource();
    IOH.oneUnitDC.buffer = buffer;
    IOH.oneUnitDC.loop = true;

    IOH.oneUnitDC.start();
}

IOH.init();



IOH.createDCRange = function(initVal) {
	if(initVal == undefined)
		initVal = 1.0;

    var range = audioCtx.createGain();
    IOH.oneUnitDC.connect(range);
    range.gain.value = initVal;

    return range;
}


IOH.createDC = IOH.createDCRange;





RS.connectIOSockets = function(soul, gui) {
	RS.connectInputSockets(soul, gui);
	RS.connectOutputSockets(soul, gui);
}



RS.connectInputSockets = function(soul, gui) {
	RS.connectSockets(true, soul, gui);
}

RS.connectOutputSockets = function(soul, gui) {
	RS.connectSockets(false, soul, gui);
}



RS.connectSockets = function(isInput, soul, gui) {
	var rsIOs = isInput ? El.cssQuery(gui, "rsIn") : El.cssQuery(gui, "rsOut");

	for (var i = 0; i < rsIOs.length; i++) {
		var guiIO = rsIOs[i];
		var IOName = El.attArg(guiIO, ["rsInName", "rsOutName", "name"]);

		if(IOName) {
			var soulIO = isInput ? soul.getInput(IOName) : soul.getOutput(IOName);
			// console.log(soulIO, IOName);
			if(soulIO != undefined) {
				// console.log("valueType_"+soulIO.valueType.name);
				guiIO.classList.add("valueType_"+soulIO.valueType.name);

				guiIO.PVARS[isInput ? "input" : "output"] = soulIO;

				soulIO.gui = guiIO;
				soulIO.socketGUI = El.firstOfTag(guiIO, "socket");
			}
			else PINE.err("rsI/O trying to represent non existant IO :: '"+IOName+"'", guiIO, gui);
		}

		else PINE.err("<rsIn>/<rsOut> created with neither [rsInName], [rsOutName], or [name] set ", guiIO, gui);
	}
}





















