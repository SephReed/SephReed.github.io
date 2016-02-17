/**
*

Things start to get a bit kludgy in here
**/





var pnv = PINE.pnv = {};





PINE.pnv.getVarFrom = function(var_name, branch, output)  {

	var searchFor;
	if(output === undefined) {
		output = {};
		output.leaf = branch;

		
		// ((\[")?[\w\d]+("\])?|\[.+\])
		var keyArray = var_name.match(/([\w\d]+|\[.+\])/g);

		searchFor = '';
		for(i in keyArray)  {
			var key = keyArray[i];
			if(key.charAt(0) == '[') {
				key = key.replace(/[\[\]]/g, '');

				// var num;
				// console.log("parse int: "+parseInt(key));
				// if(parseInt(key) == NaN){
					var getVar = pnv.getVarFrom(key, branch);
					if(getVar.hold !== undefined)  {
						output.hold = getVar.hold;
						return output;
					}
					else if(getVar.value !== undefined)  {
						key = getVar.value 
					}
				// }
				// else {
				// 	output.value = key;
				// 	return output;
				// }
				// console.log(key);
				
			}
			
			if(searchFor.length > 0)  searchFor += '.';

			searchFor += key;
			
		}
	}
	else searchFor = var_name;
	

	// console.log("searching for "+searchFor+" in ");	
	// console.log(branch);
	// console.log(U.get(window, searchFor));
	
	if(branch == null)  
		output.value = U.get(window, searchFor);


	var targetVar = U.get(branch, "_pine_.pnv.vars."+searchFor);
	if(targetVar !== undefined) {
		output.value = targetVar;

	}
		

	var targetHold = U.get(branch, "_pine_.pnv.holds."+searchFor);
	if(targetHold == true) 
		output.hold = branch;


	if(output.value !== undefined || output.hold !== undefined || branch == null) 
		return output;
	
	else return pnv.getVarFrom(searchFor, branch.parentNode, output);
}


PINE.registerFunction({
	key : "pine",
	step_type : PINE.STATIC,
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

		    	root.insertBefore(pineVar, postVarTextNode);
			}

			
		}
		else if(nodeName != "#comment")  {
			pnv.parseText(branch, addToMe);
		}
	}

}

PINE.createNeedle("pnv");
PINE.registerFunction({
	key : "pnv",
	step_type : PINE.STATIC,
	fn : function(initMe, needle) {
		var get = initMe.attributes["var"];

		if(get != null)  {

			console.log("setting pnv :")
			console.log(initMe);


			var pinevar = pnv.getVarFrom(get.value, initMe);

			// console.log(pinevar);

			if(pinevar.hold !== undefined) {
				//somethnig?
				console.log("holding var "+get.value);

			}
			else if(pinevar.value !== undefined) {
				initMe.innerHTML = pinevar.value;	
				return;
			}
			//
			else PINE.err("{{"+get.value+"}} === undefined");
			
			
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

				

				// var getAtt = document.createAttribute("var");
				// getAtt.value = get;
				// pineVar.setAttributeNode(getAtt);
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



PINE.createNeedle("[pnvatt]");
PINE.registerFunction({
	key : "[pnvatt]",
	step_type : PINE.STATIC,
	fn : function(initMe, needle) {
		var rules = initMe.attributes["pnvatt"].value;

		//KLUDGE: fix me if you can
		var pairs = rules.split(":+:");
		for(i_p in pairs)  {
			var rule = pairs[i_p].split('=');

			// console.log(rule);

			var outVal = rule[1];

			var matches = outVal.match(/{{.+?}}/g);

			for(i_m in matches)  {
				var key = matches[i_m].replace(/[{}]/g, '');
				// console.log(key);
				var pinevar = pnv.getVarFrom(key, initMe); 
				if(pinevar.hold === undefined)  {
					outVal = outVal.replace(matches[i_m], pinevar.value);
				}
				else {
					console.log("pinevar held");
					return;
				}
			}

			// console.log(outVal);

			// var myRe = ;
			// var myArray;
			// while ((myArray = myRe.exec(outVal.data)) !== null)
			// {
			// 	console.log("found");
			// 	console.log(myArray);
			// 	var pinevar = pnv.getVarFrom(myArray[0].replace(/[{}]/g, ''), initMe); 
				

			// 	// var indexOf = myRe.lastIndex - myArray[0].length;

			// 	// var preVarTextNode = branch;
			// 	// var varTextNode = preVarTextNode.splitText(indexOf);
			// 	// var postVarTextNode = varTextNode.splitText(myArray[0].length);

			// 	// var get = varTextNode.data.replace(/[{}]/g, '');

			// 	// var pineVar = document.createElement("pnv");
			// 	// var getAtt = document.createAttribute("var");
			// 	// getAtt.value = get;
			// 	// pineVar.setAttributeNode(getAtt);
		 //  //   	// pineVar.appendChild(varTextNode);
		 //  //   	varTextNode.remove();

		 //  //   	root.insertBefore(pineVar, postVarTextNode);
			// }





			var setAtt = rule[0];
			// var varName = rule[1].replace(/[{}]/g, '');
			// var setVal = window[varName];
			// initMe.attributes[setAtt].value = setVal;

			initMe.attributes[setAtt].value = outVal;
		}
	}
});