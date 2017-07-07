
PINE.StyleVars = {};
PINE.StyleVars.rules = {};
	PINE.StyleVars.rules["lightShadow"] = "rgba(0,0,0,0.1)";
	PINE.StyleVars.rules["medShadow"] = "rgba(0,0,0,0.3)";
	PINE.StyleVars.rules["heavyShadow"] = "rgba(0,0,0,0.5)";

PINE.StyleVars.lastID = 0;
PINE.StyleVars.mods = [];

PINE.StyleVars.setVar = function(keyword, value) {
	for(var key in PINE.StyleVars.rules) {
		if(PINE.StyleVars.rules[key].includes("keyword")
		|| value.includes("key")) {
			PINE.err("Can not include a keyword in a value", keyword, key, value, PINE.StyleVars.rules[key]);
			return;
		}
	}

	PINE.StyleVars.rules[keyword] = value;

	for(var i = 0; i < PINE.StyleVars.mods.length; i++)
		PINE.StyleVars.applyVar(PINE.StyleVars.mods[i].domNode, keyword);
}

PINE.StyleVars.modStyle = function(modMe) {
	if(El.attr(modMe, "noMod") == undefined) {

		if(modMe.pineStyleID === undefined) {
			var ID = modMe.pineStyleID = PINE.StyleVars.lastID++;
			mod = PINE.StyleVars.mods[ID] = {};	
			mod.domNode = modMe;
			mod.hist = [];
			mod.injects = []
		}

		 
		for(var key in PINE.StyleVars.rules) {
			PINE.StyleVars.applyVar(modMe, key);
			
		}
	}
}


PINE.StyleVars.injectVar = function(modMe, key) {
	
	var ID = modMe.pineStyleID;
	var mods = PINE.StyleVars.mods[ID];
	mods.injects.push(key);

	var modHist = mods.hist;
	var replaceWith = PINE.StyleVars.rules[key];

	var modHistIndex = 0;
	var currentModOffset = 0;

	// console.log(modMe, key)

	//matches everything to colon and up to value, value is captured as non ; or \n
	var valuex = "[\\s:]+([^;\\n]*)"
	var regex = new RegExp("--"+key+valuex, 'g')

	modMe.textContent = modMe.textContent.replace(regex, function(match, value, offset) {
		// console.log("MATCH FOUND", match, replaceWith)

		while(modHistIndex < modHist.length && offset+currentModOffset > modHist[modHistIndex].virginOffset) {
			currentModOffset += modHist[modHistIndex].modOffset;
			modHistIndex++;
		}

		var addMod = {};

		var valueOffset = 0;
		var out = match.replace(value, function(match, offset) {
			valueOffset = offset;
			//"older" relpaced with "new" = 3 - 5 = -2 offset for all folowing indexes;
			addMod.modOffset = replaceWith.length - value.length;
			return replaceWith; 
		});


		
		addMod.virginOffset = (offset + valueOffset)- currentModOffset;
		
		
		addMod.key = key;
		addMod.currentLength = replaceWith.length;
		modHist.splice(modHistIndex, 0, addMod);
		modHistIndex++;

		return out;
	});

	// console.log(modHist);
}


PINE.StyleVars.applyVar = function(styleNode, key) {

	

	var ID = styleNode.pineStyleID;
	var mods = PINE.StyleVars.mods[ID];
	if(mods.injects.indexOf(key) == -1) {
		PINE.StyleVars.injectVar(styleNode, key);
	}
	else {
		var modHist = mods.hist;
		var replaceWith = PINE.StyleVars.rules[key];

		var modHistIndex = 0;
		var currentModOffset = 0;

		console.log(modHist);

		for(var i = 0; i < modHist.length; i++) {
			var mod = modHist[i];
			if(mod.key == key) {
				styleNode.textContent = styleNode.textContent.slice(0, mod.virginOffset+currentModOffset) 
					+ replaceWith
					+ styleNode.textContent.slice(mod.virginOffset+currentModOffset+mod.currentLength);

				mod.modOffset += replaceWith.length - mod.currentLength;
				mod.currentLength = replaceWith.length;
			}

			currentModOffset += mod.modOffset;
		}
	}
}


PINE.createNeedle("[easyStyleVar]", function() {
	this.addOp(function(state) {
		PINE.StyleVars.modStyle(state.domNode);
	});
});


// U.docReady(function() {
// 	var styles = document.getElementsByTagName("style");
// 	console.log("STYLES", styles, styles.length);

// 	PINE.StyleVars.modStyle(styles[0]);

	
// });






