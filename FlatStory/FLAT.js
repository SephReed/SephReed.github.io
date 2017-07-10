
		

var FLAT = {};

FLAT.BridgePrefix = "FLAT.Worlds/"

FLAT.Draw = {};
var Tools = FLAT.Draw.Tools = {};

var chipSetUrls = ["chipset01.png"];







PINE.ready(function() {
	// BRIDGE.defaultPrefix = "FLAT.Worlds";


	var testRand = Math.random();


	if(testRand > 0.5) {

		Resources.openProject("test")
		.then(Resources.drawProject)
		.then(function(project) {
			console.log(project);
			var addMe = project.currentMap.GUI.domNode;
			var stack = El.firstOfTag(null, "canvasStack");
			stack.appendChild(addMe);

			stack.style.width = project.currentMap.width * 3 * 16;
			stack.style.height = project.currentMap.height * 3 * 16;
		});

	}









	else {


		FLAT.Pallette.domNode = El.firstOfTag(null, "pallette");
		FLAT.World.domNode = El.firstOfTag(null, "canvasStack");
		Tools.domNode = El.firstOfTag(null, "drawTools");
		FLAT.drawArea = El.firstOfTag(null, "drawArea");
		FLAT.fileBrowser = El.byID("mainFileBrowser");
		FLAT.tempMessage = El.firstOfTag(null, "userTextFeedback").FNS.tempConsoleAddMessage;


		FLAT.Options.modalNode = El.byID("optionsModal");
		for(var key in FLAT.Options.panels) {
			var panel = FLAT.Options.panels[key];
			panel.domNode = El.byID(panel.id);
		}


		var chipUrl = chipSetUrls[~~(Math.random()*chipSetUrls.length)];

		FLAT.Pallette.setChipSet(chipUrl, 16, 3)
		.then(createWorld)
		.then(function() {
			return BRIDGE.loadFile("map.txt");

		}).then(function(request){
			var mapPackage = request.response;
			// console.log("loaded!", mapPackage);
			if(mapPackage.length > 0)
				CURRENT_LAYER.unpackageMap(mapPackage);
			else
				CURRENT_LAYER.unpackageMap(START_MAP);
		});	

		// document.body.addEventListener("mousedown", function() {
		// 	document.body.mozRequestFullScreen();
		// });
		
		Tools.setIconSet("public/images/icons/icons_tools.png");

		document.body.addEventListener("keydown", function(event) {
			Tools.keydown(event.key);
		});

		document.body.addEventListener("keyup", function(event) {
			Tools.keyup(event.key);
		});


		

		var NO_OVERRIDE = "ntqr";


		document.addEventListener("keydown", function(e) {
			console.log(e);

			var metaKeyDown;
			if(NO_OVERRIDE.indexOf(e.key) !== -1)
				metaKeyDown = e.altKey || e.ctrlKey;

			else
				metaKeyDown = (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey);

			if(metaKeyDown && e.key !== "Meta") {

				if(navigator.platform.match("Mac")) {
					// e.preventDefault();
					FLAT.tempMessage("<b>Careful there!</b><br>  Using CMD is likely to trigger a hotkey.  Use CTRL instead.<br><br> If you'd like to be able to use normal hotkeys, please visit <a href='http://sephreed.github.io/disqus/requestHotkeyPriority.html' target='_blank'>this link</a>", true, 4)
				}


				if (e.key == "s") {
				    e.preventDefault();
				    var saveMe = CURRENT_LAYER.packageMap();
				    // console.log("saveMe", saveMe);
				    BRIDGE.saveFile("map.txt", saveMe).then(function(request) {
				    	FLAT.tempMessage("File 'map.txt' saved successfully!");
				    });
				}

				else if (e.key == "o") {
				    e.preventDefault();
				    // FLAT.fileBrowser.FNS.showModal();
				    FLAT.Options.showPanel("projectProperties");
				}

				else if (e.key == "n") {
				    e.preventDefault();
				    FLAT.Options.showPanel("projectProperties");
				}
			}
			else {
				var num = parseInt(e.key);

				if(num > 0 && Tools.iconOrder[1].length) {
					Tools.setTool(Tools.iconOrder[num-1]);
				} 
				

			}

		}, false);
	}
});


