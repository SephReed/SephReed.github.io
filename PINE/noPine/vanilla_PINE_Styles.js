
/************************
*  Style Vars CSS Hack
*  by: Seph Reed
*
*
*   A js way to replace keywords with values in style elements, at your leisure.
*   Keeps track of insertion points to allow updates to key/value pairs without 
*   researching the entire style element
*
*************************/


StyleVars = {};
StyleVars.rules = {};
	StyleVars.rules["lightShadow"] = "rgba(0,0,0,0.1)";
	StyleVars.rules["medShadow"] = "rgba(0,0,0,0.3)";
	StyleVars.rules["heavyShadow"] = "rgba(0,0,0,0.5)";
	StyleVars.rules["testColor"] = "#0FF";

StyleVars.lastID = 0;
StyleVars.mods = [];

StyleVars.setVar = function(keyword, value) {
	for(var key in StyleVars.rules) {
		if(StyleVars.rules[key].includes("keyword")
		|| value.includes("key")) {
			err("Can not include a keyword in a value", keyword, key, value, StyleVars.rules[key]);
			return;
		}
	}

	StyleVars.rules[keyword] = value;

	for(var i = 0; i < StyleVars.mods.length; i++)
		StyleVars.applyVar(StyleVars.mods[i].domNode, keyword);
}

StyleVars.modStyle = function(modMe) {
	

	if(modMe.StyleID === undefined) {
		var ID = modMe.pineStyleID = StyleVars.lastID++;
		mod = StyleVars.mods[ID] = {};	
		mod.domNode = modMe;
		mod.hist = [];
	}

	 
	for(var key in StyleVars.rules) {
		StyleVars.injectVar(modMe, key);
		
	}
	
}


StyleVars.injectVar = function(modMe, key) {
	var ID = modMe.pineStyleID;
	var modHist = StyleVars.mods[ID].hist;
	var replaceWith = StyleVars.rules[key];

	var modHistIndex = 0;
	var currentModOffset = 0;

	// console.log(modMe, key)

	var regex = new RegExp(key, 'g')

	modMe.textContent = modMe.textContent.replace(regex, function(match, offset) {
		// console.log("MATCH FOUND", match, replaceWith)

		while(modHistIndex < modHist.length && offset+currentModOffset > modHist[modHistIndex].virginOffset) {
			currentModOffset += modHist[modHistIndex].modOffset;
			modHistIndex++;
		}

		var addMod = {};
		addMod.virginOffset = offset - currentModOffset;
		//"older" relpaced with "new" = 3 - 5 = -2 offset for all folowing indexes
		addMod.modOffset = replaceWith.length - key.length;
		addMod.key = key;
		addMod.currentLength = replaceWith.length;
		modHist.splice(modHistIndex, 0, addMod);
		modHistIndex++;

		return replaceWith;
	});
}


StyleVars.applyVar = function(styleNode, key) {
	var ID = styleNode.pineStyleID;
	var modHist = StyleVars.mods[ID].hist;
	var replaceWith = StyleVars.rules[key];

	var modHistIndex = 0;
	var currentModOffset = 0;

	// console.log(modHist);

	for(var i = 0; i < modHist.length; i++) {
		var mod = modHist[i];
		if(mod.key == key) {
			styleNode.textContent = styleNode.textContent.slice(0, mod.virginOffset+currentModOffset) 
				+ replaceWith
				+ styleNode.textContent.slice(mod.virginOffset+currentModOffset+mod.currentLength);

			mod.modOffset = replaceWith.length - key.length;
			mod.currentLength = replaceWith.length;
		}

		currentModOffset += mod.modOffset;
	}
}




//apply to all style elemnts on content ready
document.addEventListener("DOMContentReady", function() {
	var styles = document.getElementsByTagName("style");

	for(var i = 0; i < styles.length; i++) {
		StyleVars.modStyle(styles[i]);
	}
});







