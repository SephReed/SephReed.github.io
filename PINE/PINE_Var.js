/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*                 4.2       /\
*          by: Seph Reed   X  X
*                           \/
*
********************************************/


"use strict"


var pnv = PINE.pnv = {};




PINE.Needle('*').addFunction( PINE.ops.INIT, function(initMe) {
	var childNodes = initMe.childNodes;
	for(var ch in childNodes) {
		var child = childNodes[ch];
		if(child.nodeName == "#text")  
			pnv.parseText(child);
	}

	pnv.parseAtts(initMe);	
});





PINE.pnv.parseText = function(initMe)  {
	var text = initMe.data;

	var myRe = /{{.+?}}/g;
	var myArray;
	while ((myArray = myRe.exec(initMe.data)) !== null)
	{
		var indexOf = myRe.lastIndex - myArray[0].length;

		var preVarTextNode = initMe;
		var varTextNode = preVarTextNode.splitText(indexOf);
		var postVarTextNode = varTextNode.splitText(myArray[0].length);

		var get = varTextNode.data.replace(/[{}]/g, '');

		var pineVar = document.createElement("pnv");
		El.attr(pineVar, "var", get);
    	varTextNode.remove();

    	initMe.parentNode.insertBefore(pineVar, postVarTextNode);
	}
}





PINE.pnv.parseAtts = function(initMe)  {
	var pnvatt = initMe.attributes.pnvatt;

	for(var i = 0; i < initMe.attributes.length; i++)  {
		var att = initMe.attributes[i];

		if(att != pnvatt)  {
			var watched_vars = att.value.match( /{{.+?}}/g );
			if(watched_vars)  {
				if(pnvatt == null)  {
					pnvatt = document.createAttribute("pnvatt");
					initMe.setAttributeNode(pnvatt);
				}

				if(pnvatt.value.length > 0)  {
					//KLUDGE: fix me if you can
					pnvatt.value += ":+:";
				}

				// pnvatt.value += att.name+"="+watched_vars[0];
				pnvatt.value += att.name+"="+att.value;
				att.value = "";

			}
		}
		
	}

}






PINE.createNeedle("pnv").addFunction( PINE.ops.STATIC, function(initMe, needle) {
	var get = El.attr(initMe, "var");

	if(get != null)  {
		PINE.var(get, initMe, function(val) {
			initMe.innerHTML = val;	
		});
	}
});









PINE.createNeedle("[pnvatt]").addFunction( PINE.ops.STATIC, function(initMe, needle) {
		//
	var rules = initMe.attributes["pnvatt"].value;

	//KLUDGE: fix me if you can
	var pairs = rules.split(":+:");
	for(var i_p in pairs)  {

		// console.log(pairs[i_p]);

		var splitPoint = pairs[i_p].indexOf("=");
		// var rule = pairs[i_p].split('=', 2);

		// console.log(rule);

		var setAtt = pairs[i_p].substring(0, splitPoint);
		var outVal = pairs[i_p].substring(splitPoint+1);
		var matches = outVal.match(/{{.+?}}/g);

		for(var i_m in matches)  {
			var replaceMe = matches[i_m];

			var key = matches[i_m].replace(/[{}]/g, '');
			var addMe = pnv.getVarFrom(key, initMe); 

			outVal = outVal.replace(replaceMe, addMe);
		}

		
		initMe.attributes[setAtt].value = outVal;
	}
	
});




PINE.nodeScopedVar = function(domNode, varName) {
	return pnv.getVarFrom(varName, domNode);
}


pnv.getVarFrom = function(keyArrayOrName, currentNode, superRoot)  {
		//
	//set pvars locations and default currentNode to window if outside the scope of PINE Vars
	var pvars;
	if(!currentNode || !currentNode.PVARS)
		pvars = currentNode = window;
	else
		pvars = currentNode.PVARS;

	//if there is no super root, set it to this node.  All nested variables ie not_nested[nested] will be
	//searched for from this root
	if(superRoot === undefined)
		superRoot = currentNode;

	//if a string was given instead of a keyarray, convert the string
	var keyArray;
	if(typeof keyArrayOrName == "string")
		keyArray = U.stringToVariableLayers(keyArrayOrName, true);
	else
		keyArray = keyArrayOrName;

	LOG("pnv", currentNode, keyArray);

	//if the keyArray is not null
	//check that the first entry is in fact a string, err if not
	//check if this node has the string as a property.  if it does, go for it
	//if this object does not have the property and there is a parent, check the parent
	//in all fail cases return undefined
	if(keyArray.length > 0) {
		if(typeof keyArray[0] != "string") 
			PINE.err("first attribute of "+keyarray+" is not a string");

		if(pvars.hasOwnProperty(keyArray[0])) {
			return U.getnit(pvars, keyArray, undefined, function(keyArray) {
				return pnv.getVarFrom(keyArray, superRoot);
			});
		}

		else if(currentNode.parentNode !== undefined) {
			return pnv.getVarFrom(keyArray, currentNode.parentNode, superRoot);
		}
	}

	return undefined;
}



// pnv.getVarFrom = function(varName, domNode)  {

// 	var scope = domNode;
// 	if(!domNode || !domNode.PVARS)
// 		scope = window;


// 	LOG("pnv", varName, domNode, domNode.PVARS);

// 	var rootVar;
// 	var extension;
// 	for(var c = 0; rootVar == null && c < varName.length; c++) {
// 		var char = varName.charAt(c);

// 		if(char == '[' || char == '.') {
// 			var rootVarName = varName.substring(0, c);
// 			var extension = varName.substring(c);
// 			rootVar = pnv.searchForPinevar(rootVarName, domNode);
// 		} 
// 	}

// 	if(rootVar == undefined) {
// 		rootVar = pnv.searchForPinevar(varName, domNode);
// 	}

	

// 	if(extension) {
// 		LOG("pnv", "root and extension ", rootVar, extension);
// 		return U.get(rootVar, extension, function(start, varName){
// 			return pnv.getVarFrom(varName, domNode);
// 		});
// 	}
// 	else return rootVar;
// }




pnv.searchForPinevar = function(varName, domNode)  {
	// var scope = domNode;
	// if(!domNode || !domNode._pine_){
	// 	// console.log("no node");
	// 	scope = window;
	// }

	var scope = (domNode && domNode.PVARS) ? domNode : window;
	
	// console.log("getting "+varName+" from:"); 
	// console.log(scope);

	if(scope.PVARS && scope.PVARS.hasOwnProperty(varName))
		return scope.PVARS[varName];

	if(scope.parentNode)
		return pnv.getVarFrom(varName, scope.parentNode);

	else {
		// console.log(scope, varName, scope[varName]);
		return scope[varName];
	}
}




PINE.var = function(varName, domScope, callback)  {
	// console.log("HHEY"+varName);
	var args = varName.split(' ', 1);
	// console.log(args);

	var vneedle = pnv.needles[args[0]];

	if(vneedle) 
		vneedle(varName, domScope, callback);

	else
		pnv.needles.PNV_DEFAULT(varName, domScope, callback);
}




pnv.needles = {};
pnv.needles["PNV_DEFAULT"] = function(varName, domScope, callback) {
	var pinevar = pnv.getVarFrom(varName, domScope);

	callback(pinevar);
}












