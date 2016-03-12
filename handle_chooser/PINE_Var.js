/**
*

Things start to get a bit kludgy in here

**/





var pnv = PINE.pnv = {};

PINE.class.PineVar = function(i_val) {
	this.val = i_val;
	this.onChange = [];
}




PINE.class.PineVar.prototype.change = function(observer) {
	if(observer === undefined) {
		for (i in this.onChange) 
			this.onChange[i](this);
	}
	else {
		this.onChange.push(observer);
	}
};



PINE.class.PineVar.prototype.removeObserver = function(removeMe)  {
	var target = this.onChange.indexOf(removeMe);

	if(target == -1)
		PINE.err("hold for "+removeMe+" does not exist in "+this.onChange);
	else
		this.onChange.splice(target, 1);
}



PINE.class.PineVar.prototype.val = function() {
	return this.val;
};



PINE.class.PineVar.prototype.setVal = function(i_val) {
	this.val = i_val;
	this.change();
};

// PINE.class.PineVar.v = function(value) {
// 	if(value !== undefined){
// 		this.value = value;
// 		this.change();	
// 	}
// 	else return this.value;
// }



// PINE.class.PineVar.prototype.setVal = function(value) {
	
// }


// PINE.class.PineVar.prototype.addHold = function(holdingDomNode)  {
// 	this.holds.push(holdingDomNode);
// }


// PINE.class.PineVar.prototype.removeHold = function(holdingDomNode)  {
// 	var target = this.holds.indexOf(holdingDomNode);

// 	if(target == -1)
// 		PINE.err("hold for "+holdingDomNode+" does not exist in "+this.holds);
// 	else
// 		this.holds.splice(target, 1);

// 	this.change();
// }


// PINE.class.PineVar.prototype.change = function(observer) {
// 	if(observer === undefined) {
// 		if(this.holds.length == 0)  {
// 			for (i in this.onChange) 
// 				this.onChange[i].call(this.onChange[i], this.value);
// 		}
// 	}
// 	else {
// 		this.onChange.push(observer);
// 	}
// };








PINE.newVar = function(varName, value, domNode) {
	var scope = domNode || window;

	LOG("new var scope", "pnv");
	LOG(scope, "pnv");

	if(scope) {

		if(!scope.PVARS)
			scope.PVARS = {};

		if(scope.PVARS[varName])
			PINE.err("variable "+varName+" already exists in "+domNode)

		else {
			var pnvar = scope.PVARS[varName] = new PINE.class.PineVar();
			if(value !== undefined)
				pnvar.val = value;
			
			return pnvar;
		}
	}
}



pnv.searchForPinevar = function(varName, domNode)  {
	var scope = domNode;
	if(!domNode || !domNode._pine_){
		// console.log("no node");
		scope = window;
	}
	
	// console.log("getting "+varName+" from:"); 
	// console.log(scope);

	if(scope.PVARS && scope.PVARS[varName])
		return scope.PVARS[varName];

	if(scope.parentNode)
		return pnv.getVarFrom(varName, scope.parentNode);

	else return scope[varName];
}



pnv.getVarFrom = function(varName, domNode)  {
	var scope = domNode;
	if(!domNode || !domNode.PVARS)
		scope = window;

	// console.log(varName);
	// console.log(domNode);

	var rootVar;
	var extension;
	for(var c = 0; rootVar == null && c < varName.length; c++) {
		var char = varName.charAt(c);

		if(char == '[' || char == '.') {
			var rootVarName = varName.substring(0, c);
			var extension = varName.substring(c);
			rootVar = pnv.searchForPinevar(rootVarName, domNode);
		} 
	}

	if(rootVar == undefined) {
		rootVar = pnv.searchForPinevar(varName, domNode);
	}

	// console.log(rootVar);
	// console.log(extension);

	if(extension) {
		return U.get(rootVar, extension, function(start, varName){
			// console.log("WOO");
			// console.log(varName);
			return pnv.getVarFrom(varName, domNode);
		});
	}
	else return rootVar;
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
	

	// var scope = domNode;
	// if(!domNode || !domNode.PVARS)
	// 	scope = window;
	 
	// console.log(scope);

	// if(scope.PVARS[varName])
	// 	return scope.PVARS[varName];

	// if(scope.parentNode)
	// 	return PINE.var(varName, scope.parentNode);

	// else return undefined;
}




pnv.needles = {};
pnv.needles["PNV_DEFAULT"] = function(varName, domScope, callback) {
	var pinevar = pnv.getVarFrom(varName, domScope);

	// console.log(varName);
	// console.log(domScope);
	// console.log(pinevar);

	callback(pinevar);


	// if(pinevar !== undefined) {
	// 	if(pinevar.val !== undefined)
	// 		callback(pinevar.val);

	// 	else {
	// 		var observer = function(me)  {
	// 			callback(me.val);
	// 			me.removeObserver(observer);
	// 		};

	// 		pinevar.change(observer);
	// 	}
	// }
	// // else callback(window[varName]);

	// else callback(U.get(window, varName));
}




// PINE.var = function(varName, domNode, value)  {
// 	if(value === undefined) {
// 		pvar = pnv.getVar(varName, domNode);
// 	}
		

// 	else
// 		return;
// }



// pnv.registerVar = function(varName, domScope)  {
// 	var pvars = domScope._pine_.PVARS;
// 	if(pvars[keyName] != null) 
// 		PINE.err("Pine var of name "+varName+" already exists in "+domScope);

// 	else {
// 		pvars[keyName] = new PINE.class.PineVar();
// 		return pvars[keyArray];
// 	}	
// }



// pnv.holdVarInScope = function(varName, domScope)  {
// 	var pvar = domScope._pine_.PVARS[keyName];
// 	if(pvar == null) 
// 		PINE.err("Pine var of name "+varName+" does not exist in "+domScope);
	
// 	else
// 		pvar.addHold(domScope);
// }



// pnv.unholdVarInScope = function(varName, domScope)  {
// 	var pvar = domScope._pine_.PVARS[keyName];
// 	if(pvar == null) 
// 		PINE.err("Pine var of name "+varName+" does not exist in "+domScope);
	
// 	else
// 		pvar.removeHold(domScope);	
// }








// PINE.pnv.getVarFrom = function(var_name, branch, output)  {

// 	var searchFor;
// 	if(output === undefined) {
// 		output = {};
// 		output.leaf = branch;

		
// 		// ((\[")?[\w\d]+("\])?|\[.+\])
// 		var keyArray = var_name.match(/([\w\d]+|\[.+\])/g);

// 		searchFor = '';
// 		for(i in keyArray)  {
// 			var key = keyArray[i];
// 			if(key.charAt(0) == '[') {
// 				key = key.replace(/[\[\]]/g, '');

// 				// var num;
// 				// console.log("parse int: "+parseInt(key));
// 				// if(parseInt(key) == NaN){
// 					var getVar = pnv.getVarFrom(key, branch);
// 					if(getVar.hold !== undefined)  {
// 						output.hold = getVar.hold;
// 						return output;
// 					}
// 					else if(getVar.value !== undefined)  {
// 						key = getVar.value 
// 					}
// 				// }
// 				// else {
// 				// 	output.value = key;
// 				// 	return output;
// 				// }
// 				// console.log(key);
				
// 			}
			
// 			if(searchFor.length > 0)  searchFor += '.';

// 			searchFor += key;
			
// 		}
// 	}
// 	else searchFor = var_name;
	

// 	// console.log("searching for "+searchFor+" in ");	
// 	// console.log(branch);
// 	// console.log(U.get(window, searchFor));
	
// 	if(branch == null)  
// 		output.value = U.get(window, searchFor);


// 	var targetVar = U.get(branch, "_pine_.pnv.vars."+searchFor);
// 	if(targetVar !== undefined) {
// 		output.value = targetVar;

// 	}
		

// 	var targetHold = U.get(branch, "_pine_.pnv.holds."+searchFor);
// 	if(targetHold == true) 
// 		output.hold = branch;


// 	if(output.value !== undefined || output.hold !== undefined || branch == null) 
// 		return output;
	
// 	else return pnv.getVarFrom(searchFor, branch.parentNode, output);
// }





PINE.get("pine").addFunction({
	step_type : PINE.ops.INITIALIZER,
	fn : function(initMe, needle) {
		PINE.pnv.parseText(initMe);
		PINE.pnv.parseAtts(initMe);
	}
});






PINE.pnv.parseText = function(root, addToMe)  {
	if(addToMe === undefined)  {
		// console.log('creating add to me');
		addToMe = [];
	}

	var branches = root.childNodes;

	for(var i = 0; i < branches.length; i++)  {
		var branch = branches[i];
		var nodeName = branch.nodeName;

		if(nodeName == "#text")  {
			var text = branch.data;
			// var watched_vars = text.match( /{{\w+}}/g );



			var myRe = /{{.+?}}/g;
			var myArray;
			while ((myArray = myRe.exec(branch.data)) !== null)
			{
				var indexOf = myRe.lastIndex - myArray[0].length;

				var preVarTextNode = branch;
				var varTextNode = preVarTextNode.splitText(indexOf);
				var postVarTextNode = varTextNode.splitText(myArray[0].length);

				var get = varTextNode.data.replace(/[{}]/g, '');

				var pineVar = document.createElement("pnv");
				var getAtt = document.createAttribute("var");
				getAtt.value = get;
				pineVar.setAttributeNode(getAtt);
		    	// pineVar.appendChild(varTextNode);
		    	varTextNode.remove();

		    	// PINE.initiate(pineVar);

		    	root.insertBefore(pineVar, postVarTextNode);
			}

			
		}
		else if(nodeName != "#comment")  {
			pnv.parseText(branch, addToMe);
		}
	}

}






PINE.createNeedle("pnv").addFunction({
	step_type : PINE.ops.FINALIZER,
	fn : function(initMe, needle) {
		var get = initMe.attributes["var"];

		if(get != null)  {


			// pnv.assignValTo

			// console.log("setting pnv :")
			// console.log(initMe);


			PINE.var(get.value, initMe, function(val) {
				// console.log(val);
				initMe.innerHTML = val;	
			});
			


			// console.log(pinevar);

			// if(pinevar.hold !== undefined) {
			// 	//somethnig?
			// 	console.log("holding var "+get.value);

			// }
			// else if(pinevar.value !== undefined) {
			// 	initMe.innerHTML = pinevar.value;	
			// 	return;
			// }
			// //
			// else PINE.err("{{"+get.value+"}} === undefined");

			// if(pinevar !== undefined)  {
			// 	console.log(pinevar);

			// 	if(pinevar.value !== undefined) {
			// 		initMe.innerHTML = pinevar.value;	
			// 		return;
			// 	}
			// 	else {
			// 		pinevar.change(function(value) {
			// 			if(value !== undefined) {
			// 				initMe.innerHTML = value;
			// 				// target = this.onChange.indexOf(this)
			// 			}
			// 		});
			// 	}
			// }
			
		}
	}
});










PINE.pnv.parseAtts = function(root, addToMe)  {
	var pnvatt = root.attributes.pnvatt;

	for(i = 0; i < root.attributes.length; i++)  {
		var att = root.attributes[i];

		if(att != pnvatt)  {
			var watched_vars = att.value.match( /{{.+?}}/g );
			if(watched_vars)  {
				// console.log(att);	

				if(pnvatt == null)  {
					pnvatt = document.createAttribute("pnvatt");
					root.setAttributeNode(pnvatt);
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

	var branches = root.childNodes;

	for(var i = 0; i < branches.length; i++)  {
		var branch = branches[i];
		var nodeName = branch.nodeName;

		if(nodeName!="#text" && nodeName!="#comment")  {
			pnv.parseAtts(branch, addToMe);
		}
	}
}









PINE.createNeedle("[pnvatt]").addFunction({
	step_type : PINE.ops.FINALIZER,
	fn : function(initMe, needle) {
		// console.log(initMe);
		var rules = initMe.attributes["pnvatt"].value;

		//KLUDGE: fix me if you can
		var pairs = rules.split(":+:");
		for(i_p in pairs)  {

			var rule = pairs[i_p].split('=');
			var outVal = rule[1];
			var matches = outVal.match(/{{.+?}}/g);

			for(i_m in matches)  {
				var key = matches[i_m].replace(/[{}]/g, '');
				// console.log(key);
				// var pinevar = pnv.getVarFrom(key, initMe); 
				// if(pinevar.hold === undefined)  {
				// 	outVal = outVal.replace(matches[i_m], pinevar.value);
				// }
				// else {
				// 	console.log("pinevar held");
				// 	return;
				// }
			}

			var setAtt = rule[0];

			initMe.attributes[setAtt].value = outVal;
		}
	}
});