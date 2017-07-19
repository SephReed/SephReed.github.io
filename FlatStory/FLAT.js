
		

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












// PINE.ready(function() {

// 	return;
// 	// BRIDGE.defaultPrefix = "FLAT.Worlds";

// 	PINE.signalNeedReady("appDom");





// 	if(true) {



// 		// Resources.openProject("test")
// 		// .then(Resources.drawProject)
// 		// .then(Draw.ready)
// 		// .then(function(){

// 		// 	// console.log(FLAT.currentProject);
// 		// 	// var dCanvas = FLAT.currentProject.currentMap.GUI.layerGraphics[0];

// 		// 	// Draw.setDrawCanvas(dCanvas);

// 		// 	// FLAT.drawArea = El.firstOfTag(null, "drawArea");
// 		// 	// Draw.Tools.domNode = El.firstOfTag(null, "drawTools");
// 		// 	// Draw.Tools.setIconSet("public/images/icons/icons_tools.png");

// 		// 	PINE.signalNeedMet("FLAT_DISPLAYED");
// 		// });




// 		Resources.openProject("test")
// 		.then(Resources.makeProjectSeeable)
// 		.then(UI.evolveUI)
// 		.then(function(){
// 			PINE.signalNeedMet("FLAT_DISPLAYED");
// 		})
// 		// .then(Draw.ready)
// 		// .then(function(){

// 		// 	var mapNode = Resources.currentProject.currentMap.domNode;
// 		// 	El.firstOfTag(null, "canvasStack").appendChild(mapNode);

// 		// 	FLAT.drawArea = El.firstOfTag(null, "drawArea");

// 		// 	Draw.Tools.domNode = El.firstOfTag(null, "drawTools");
// 		// 	Draw.Tools.setIconSet("public/images/icons/icons_tools.png");

// 		// 	PINE.signalNeedMet("FLAT_DISPLAYED");
// 		// });

// 	}









// 	else {


// 		FLAT.Pallette.domNode = El.firstOfTag(null, "pallette");
// 		FLAT.World.domNode = El.firstOfTag(null, "canvasStack");
// 		Draw.Tools.domNode = El.firstOfTag(null, "drawTools");
// 		FLAT.drawArea = El.firstOfTag(null, "drawArea");
// 		FLAT.fileBrowser = El.byID("mainFileBrowser");
// 		FLAT.tempMessage = El.firstOfTag(null, "userTextFeedback").FNS.tempConsoleAddMessage;


// 		FLAT.Options.modalNode = El.byID("optionsModal");
// 		for(var key in FLAT.Options.panels) {
// 			var panel = FLAT.Options.panels[key];
// 			panel.domNode = El.byID(panel.id);
// 		}


// 		var chipUrl = chipSetUrls[~~(Math.random()*chipSetUrls.length)];

// 		FLAT.Pallette.setChipSet(chipUrl, 16, 3)
// 		.then(createWorld)
// 		.then(function() {
// 			return BRIDGE.loadFile("map.txt");

// 		}).then(function(request){
// 			var mapPackage = request.response;
// 			// console.log("loaded!", mapPackage);
// 			if(mapPackage.length > 0)
// 				CURRENT_LAYER.unpackageMap(mapPackage);
// 			else
// 				CURRENT_LAYER.unpackageMap(START_MAP);

// 			PINE.signalNeedMet("FLAT_DISPLAYED");
// 		});	

// 		// document.body.addEventListener("mousedown", function() {
// 		// 	document.body.mozRequestFullScreen();
// 		// });
		
// 		Draw.Tools.setIconSet("public/images/icons/icons_tools.png");

// 		document.body.addEventListener("keydown", function(event) {
// 			Tools.keydown(event.key);
// 		});

// 		document.body.addEventListener("keyup", function(event) {
// 			Tools.keyup(event.key);
// 		});


		

// 		var NO_OVERRIDE = "ntqr";


// 		document.addEventListener("keydown", function(e) {
// 			console.log(e);

// 			var metaKeyDown;
// 			if(NO_OVERRIDE.indexOf(e.key) !== -1)
// 				metaKeyDown = e.altKey || e.ctrlKey;

// 			else
// 				metaKeyDown = (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey);

// 			if(metaKeyDown && e.key !== "Meta") {

// 				if(navigator.platform.match("Mac")) {
// 					// e.preventDefault();
// 					FLAT.tempMessage("<b>Careful there!</b><br>  Using CMD is likely to trigger a hotkey.  Use CTRL instead.<br><br> If you'd like to be able to use normal hotkeys, please visit <a href='http://sephreed.github.io/disqus/requestHotkeyPriority.html' target='_blank'>this link</a>", true, 4)
// 				}


// 				if (e.key == "s") {
// 				    e.preventDefault();
// 				    var saveMe = CURRENT_LAYER.packageMap();
// 				    // console.log("saveMe", saveMe);
// 				    BRIDGE.saveFile("map.txt", saveMe).then(function(request) {
// 				    	FLAT.tempMessage("File 'map.txt' saved successfully!");
// 				    });
// 				}

// 				else if (e.key == "o") {
// 				    e.preventDefault();
// 				    // FLAT.fileBrowser.FNS.showModal();
// 				    FLAT.Options.showPanel("projectProperties");
// 				}

// 				else if (e.key == "n") {
// 				    e.preventDefault();
// 				    FLAT.Options.showPanel("projectProperties");
// 				}
// 			}
// 			else {
// 				var num = parseInt(e.key);

// 				if(num > 0 && Tools.iconOrder[1].length) {
// 					Tools.setTool(Tools.iconOrder[num-1]);
// 				} 
				

// 			}

// 		}, false);
// 	}
// });


PINE.signalNeedMet("FLAT");