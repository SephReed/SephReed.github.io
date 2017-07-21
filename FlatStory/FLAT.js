
		

var FLAT = {};

FLAT.BridgePrefix = "FLAT.Worlds/"




// FLAT.UIs = {};
// FLAT.UIs.currentUI = undefined;
// FLAT.UIs.byName = {};
// FLAT.UIs.classes = {};

// FLAT.setUI = function(UIName) {
// 	var ui = FLAT.UIs[UIName]
// 	if(ui !== undefined) {
// 		FLAT.currentUI = ui;
// 		ui.baseline();
// 	}

// 	// else err

// }


// FLAT.registerUIClass = function(UIName, UIClass) {
// 	//must inherit from flatUI
// 	FLAT.UIs.classes[UIName] = UIClass;
// }




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










// 		FLAT.Options.modalNode = El.byID("optionsModal");
// 		for(var key in FLAT.Options.panels) {
// 			var panel = FLAT.Options.panels[key];
// 			panel.domNode = El.byID(panel.id);
// 		}




		

// 		
// 	}
// });


PINE.signalNeedMet("FLAT");