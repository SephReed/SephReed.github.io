
		

var FLAT = {};

FLAT.BridgePrefix = ""




FLAT.defaultInit = function(projectName) {
	PINE.ready(function() {

		// var projectName = "test";

		Resources.openProject(projectName)
		.then(Resources.makeProjectSeeable)
		.then(UI.ready)
		.then(function(){
			return UI.displayResources(Resources);
		})
		.then(function(){
			PINE.signalNeedMet("FLAT_DISPLAYED");
		})
	});
}




PINE.signalNeedMet("FLAT");







