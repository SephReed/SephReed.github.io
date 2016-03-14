/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*		                    /\
*          by: Seph Reed   X  X
*		           		    \/
*
********************************************/



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
		if( U.attr(initMe, "autoRun") !== "false")
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









var INC = PINE.Include = {};
INC.includeBank = {};
INC.srcCache = {};




PINE.class.CacheSetting = function(url, cacheOp) {}
INC.cacheOp = {};
INC.cacheOp.BYROOT = "byroot";
INC.cacheOp.NORMAL = "rormal";
INC.cacheOp.NEVER = "never";





INC.init = function(initMe, needle, pineFunc) {
	// var pineFunc = this;

	INC.update(initMe, needle, pineFunc.complete);

	initMe.FNS.changeSrc = function(src, callback) {
		callback = callback || function(){};
		initMe.setAttribute("src", src);
		INC.update(initMe, needle, callback);
	}
}




INC.update = function(initMe, needle, callback) {
	function doInclude(target) {

		if(needle.includeBank[target].outerHTML == null)  {
			setTimeout(function(){ doInclude(target) }, 10);
		}
		else  {
			initMe.innerHTML = needle.includeBank[target].outerHTML;

			if(needle.evalBank[target] === undefined) {
				var injects = {};
				var fakeLoc = {};
				var search = target.match(/\?.*/g);
				fakeLoc.search = search ? search[0] : "";
				injects["window.location"] = fakeLoc;
				// evalHelper.window_location = {};
				// evalHelper.window_location.search = "?s=hey";

				needle.evalBank[target] = U.evalElementScripts(initMe, injects);
			}

			//FUCKING KLUDGE;
			if(PINE.pnv) {
				PINE.pnv.parseText(initMe);
				PINE.pnv.parseAtts(initMe);
			}

			U.assertKey(initMe, "PVARS");
			initMe.PVARS[key] = needle.evalBank[target];

			
			// for(key in localVars)  {
			// 	initMe.PVARS[key] = localVars[key];
			// }

			callback();
		}
	}

	INC.ajaxGetSrc(initMe, needle, doInclude);
}





INC.ajaxGetSrc = function(initMe, needle, callback) {
	var src = initMe.attributes.src;
	
	if(src != null) {

		var target = src.value;


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







INC.updateNode = function(initMe) {

	return new Promise( function(resolve, reject) {
		var src = U.attr(initMe, "src");
		
		if(src) {
			INC.get(url).then(function(response) {
				resolve(response);
			});
		
		} else {
			reject("include src for "+initMe+" in not set");
		}
	});

			
		
	

	
}





INC.get = function(url, responseType) {

	//return a promise
	return new Promise( function(resolve, reject) {

		var cache = INC.srcCache[url];
			
		//if this url has not yet been requested
		if(cache == null)  {

			cache = INC.srcCache[url] = {};
				//
			cache.resolveQueue = [];
			cache.rejectQueue = [];
			cache.complete = false;

			var request = new XMLHttpRequest();
			request.responseType = responseType || "text";
			request.open('GET', url);

			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
				    cache.response = request.response;
				    cache.complete = true;

				    resolve(cache.response);

				    for(i in cache.resolveQueue)
				    	cache.resolveQueue[i](cache.response);

					cache.resolveQueue = [];				    

				} else {
				    request.onerror();
				}
			};

			request.onerror = function() {
			  	
			  	var err = "include src '"+url+"' does not exist";

			  	PINE.err(err)
			  	reject(err)

			  	for(i in cache.rejectQueue)
			    	cache.rejectQueue[i](err);

				cache.rejectQueue = [];
			};

			request.send();
		}			

		//if the url has been requested, but not yet resolved
		else if(cache.complete == false) {
			cache.resolveQueue.push(resolve);
			cache.rejectQueue.push(reject);
		}

		//the url has been included and resolved
		else resolve(cache.response);
	});

}








var p_include = PINE.createNeedle("include");

p_include.init = function(initMe, needle, pineFunc) {
	// initMe.innerHTML = response;

				// if(needle.evalBank[target] === undefined) {
				// 	var injects = {};

				// 	var fakeLoc = {};
				// 	var search = target.match(/\?.*/g);
				// 	fakeLoc.search = search ? search[0] : "";
				// 	injects["window.location"] = fakeLoc;

				// 	needle.evalBank[target] = U.evalElementScripts(initMe, injects);
				// }

				// //FUCKING KLUDGE;
				// if(PINE.pnv) {
				// 	PINE.pnv.parseText(initMe);
				// 	PINE.pnv.parseAtts(initMe);
				// }

				// initMe.PVARS[key] = needle.evalBank[target];

}


p_include.addFunction({
	step_type : PINE.ops.STATIC,
	autoComplete : false,
	fn: INC.init
});
p_include.includeBank = {};
p_include.evalBank = {};








var p_view = PINE.createNeedle("view");
p_view.addFunction({
	step_type : PINE.ops.STATIC,
	autoComplete : false,
	fn: INC.init
});

p_view.View = function(url, evalCache, styleNode, childNodes) {
	this.url = url;
	this.evalCache = evalCache;
	this.styleNode = styleNode;
	this.childNodes = childNodes;
}

p_view.setView = function(url) {

}

p_view.View.prototype.addFunction = function(args) {
	args.keyword = this.keyword;
	// PINE.registerFunction(args);
	PINE.registerFunction2(args);
}

p_view.viewBank = {};








//TODO : make sure variables defined a second time are not touched
U.evalElementScripts = function(initMe, injects) {

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

	//if user defines window locally, this will cause issues
	var evalHelper = PINE.evals[evalIndex]["__eval__"] = {};
	evalHelper.injects = {};

	for(key in injects) {
		var exitKey = key.replace('.', '_');
		evalHelper.injects[key] = evalPrefix+"__eval__."+exitKey;
		evalHelper[exitKey] = injects[key];
	}

	// var loc = evalHelper.injects["window.location"] = evalPrefix+"__eval__.window_location";
	// evalHelper.window_location = {};
	// evalHelper.window_location.search = "?s=hey";

	



	//go through all the scripts again
	for(var s = 0; s < scripts.length; s++) {

		//get the code and check it for local variables
		//if a local variable is found, append the evalPrefix so it is stored globally instead
		var textToEval = scripts[s].innerHTML;

		for(key in evalHelper.injects) {
			var replaceMe = key;
			var addMe = evalHelper.injects[key];
			textToEval = U.replaceVarInScript(replaceMe, addMe, textToEval);
		}



		for(i in localVars)  {
			var replaceMe = localVars[i];
			var addMe = evalPrefix+replaceMe;

			textToEval = U.replaceVarInScript(replaceMe, addMe, textToEval);
		}

		//once all local variables have been renamed to be stored globally, proceed with eval
		// console.log(textToEval);
		eval(textToEval);
	}

	// initMe._pine_.previouslyEvaled = true;

	return PINE.evals[evalIndex];
}

U.replaceVarInScript = function(replaceMe, addMe, script) {
	var noVarZones = "\\/\\*\\*.*?\\*\\/";  	/**multiline comment*/
		noVarZones += "|" + "\\/\\/.*?\\n";  	//single line comment
		noVarZones += "|" + "'.*?'"			//'string'
		noVarZones += "|" + "\".*?\""		//"string"
	//match anything that has the name of the variable without a dot or letter before it
	//this is the trolliest regex I've ever used
	//(var)?([^\.\/\\\w]|^)varName(?=([\.\s:]|$))
	var rex = new RegExp(noVarZones+"|(var)?([^\\.\\/\\\\\\w]|^)"+replaceMe+"(?=([\\.\\s:]|$))", "g");
	// console.log(rex);

	return script.replace(rex, function(replaceMe) {
		var char = replaceMe.charAt(0);
		var out = replaceMe;

		if(char != "\/" && char != "'" && char != "\"") {
			out = addMe;
			//special case for not "var some_name" ie "some_name = 'joe'"
			if(char != 'v')
				out = replaceMe.charAt(0)+out;

		}

		return out;
	});
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

		INC.ajaxGetSrc(initMe, needle, doInclude);
		
	}
});










