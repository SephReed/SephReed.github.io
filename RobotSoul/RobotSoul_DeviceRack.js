

var RACKS = RS.deviceRacks = {};

RACKS.all = [];
// RACKS.byId = {};
// RACKS.maxId = 0;
RACKS.get = DEVICES.getClone;

var DeviceRack = DEVICES.registerTemplate("DeviceRack" , function(rack) {
	// rack.ID = RACKS.maxId++;

	RACKS.all.push(rack);
	// RACKS.byId[rack.ID] = rack;

	// rack.midiConnections = [];
	// rack.name = "Rack "+rack.ID;
	rack.devices = [];
	rack.GUI;

	// var createdCableConnection;

	rack.getGUI = function() {
		if(rack.GUI == undefined) {
			rack.GUI = document.createElement("DeviceRack");
			El.attr(rack.GUI, "cableOverlay", "");

			for(var i in rack.devices){
				// console.log("getting gui of device", rack.devices[i]);
				var addMe = rack.devices[i].getGUI();
				// console.log(addMe);
				rack.GUI.appendChild(addMe);
			}

			PINE.updateAt(rack.GUI);

			for(var i in rack.devices){
				rack.addDeviceConnectionsToGUI(rack.devices[i]);
			}


			rack.GUI.FNS.cableOnRemove(function(cable) {
				if(cable.connection)
					cable.connection.remove();
			});

			rack.GUI.FNS.cableOnConnect(function(cable) {
				var output = cable.out.socket.parentNode.PVARS.output;
				var input = cable.in.socket.parentNode.PVARS.input;

				if(cable.connection) {
					var con = cable.connection;
				}
				
				else {
					var con = new IOH.Connection(output, input);
					cable.connection = con;
					con.cable = cable;
				}
			});

		}

		return rack.GUI;
	}


	
	rack.addDevice = function(device, insertAfter, autoConnect) {
		if(insertAfter == undefined) {
			

			rack.devices.push(device);
			if(device.isEnabled == false)
				device.setEnabled(true);

			if(autoConnect !== false) {
				for(var i = rack.devices.length - 2; i >= -1; i--) {
					var output = i == -1 ? rack : rack.devices[i];
					output.outputTo(device);
				}
			}


			if(rack.GUI) {
				rack.GUI.appendChild(device.getGUI());
				rack.addDeviceConnectionsToGUI(device);
			}
			
		}
	}

	rack.addDeviceConnectionsToGUI = function(device) {
		var cons = device.getConnections();
		for (var i = 0; i < cons.length; i++) {
			var con = cons[i];
			if(con.cable == undefined) {
				// createdCableConnection = con;
				var inSocket = con.input.socketGUI;
				var outSocket = con.output.socketGUI;

				if(inSocket && outSocket) {
					con.cable = rack.GUI.FNS.cableConnect(inSocket, outSocket);
					con.cable.connection = con;
				}
			}
		}
	}




	rack.addOutput("midi");
	rack.addInput("midi", "midi", function(midiIn) {
		rack.sendOutputToRecievers("midi", midiIn.midi);
	});


});




RACKS.toLoadable = function() {
	var save = [];
	for (var i in RACKS.all) {
		var rack = RACKS.all[i];
		var addMe = {};
		addMe.ID = rack.ID;
		addMe.devices = [];

		for (var d in rack.devices) 
			addMe.devices.push(rack.devices[d].ID);

		save.push(addMe);
	}
	return save;
}	


RACKS.load = function(loadMe) {
	for(var i in loadMe) {
		var rack = DEVICES.getClone(loadMe[i].ID);
		var devices = loadMe[i].devices;

		for(var d in devices) {
			var addMe = DEVICES.getClone(devices[d]);
			rack.addDevice(addMe, undefined, false);
		}
	}
}

























