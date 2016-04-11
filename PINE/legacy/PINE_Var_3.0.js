/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*                 4.0       /\
*          by: Seph Reed   X  X
*                           \/
*
********************************************/





var pnv = PINE.pnv = {};

// PINE.class.PineVar = function(i_val) {
// 	this.val = i_val;
// 	this.onChange = [];
// }




// PINE.class.PineVar.prototype.change = function(observer) {
// 	if(observer === undefined) {
// 		for (i in this.onChange) 
// 			this.onChange[i](this);
// 	}
// 	else {
// 		this.onChange.push(observer);
// 	}
// };



// PINE.class.PineVar.prototype.removeObserver = function(removeMe)  {
// 	var target = this.onChange.indexOf(removeMe);

// 	if(target == -1)
// 		PINE.err("hold for "+removeMe+" does not exist in "+this.onChange);
// 	else
// 		this.onChange.splice(target, 1);
// }



// PINE.class.PineVar.prototype.val = function() {
// 	return this.val;
// };



// PINE.class.PineVar.prototype.setVal = function(i_val) {
// 	this.val = i_val;
// 	this.change();
// };







// PINE.newVar = function(varName, value, domNode) {
// 	var scope = domNode || window;

// 	LOG("new var scope", "pnv");
// 	LOG(scope, "pnv");

// 	if(scope) {

// 		if(!scope.PVARS)
// 			scope.PVARS = {};

// 		if(scope.PVARS[varName])
// 			PINE.err("variable "+varName+" already exists in "+domNode)

// 		else {
// 			var pnvar = scope.PVARS[varName] = new PINE.class.PineVar();
// 			if(value !== undefined)
// 				pnvar.val = value;
			
// 			return pnvar;
// 		}
// 	}
// }



pnv.searchForPinevar = function(varName, domNode)  {
	// var scope = domNode;
	// if(!domNode || !domNode._pine_){
	// 	// console.log("no node");
	// 	scope = window;
	// }

	var scope = (domNode && domNode._pine_) ? domNode : window;
	
	// console.log("getting "+varName+" from:"); 
	// console.log(scope);

	if(scope.PVARS && scope.PVARS[varName] !== undefined)
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

	// console.log(domNode.PVARS);

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

	callback(pinevar);
}





PINE.initiationFuncs.push(function(root) {
	PINE.pnv.parseText(root);
	PINE.pnv.parseAtts(root);
});






PINE.pnv.parseText = function(root)  {


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
			pnv.parseText(branch);
		}
	}

}






PINE.createNeedle("pnv").addFunction({
	step_type : PINE.ops.FINALIZER,
	fn : function(initMe, needle) {
		var get = initMe.attributes["var"];

		if(get != null)  {

			PINE.var(get.value, initMe, function(val) {
				initMe.innerHTML = val;	
			});
			
		}
	}
});










PINE.pnv.parseAtts = function(root)  {

	if(root.attributes === undefined)  return;

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
			pnv.parseAtts(branch);
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

			// console.log(pairs[i_p]);

			var splitPoint = pairs[i_p].indexOf("=");
			// var rule = pairs[i_p].split('=', 2);

			// console.log(rule);

			var setAtt = pairs[i_p].substring(0, splitPoint);
			var outVal = pairs[i_p].substring(splitPoint+1);
			var matches = outVal.match(/{{.+?}}/g);

			for(i_m in matches)  {
				

				var replaceMe = matches[i_m];

				var key = matches[i_m].replace(/[{}]/g, '');
				var addMe = pnv.getVarFrom(key, initMe); 

				outVal = outVal.replace(replaceMe, addMe);

			}

			

			initMe.attributes[setAtt].value = outVal;
		}
	}
});