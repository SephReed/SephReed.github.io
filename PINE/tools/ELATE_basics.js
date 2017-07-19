




//An interface should add functions and variables without any 
//consideration for previous function





ELATE.create("Guiable", function() {
	this.isAbstract();

	this.getGUI = function() {
		if(this.GUI == undefined)
			this.buildGUI();

		return this.GUI;
	}

	this.buildGUI = "abstract";
});




ELATE.create("Loadable", function() {
	this.isAbstract();
	this.toLoadable = "abstract";
	this.load = "abstract";
});



var Event = ELATE.create("Event", function() {
	this.constructor = function(type, channel, data) {
		this.type = type;
		this.data = data;
		this.channel = channel;
		this.cancelled = false;
	}

	this.cancel = function() {
		this.cancelled = true;
	}
});




ELATE.create("Rooted", function() {
	// this.isAbstract();
	// this.toLoadable = "abstract";
	// this.load = "abstract";

	this.constructor = function() {
		this.rootSystems = {};
		this.eventListeners = {};
		this.channelQualifiers = {};
		this.rootEnd = false;
	}

	this.isRootEnd = function(rootEnd) {
		this.rootEnd = rootEnd;
	}

	this.removeFromRootSystem = function(channel) {
		var removeMe = this;
		var rootSystem = this.getnitChannel(channel);
		if(rootSystem.parent)
			rootSystem.parent.removeBranch(channel, removeMe);
	}


	this.addBranch = function(channel, addMe) {
		if(addMe.inheritsFrom("rooted") == false)
			return PINE.err("can only add Rooted to Rooted", addMe);

		if(this.channelQualifiers[channel] && this.channelQualifiers[channel](addMe) == false)
			return;

		this.getnitChannel(channel).branches.push(addMe);
		addMe.getnitChannel(channel).parent = this;
	}

	this.removeBranch = function(channel, removeMe) {
		removeMe.getnitChannel(channel).parent = undefined;

		U.removeFromArray(this.getnitChannel(channel).branches, removeMe);
	}


	this.setChannelQualifier = function(channel, fn) {
		this.channelQualifiers[channel] = fn;
	}


	this.getnitChannel = function(channel) {
		var rootSystem = this.rootSystems[channel];
		if(rootSystem === undefined) {
			rootSystem = this.rootSystems[channel] = {
				branches: [],
				parent: undefined
			}
		}
		return rootSystem;
	}

	this.bubbleEvent = function(event) {
		if(event.origin === undefined)
			event.origin = this;

		var listeners = this.eventListeners[event.type];
		for (var i = 0; i < listeners.length && event.cancelled === false; i++) {
			var fn = listeners[i].fn;
			fn(event);
		}

		if(event.cancelled === true)
			return;

		var rootSystem = this.rootSystems[event.channel];

		if(rootSystem && rootSystem.parent) {
			rootSystem.parent.bubbleEvent(event);
		}
	}


	this.addEventListener = function(type, fn, priority) {
		var sequin = this;

		var addMe = {
			fn: fn,
			priority: priority || 0
		}

		var listeners = sequin.eventListeners[type];
		if(listeners === undefined) {
			listeners = sequin.eventListeners[type] = [];
			listeners.push(addMe);
		}
		else {
			for(var i in listeners) {
				if(priority > listeners[i].priority) {
					listeners.splice(target, 0, addMe);
				}
			}
		}
	}
});






PINE.GUIABLES = {}

ELATE.create("PineGuiable", function() {
	this.isAbstract();

	this.extend("Guiable");

	this.constructor = function(name) {
		this.name = name;
	}

	this.buildGUI = function() {
		var pGui = this;
		pGui.GUI = PINE.GUIABLES[pGui.name].cloneNode(true);
		PINE.updateAt(pGui.GUI).syncThen(function() {
			pGui.attachToGUI();	
		})
	};

	this.attachToGUI = "abstract";
});



PINE.createNeedle("[defineGUI]", PINE.ops.INIT, function(defGUI) {
	defGUI.addAttArg("name", "defineGUI", "string");
	defGUI.addInitFn(function() {

		var name = this.attArg.name;
		console.log("NEW GUIABLE DEFINED", name, this.domNode);

		if(PINE.GUIABLES[name] === undefined) {
			PINE.GUIABLES[name] = this.domNode;
			this.domNode.remove();	
		}
	});
});









ELATE.create("Comparable", function() {
	this.isAbstract();
	this.compareTo = "abstract";
});


var LinearPositionable = ELATE.create("LinearPositionable", function() {
	

	this.constructor = function(position) {
		this.position = position;
	}

	
});






















