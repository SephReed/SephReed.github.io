
U.attr = function(domNode, name, value) {
	var target = domNode.attributes[name];

	if(target == null){
		if(value === undefined)
			return undefined;
		else return null;
			//create the attribute and assign value
	}
	else {
		if(value === undefined)
			return target.value;
		else
			target.value = value;
	}
}



PINE.createNeedle("[trigger]").addFunction({
	step_type: PINE.ops.FINALIZER,
	fn: function(initMe, needle) {
		var triggerType = initMe.attributes.trigger.value;


		initMe.addEventListener(triggerType, function() {
			var target = initMe.attributes.target.value;
			var fn = initMe.attributes.fn.value;
			var args = U.attr(initMe, "args");

			$(target).each(function() {
				this._pine_.fns[fn]();
			});
		}, false);
	}
});












var spawner = PINE.createNeedle("[spawner]");

spawner.addFunction({
	step_type : PINE.ops.INITIALIZER,
	topToBottog : true,
	fn : function(initMe, needle) {

		var indexer = U.attr(initMe, "indexer") || "i";

		U.assertKey(initMe, "_pine_.spawner");
		initMe._pine_.spawner.indexer = indexer;
		
		var branches = initMe.childNodes;
		var spawn = null;
		for(var i = 0; i < branches.length && !spawn; i++)  {
			var branch = branches[i];
			var atts = branch.attributes;

			for(var i_att = 0; atts && i_att < atts.length && !spawn; i_att++)  {
				if("spawn" == atts[i_att].name)  {
					spawn = branch;	
				}
			}
		}
		if(spawn)  {
			initMe._pine_.spawner.spawn = spawn;
			initMe.removeChild(spawn);
		}



		PINE.addFunctionToNode(initMe, "update", function() {
			needle.update(initMe);
		});

	}
});


spawner.addFunction({
	step_type : PINE.ops.POPULATER,
	fn : function(initMe, needle) {
		needle.update(initMe);
	}
});


spawner.update = function(initMe) {
	var keyString = initMe.attributes.spawner.value;
	var array = pnv.getVarFrom(keyString, initMe);

	var spawn = initMe._pine_.spawner.spawn;

	if(spawn){
		while (initMe.lastChild) {
		    initMe.removeChild(initMe.lastChild);
		}


		var indexer = initMe._pine_.spawner.indexer;

		for(i in array)  {
			var i = i;

			var addMe = PINE.deepCloneNode(spawn);
			U.getnit(addMe, "PVARS."+indexer, i);
			
			addMe.setAttribute("scopeVar", indexer+'='+i);

			initMe.appendChild(addMe);
		}

		PINE.updateAt(initMe);
	}
}








// PINE.createNeedle("showHtml").addFunction({
// 	step_type : PINE.PREPROCESS,
// 	// continuous : true,
// 	fn : function(initMe, needle) {


// 		initMe.innerHTML = exitHtml(initMe.innerHTML);
// 	}
// });

// PINE.createNeedle("[showHtml]").addFunction({
// 	step_type : PINE.PREPROCESS,
// 	// continuous : true,
// 	fn : function(initMe, needle) {

// 		console.log("showingHtml");
// 		initMe.innerHTML = exitHtml(initMe.innerHTML);
// 	}
// });























PINE.ajaxGetSrc = function(initMe, needle, callback) {
	var src = initMe.attributes.src;
	
	if(src != null) {

		var target = src.value;
		// console.log(window.location.hostname);
		// console.log("ajax get: "+target);

		if(target.indexOf("..") == 0) {
			// \w+\/[\w|\.]+$
			var location = window.location.toString().replace(/\w+\/[\w|\.]+$/g, '');
			var extension = target.replace("../", '');
			target = location+extension;
		}



		if(needle.includeBank[target] == null)  {
			needle.includeBank[target] = {};

			var request = new XMLHttpRequest();
			request.responseType = 'text';
			request.open('GET', target, true);

			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
				    // Success!
				    var response = request.responseText;
				    needle.includeBank[target].outerHTML = response;
				    callback(target);
				} else {
				    // We reached our target server, but it returned an error
				    PINE.err("include src '"+target+"' does not exist")
				}
			};



			request.onerror = function() {
			  	// There was a connection error of some sort
			  	PINE.err("include src '"+target+"' does not exist")
			};

			request.send();
		}			
		else callback(target);



	}

	else PINE.err("include src for "+initMe+" in not set");
}




var p_include = PINE.createNeedle("include");
p_include.includeBank = {};

p_include.addFunction({
	step_type : PINE.ops.STATIC,
	autoComplete : false,
	fn: function(initMe, needle) {

		var pineFunc = this;

		function doInclude(target) {

			if(needle.includeBank[target].outerHTML == null)  {
				setTimeout(function(){ doInclude(target) }, 10);
			}
			else  {
				initMe.innerHTML = needle.includeBank[target].outerHTML;

				//FUCKING KLUDGE;
				if(PINE.pnv) {
					PINE.pnv.parseText(initMe);
					PINE.pnv.parseAtts(initMe);
				}

				var localVars = U.evalElementScripts(initMe);

				U.assertKey(initMe, "PVARS");
				for(key in localVars)  {
					initMe.PVARS[key] = localVars[key];
				}

				pineFunc.complete();
			}
		}

		PINE.ajaxGetSrc(initMe, needle, doInclude);

	}
});






//TODO : make sure variables defined a second time are not touched
U.evalElementScripts = function(initMe) {

	//if previously evaluated, throw an error
	// if(initMe._pine_.previouslyEvaled === true) {
	// 	PINE.err("element previously evaled");
	// 	PINE.err(initMe);
	// }

	//create a new object for all the local variables of this eval to be stored in
	var evalIndex = PINE.evals.length;
	PINE.evals[evalIndex] = {};
	var evalPrefix = "PINE.evals["+evalIndex+"].";


	
	var localVars = [];
	var scripts = initMe.getElementsByTagName("script");
		//
	//go through every item with a script tag
	for(var s = 0; s < scripts.length; s++)  {

		//check for anything that is either within brackets {} or starts with var
		var rex = /(var.+(;|\n)|(\{(.|\n)+?\}))/g;
		var localVarRex = scripts[s].innerHTML.match(rex);

		//if any of the results aren't brackets, get the var name and add it to list of local vars
		for(i in localVarRex)  {
			var match = localVarRex[i];
			if(match.charAt(0) != '{') {
				var var_name = match.replace(/(var +|( ?)+=.+\n?)/g, '');
				
				var_name = var_name.replace(/[\n\r;]/g, '');
				localVars.push(var_name);
			}
		}
	}




	//go through all the scripts again
	for(var s = 0; s < scripts.length; s++) {

		//get the code and check it for local variables
		//if a local variable is found, append the evalPrefix so it is stored globally instead
		var textToEval = scripts[s].innerHTML;
		for(i in localVars)  {
			var match = localVars[i];
			var replace = evalPrefix+match;

			
			var noVarZones = "\\/\\*\\*.*?\\*\\/";  	/**multiline comment*/
				noVarZones += "|" + "\\/\\/.*?\\n";  	//single line comment
				noVarZones += "|" + "'.*?'"			//'string'
				noVarZones += "|" + "\".*?\""		//"string"
			//match anything that has the name of the variable without a dot or letter before it
			//this is the trolliest regex I've ever used
			var rex = new RegExp(noVarZones+"|(var)?([^\\.\\/\\\\\\w]|^)"+match, "g");
			// console.log(rex);

			textToEval = textToEval.replace(rex, function(replaceMe) {
				var char = replaceMe.charAt(0);
				var out = replaceMe;

				if(char != "\/" && char != "'" && char != "\"") {
					out = replace;
					//special case for not "var some_name" ie "some_name = 'joe'"
					if(char != 'v')
						out = replaceMe.charAt(0)+out;

				}

				return out;
			});
		}

		//once all local variables have been renamed to be stored globally, proceed with eval
		// console.log(textToEval);
		eval(textToEval);
	}

	// initMe._pine_.previouslyEvaled = true;

	return PINE.evals[evalIndex];
}



U.evalElementStyles = function(initMe) {
	var addMe = document.createElement('style');
	addMe.type = 'text/css';
	addMe.innerHTML = "";

	var styles = initMe.getElementsByTagName("style");

	for(var s = 0; s < styles.length; s++)  {
		addMe.innerHTML += styles[s].innerHTML;
		// console.log(styles[s].innerHTML);
	}

	// console.log(addMe);
	document.getElementsByTagName('head')[0].appendChild(addMe);
}






var p_needle = PINE.createNeedle("needle");
p_needle.includeBank = {};

p_needle.addFunction({
	step_type : PINE.ops.INITIALIZER,
	autoComplete : false,
	fn: function(initMe, needle) {

		var pineFunc = this;

		function doInclude(target) {
			if(needle.includeBank[target].outerHTML == null)  {
				setTimeout(function(){ doInclude(target) }, 10);
			}
			else  {
				var domNode = document.createElement('div');
				domNode.innerHTML = needle.includeBank[target].outerHTML;

				// console.log(needle.includeBank[target].outerHTML);

				U.evalElementScripts(domNode);
				U.evalElementStyles(domNode);
				

				pineFunc.complete();
			}
		}

		PINE.ajaxGetSrc(initMe, needle, doInclude);
		
	}
});










