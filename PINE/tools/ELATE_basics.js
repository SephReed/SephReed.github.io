

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
		PINE.GUIABLES[name] = this.domNode;
		this.domNode.remove();
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






















