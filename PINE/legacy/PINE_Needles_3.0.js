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


/****************
*    trigger
***************/


PINE.createNeedle("[trigger]").addFunction({
	step_type: PINE.ops.FINALIZER,
	fn: function(initMe, needle) {

		if (initMe.HACK_USED_trigger !== true) {
			var triggerType = initMe.attributes.trigger.value;


			initMe.addEventListener(triggerType, function(event) {
				var target = initMe.attributes.target.value;
				var fn = initMe.attributes.fn.value;
				var args = U.attr(initMe, "args");

				$(target).each(function() {
					this.FNS[fn]();
				});
			}, false);
		}
		initMe.HACK_USED_trigger = true;
	}
});






/****************
*    spawner
***************/





var spawner = PINE.createNeedle("[spawner]");

spawner.addFunction({
	step_type : PINE.ops.INITIALIZER,
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
			console.log("calling needle update")
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
	// var keyString = initMe.attributes.spawner.value;
	// var spawnerSource = pnv.getVarFrom(keyString, initMe);



	// console.log(array)
	// console.log(initMe);
	// alert("pause needle ~100");

	var spawn = initMe._pine_.spawner.spawn;

	if(spawn){

		for(var i = 0; i < initMe.childNodes.length;) {
			var child = initMe.childNodes[i];
			
			if(child.attributes && child.attributes.spawn)
		    	initMe.removeChild(child);

		    else i++;
		}

		var count;
		var countAtt = initMe.attributes.count;
		var spawnerSource;

		if(countAtt) {
			count = parseInt(countAtt.value);
			// if(countAtt)
			// count = pnv.getVarFrom(countAtt.value, initMe);
		}
		else {
			var keyString = initMe.attributes.spawner.value;
			spawnerSource = pnv.getVarFrom(keyString, initMe);

			if(spawnerSource)
				count = spawnerSource.length;

			else return;
		}

		var indexer = initMe._pine_.spawner.indexer;


		for(var i = 0; i < count; i++)  {
			var i = i;

			var addMe = PINE.deepCloneNode(spawn);
			U.getnit(addMe, "PVARS."+indexer, i);
			
			addMe.setAttribute("scopeVarDoesNothing", indexer+'='+i);

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









// var INC = PINE.Include = {};
// INC.includeBank = {};
// INC.srcCache = {};




// PINE.class.CacheSetting = function(url, cacheOp) {}
// INC.cacheOp = {};
// INC.cacheOp.BYROOT = "byroot";
// INC.cacheOp.NORMAL = "rormal";
// INC.cacheOp.NEVER = "never";





// INC.init = function(initMe, needle, pineFunc) {
// 	// var pineFunc = this;

// 	INC.update(initMe, needle, pineFunc.complete);

// 	initMe.FNS.changeSrc = function(src, callback) {
// 		callback = callback || function(){};
// 		initMe.setAttribute("src", src);
// 		INC.update(initMe, needle, callback);
// 	}
// }




// INC.update = function(initMe, needle, callback) {
// 	function doInclude(target) {

// 		if(needle.includeBank[target].outerHTML == null)  {
// 			setTimeout(function(){ doInclude(target) }, 10);
// 		}
// 		else  {
// 			initMe.innerHTML = needle.includeBank[target].outerHTML;

// 			if(needle.evalBank[target] === undefined) {
// 				var injects = {};
// 				var fakeLoc = {};
// 				var search = target.match(/\?.*/g);
// 				fakeLoc.search = search ? search[0] : "";
// 				injects["window.location"] = fakeLoc;
// 				// evalHelper.window_location = {};
// 				// evalHelper.window_location.search = "?s=hey";

// 				needle.evalBank[target] = U.evalElementScripts(initMe, injects);
// 			}

// 			//FUCKING KLUDGE;
// 			// if(PINE.pnv) {
// 			// 	PINE.pnv.parseText(initMe);
// 			// 	PINE.pnv.parseAtts(initMe);
// 			// }

// 			U.assertKey(initMe, "PVARS");
// 			initMe.PVARS[key] = needle.evalBank[target];

			
// 			// for(key in localVars)  {
// 			// 	initMe.PVARS[key] = localVars[key];
// 			// }

// 			callback();
// 		}
// 	}

// 	INC.ajaxGetSrc(initMe, needle, doInclude);
// }





// INC.ajaxGetSrc = function(initMe, needle, callback) {
// 	var src = initMe.attributes.src;
	
// 	if(src != null) {

// 		var target = src.value;


// 		if(needle.includeBank[target] == null)  {
// 			needle.includeBank[target] = {};

// 			var request = new XMLHttpRequest();
// 			request.responseType = 'text';
// 			request.open('GET', target, true);

// 			request.onload = function() {
// 				if (request.status >= 200 && request.status < 400) {
// 				    // Success!
// 				    var response = request.responseText;
// 				    needle.includeBank[target].outerHTML = response;
// 				    callback(target);
// 				} else {
// 				    // We reached our target server, but it returned an error
// 				    PINE.err("include src '"+target+"' does not exist")
// 				}
// 			};



// 			request.onerror = function() {
// 			  	// There was a connection error of some sort
// 			  	PINE.err("include src '"+target+"' does not exist")
// 			};

// 			try {
// 				request.send();	
// 			}
// 			catch(e) {
// 				PINE.err("NS_ERROR_DOM_BAD_URI: Access to restricted URI '"+target+"' denied");
// 				// callback(target);
// 			}
			
// 		}			
// 		else callback(target);



// 	}

// 	else PINE.err("include src for "+initMe+" in not set");
// }








// INC.get = function(url, responseType) {

// 	//return a promise
// 	return new Promise( function(resolve, reject) {

// 		var cache = INC.srcCache[url];
			
// 		//if this url has not yet been requested
// 		if(cache == null)  {

// 			cache = INC.srcCache[url] = {};
// 				//
// 			cache.resolveQueue = [];
// 			cache.rejectQueue = [];
// 			cache.complete = false;

// 			var request = new XMLHttpRequest();
// 			request.responseType = responseType || "text";
// 			request.open('GET', url);

// 			request.onload = function() {
// 				if (request.status >= 200 && request.status < 400) {
// 				    cache.response = request.response;
// 				    cache.complete = true;

// 				    resolve(cache.response);

// 				    for(i in cache.resolveQueue)
// 				    	cache.resolveQueue[i](cache.response);

// 					cache.resolveQueue = [];				    

// 				} else {
// 				    request.onerror();
// 				}
// 			};

// 			request.onerror = function() {
			  	
// 			  	var err = "include src '"+url+"' does not exist";

// 			  	PINE.err(err)
// 			  	reject(err)

// 			  	for(i in cache.rejectQueue)
// 			    	cache.rejectQueue[i](err);

// 				cache.rejectQueue = [];
// 			};

// 			try {
// 				request.send();	
// 			}
// 			catch(e) {
// 				PINE.err("NS_ERROR_DOM_BAD_URI: Access to restricted URI '"+url+"' denied");
// 				// callback(target);
// 			}
// 		}			

// 		//if the url has been requested, but not yet resolved
// 		else if(cache.complete == false) {
// 			cache.resolveQueue.push(resolve);
// 			cache.rejectQueue.push(reject);
// 		}

// 		//the url has been included and resolved
// 		else resolve(cache.response);
// 	});

// }





// /****************
// *    include
// ***************/


// var p_include = PINE.createNeedle("include");

// p_include.update = function(initMe, callback) {

// 	var url = U.attr(initMe, "src");
		
// 	if(url) {
// 		INC.get(url).then(function(response) {

// 			if(url.indexOf(".html") != -1) {
// 				initMe.innerHTML = response;

// 				U.evalElementScripts2(initMe, url);

// 				//FUCKING KLUDGE;
// 				// if(PINE.pnv) {
// 				// 	PINE.pnv.parseText(initMe);
// 				// 	PINE.pnv.parseAtts(initMe);
// 				// }
// 			}
// 			else if(url.indexOf(".css") != -1) {
// 				initMe.innerHTML = "<style>"+response+"</style>"
// 			}
// 			else {
// 				PINE.err("file is neither .html or .css");
// 			}


// 			callback ? callback() : null
// 		});
	
// 	} else {
// 		PINE.err("include src for "+initMe+" in not set");
// 	}
// }



// p_include.init = function(initMe, needle, pineFunc) {
// 	p_include.update(initMe, pineFunc.complete);

// 	PINE.addFunctionToNode(initMe, "changeSrc", function(src, callback) {
// 		// callback = callback || function(){};
// 		initMe.setAttribute("src", src);
// 		p_include.update(initMe, function(){
// 			PINE.updateAt(initMe, callback);
// 		});
// 	});
// }


// p_include.addFunction({
// 	step_type : PINE.ops.STATIC,
// 	autoComplete : false,
// 	fn: p_include.init
// });




// /****************
// *   view
// ***************/



// var p_view = PINE.createNeedle("view");
// p_view.addFunction({
// 	step_type : PINE.ops.STATIC,
// 	autoComplete : false,
// 	fn: INC.init
// });

// p_view.View = function(url, evalCache, styleNode, childNodes) {
// 	this.url = url;
// 	this.evalCache = evalCache;
// 	this.styleNode = styleNode;
// 	this.childNodes = childNodes;
// }

// p_view.setView = function(url) {

// }

// p_view.View.prototype.addFunction = function(args) {
// 	args.keyword = this.keyword;
// 	// PINE.registerFunction(args);
// 	PINE.registerFunction2(args);
// }

// p_view.viewBank = {};





// /****************
// *   changeSrc
// ***************/



// var p_changeSrc = PINE.createNeedle("changeSrc");
// p_changeSrc.addFunction({
// 	step_type : PINE.ops.FINALIZER,
// 	fn: function(initMe, needle) {
		

// 		if (initMe.HACK_USED_changeSrc !== true) {

// 			initMe.addEventListener("click", function(event) {
				
// 				var src = U.attr(initMe, "src");

// 				var target = U.attr(initMe, "target");
// 				var domNode = document.getElementById(target);

// 				if(domNode && domNode.FNS && domNode.FNS.changeSrc) {
// 					// alert(src);
// 					domNode.FNS.changeSrc(src);
// 				}
// 			});
// 		}

// 		initMe.HACK_USED_changeSrc = true;
// 	}
// });







// U.evalElementScripts2 = function(initMe, url) {

// 	var injects = [];

// 	var fakeLoc = {};
// 	var search = url.match(/\?.*/g);
// 	fakeLoc.search = search ? search[0] : "";
// 	injects.push({var_name: "window.location", addMe: fakeLoc});

// 	var scriptNodes = initMe.getElementsByTagName("script");

// 	// console.log(scriptNodes);

// 	var scripts = [];
// 	for(sc = 0; sc < scriptNodes.length; sc++) {
// 		scripts[sc] = scriptNodes[sc].innerHTML;
// 	}

// 	// console.log(scripts);

// 	var hack = U.hackScripts(scripts, injects);

// 	initMe.PVARS = hack.localVars;

// 	for(sc in hack.scripts) {
// 		// console.log(hack.scripts[sc]);
// 		try {
// 			console.log("trying eval for "+url);
// 			eval(hack.scripts[sc]);
// 		}
// 		catch(e) {
// 			PINE.err("eval error in file "+url);
// 		}
// 	}

// 	return hack;
// }





// U.Context = function(script, type) {
// 	this.script = script;
// 	this.type = type;
// 	this.subContexts;
// }

// U.Context.TYPE = {};
// U.Context.TYPE.STRING = "string";
// U.Context.TYPE.COMMENT = "comment";
// U.Context.TYPE.LOCAL = "local";
// U.Context.TYPE.UNLOCAL = "unlocal";

// U.Context.prototype.toString = function() {
// 	if(this.type == U.Context.TYPE.UNLOCAL) {
// 		var out = ""
// 		for(su in this.subContexts) 
// 			out += this.subContexts[su].toString()
		
// 		return "{"+out+"}";
// 	}
// 	else return this.script;
// }



// U.parseScriptToContexts = function(script) {
// 	var contexts = [];

// 	var bracketDepth = 0;
// 	var lastCut = 0;
// 	for(var c = 0; c < script.length; c++) {
// 		var char = script.charAt(c);


// 		var atEnd = (c == script.length-1);
	
// 		if(char == "}") {
// 			bracketDepth--;

// 			if(bracketDepth == 0) {
// 				var scriptChunk = script.substring(lastCut, c+1);
// 				var context = new U.Context(scriptChunk, U.Context.TYPE.UNLOCAL);
// 				context.subContexts = U.parseScriptToContexts(scriptChunk.substring(1, scriptChunk.length-1));
// 				contexts.push(context);
// 				lastCut = c + 1;
// 			}
// 		}


// 		else if(char == "{" || atEnd) {
// 			if(bracketDepth == 0) {
// 				if(atEnd) c++;
// 				var scriptChunk = script.substring(lastCut, c);
// 				var context = new U.Context(scriptChunk);
// 				contexts.push(context);
// 				lastCut = c;
// 			}

// 			bracketDepth++;
// 		}
// 	}


// 	for (var co = 0; co < contexts.length; co++) {
// 		// console.log(contexts[co]);

// 		if(contexts[co].type === undefined) {
// 			var script = contexts.splice(co, 1)[0].script;

// 			var chunks = [];

// 			var exiting = false;
// 			var dubQuote = 0;
// 			var singQuote = 0;
// 			var comment = 0;

// 			var lastCut = 0;

// 			for(var c = 0; c < script.length; c++) {
// 				var char = script.charAt(c);
// 				var new_chunk = false;
				
// 				if(!exiting) {
// 					if(char == "\\") exiting = true;

// 					else if(char == "\"" && !singQuote) {
// 						new_chunk = true;
// 						dubQuote++;
// 					}

// 					else if(char == "\'" && !dubQuote) {
// 						new_chunk = true;
// 						singQuote++;
// 					}

// 					// else if(char == "/") {
// 					// 	if()
// 					// }

// 					var atEnd = (c == script.length-1);
// 					if(new_chunk || atEnd) {
// 						var scriptChunk, context;

// 						if(dubQuote > 1 || singQuote > 1) {
// 							scriptChunk = script.substring(lastCut, c+1);
// 							context = U.Context.TYPE.STRING;
						
// 							dubQuote = singQuote = 0;
// 							lastCut = c + 1;
// 						}
// 						else if(comment > 1) {
// 							scriptChunk = script.substring(lastCut, c);
// 							context = U.Context.TYPE.COMMENT;

// 							comment = false;
// 							lastCut = c;
// 						}
// 						else {
// 							if(atEnd) c++;
// 							scriptChunk = script.substring(lastCut, c);
// 								//
// 							// else scriptChunk = script.substring(lastCut, c);
// 							context = U.Context.TYPE.LOCAL;

// 							lastCut = c;
// 						}

						
// 						chunks.push(new U.Context(scriptChunk, context));
// 					}
// 				}
// 				else exiting = false;
				
// 			}


// 			for(ch in chunks) {
// 				contexts.splice(co, 0, chunks[ch])
// 				co++;
// 			}
// 		}
// 	}


// 	return contexts;
// }




// U.hackScripts = function(scriptsArray, i_injects) {
// 	var injects = i_injects || [];

// 	var evalIndex = PINE.evals.length;
// 	PINE.evals[evalIndex] = {};
// 	var evalPrefix = "PINE.evals["+evalIndex+"].";

// 	if(i_injects !== undefined) {
// 		var injectReferences = PINE.evals[evalIndex]["__eval__"] = {};

// 		for(i in injects) {
// 			var exitKey = injects[i].var_name.replace('.', '_');

// 			injectReferences[exitKey] = injects[i].addMe;
// 			injects[i].addMe = evalPrefix+"__eval__."+exitKey;
			
// 		}
// 	}


	

// 	var scriptContexts = []

// 	for(sc in scriptsArray) {
// 		var contexts = scriptContexts[sc] = U.parseScriptToContexts(scriptsArray[sc]);

// 		for (co in contexts) {
// 			if(contexts[co].type == U.Context.TYPE.LOCAL) {
// 				// var rex = /(var.+?(?=([;\n=]|$)))/g;

// 				//check for anything that starts with var or function(
// 				var rex = /(function +.+\()|(var.+?(?=([;\n=]|$)))/g;

// 				contexts[co].script = contexts[co].script.replace(rex, function(replaceMe, isFunc) {
// 					if(isFunc) {
// 						return replaceMe.replace(/function +\w*/g, function(relaceMe) {
// 							var var_name = relaceMe.replace(/function +/g, '');
// 							return "window[\""+var_name+"\"] = function";
// 						});
// 					}
// 					else {
// 						var var_name = replaceMe.replace(/var +| +$/g, '');
// 						var addMe = evalPrefix+var_name;
// 						// var rex = RegExp("([^\\.]|^)"+var_name+"(?! *:)");
// 						injects.push({ var_name : var_name, addMe : addMe});

// 						return addMe;
// 					}
// 				});
// 			}
// 		}
// 	}

// 	for(i in injects) {
// 		injects[i].rex = RegExp("([^\\.\\w\\d]|^)"+injects[i].var_name+"(?!( *:|[\\w\\d]))", "g");
// 	}

// 	// console.log(scriptContexts);
// 	console.log(injects);

// 	var scriptsOut = [];

// 	for(sc in scriptContexts) {
// 		var contexts = scriptContexts[sc];

// 		U.injectVars(contexts, injects);

// 		var script = ""

// 		for (co in contexts) {
// 			script += contexts[co].toString();
// 		}

// 		scriptsOut[sc] = script;
// 	}

// 	var out = {};
// 	out.scripts = scriptsOut;
// 	out.evalIndex = evalIndex;
// 	out.localVars = PINE.evals[evalIndex];


// 	return out;
// }


// U.injectVars = function(contexts, injects) {

// 	for(co in contexts) {
// 		var con = contexts[co];
// 		if(con.type == U.Context.TYPE.LOCAL) {
// 			for(i in injects) {
// 				var inj = injects[i]; 
// 				con.script = con.script.replace(inj.rex, function(replaceMe, prependChar){
// 					var out = inj.addMe;

// 					if(prependChar)
// 						out = prependChar + out;

// 					return out;
// 				});
// 			}
// 		}
// 		if(con.type == U.Context.TYPE.UNLOCAL) {
// 			U.injectVars(con.subContexts, injects)
// 		}
// 	}
// }



// // U.hackScripts2 = function(scriptsArray, injects) {

// // 	var injects = injects || [];

// // 	//find all local vars and functions
// // 	//replace them

// // 	//anything within brackets is off limits

// // 	//go through each script, break into chunks local and bracket


// // 	//find all local chunks
// // 	var scriptChunkArrays = [];

// // 	for(s in scriptsArray) {
// // 		scriptChunkArrays[s] = U.splitAtBrackets(scriptsArray[s]);	
// // 	}


// // 	console.log(scriptChunkArrays);


	


// // 	// create a new object for all the local variables of this eval to be stored in
// // 	var evalIndex = PINE.evals.length;
// // 	PINE.evals[evalIndex] = {};
// // 	var evalPrefix = "PINE.evals["+evalIndex+"].";


// // 	// var localVars = [];
// // 		//

// // 	for(sc in scriptChunkArrays){
// // 		var chunks = scriptChunkArrays[sc];

// // 		//go through every item with a script tag
// // 		for(ch in chunks)  {

// // 			if(chunks[ch].charAt(0) != "{") {

// // 				//check for anything that starts with var or function(
// // 				// var rex = /(function +.+\()|(var.+?(?=([;\n=]|$)))/g;

// // 				// chunks[ch] = chunks[ch].replace(rex, function(replaceMe, isFunc, isVar) {
// // 				// var out = replaceMe;

// // 				// 	if(isFunc) {
// // 				// 		var out = out.replace(/function \w*/g, function(relaceMe) {
// // 				// 			var var_name = relaceMe.substring("function ".length);

// // 				// 			return "window[\""+var_name+"\"] = function";
// // 				// 		});
// // 				// 	}
// // 				// 	else if (isVar) {
// // 				// 		var var_name = out.replace(/var +| +$/g, '');
// // 				// 		localVars.push(var_name);

// // 				// 		out = evalPrefix+var_name;
// // 				// 	}

// // 				// return out;
// // 				// });

// // 				var rex = /(var.+?(?=([;\n=]|$)))/g;

// // 				var matches =  chunks[ch].match(rex)
				
// // 				for(ma in matches) {
// // 					var var_name = matches[ma].replace(/var +| +$/g, '');
// // 					var addMe = evalPrefix+var_name;
// // 					injects.push({ replaceMe : var_name, addMe : addMe });
// // 				}				
// // 			}
// // 		}
// // 	}

// // 	console.log(injects);




// // 	for(sc in scriptChunkArrays){
// // 		var chunks = scriptChunkArrays[sc];

// // 		//go through every item with a script tag
// // 		for(ch in chunks)  {
// // 			chunks[ch] = U.injectVars(chunks[ch], injects);
			
// // 		}
// // 	}





// // 	var outScripts = [];

// // 	for(sc in scriptChunkArrays){
// // 		var chunks = scriptChunkArrays[sc];

// // 		outScripts[sc] = "";

// // 		//go through every item with a script tag
// // 		for(ch in chunks)  {
// // 			outScripts[sc] += chunks[ch];
// // 		}
// // 	}

// // 	return outScripts;
	













// // 	// create a new object for all the local variables of this eval to be stored in
// // 	// var evalIndex = PINE.evals.length;
// // 	// PINE.evals[evalIndex] = {};
// // 	// var evalPrefix = "PINE.evals["+evalIndex+"].";


	
// // 	// var localVars = [];
// // 	// var scripts = initMe.getElementsByTagName("script");
// // 	// var bracketChunks = []
// // 		//
// // 	//go through every item with a script tag
// // 	// for(var s = 0; s < scripts.length; s++)  {
// // 	// 	var script = scripts[s];

// // 	// 	var localChunks = [];

// // 	// 	var bracketDepth = 0;
// // 	// 	var localBegin = 0;
// // 	// 	for(var c = 0; c < script.length; c++) {
// // 	// 		var char = script.charAt(c);

// // 	// 		if(char == "{") {
// // 	// 			bracketDepth++;

// // 	// 			if(bracketDepth == 0) {
// // 	// 				localChunks.push(script.substring(localBegin, c));
// // 	// 			}
// // 	// 		}
// // 	// 		else if (char == "}") {
// // 	// 			bracketDepth--;
// // 	// 			localBegin = c;
// // 	// 		}
// // 	// 	}

// // 	// 	console.log(localChunks);
// // 	// }

// // 	// //if user defines window locally, this will cause issues
// // 	// var evalHelper = PINE.evals[evalIndex]["__eval__"] = {};
// // 	// evalHelper.injects = {};

// // 	// for(key in injects) {
// // 	// 	var exitKey = key.replace('.', '_');
// // 	// 	evalHelper.injects[key] = evalPrefix+"__eval__."+exitKey;
// // 	// 	evalHelper[exitKey] = injects[key];
// // 	// }

// // 	// // var loc = evalHelper.injects["window.location"] = evalPrefix+"__eval__.window_location";
// // 	// // evalHelper.window_location = {};
// // 	// // evalHelper.window_location.search = "?s=hey";

	



// // 	// //go through all the scripts again
// // 	// for(var s = 0; s < scripts.length; s++) {

// // 	// 	//get the code and check it for local variables
// // 	// 	//if a local variable is found, append the evalPrefix so it is stored globally instead
// // 	// 	var textToEval = scripts[s].innerHTML;

// // 	// 	for(key in evalHelper.injects) {
// // 	// 		var replaceMe = key;
// // 	// 		var addMe = evalHelper.injects[key];
// // 	// 		textToEval = U.replaceVarInScript(replaceMe, addMe, textToEval);
// // 	// 	}



// // 	// 	for(i in localVars)  {
// // 	// 		var replaceMe = localVars[i];
// // 	// 		var addMe = evalPrefix+replaceMe;

// // 	// 		textToEval = U.replaceVarInScript(replaceMe, addMe, textToEval);
// // 	// 	}

// // 	// 	//once all local variables have been renamed to be stored globally, proceed with eval
// // 	// 	console.log(textToEval);
// // 	// 	eval(textToEval);
// // 	// }

// // 	// // initMe._pine_.previouslyEvaled = true;

// // 	// return PINE.evals[evalIndex];

// // 	// return scriptsArray;
// // }











// //TODO : make sure variables defined a second time are not touched
// U.evalElementScripts = function(initMe, injects) {

// 	//if previously evaluated, throw an error
// 	// if(initMe._pine_.previouslyEvaled === true) {
// 	// 	PINE.err("element previously evaled");
// 	// 	PINE.err(initMe);
// 	// }

// 	//create a new object for all the local variables of this eval to be stored in
// 	var evalIndex = PINE.evals.length;
// 	PINE.evals[evalIndex] = {};
// 	var evalPrefix = "PINE.evals["+evalIndex+"].";


	
// 	var localVars = [];
// 	var scripts = initMe.getElementsByTagName("script");
// 		//
// 	//go through every item with a script tag
// 	for(var s = 0; s < scripts.length; s++)  {

// 		// console.log(scripts[s].innerHTML);

// 		//check for anything that is either within brackets {} or starts with var or function(
// 		var rex = /([\n;]|^)[\t ]*?function.*\(|(var.+(;|\n)|(\{(.|\n)+?\}))/g;

// 		scripts[s].innerHTML = scripts[s].innerHTML.replace(rex, function(replaceMe) {
// 			var out = replaceMe;

// 			if(out.charAt(0) != '{') {

				

// 				if(out.indexOf("function") != -1) {
// 					// alert(match);
// 					var out = out.replace(/function \w*/g, function(relaceMe) {
// 						var var_name = relaceMe.substring("function ".length);

// 						return "window[\""+var_name+"\"] = function";
// 					});
					
// 					// alert("function found "+replaceMe+" --> "+out);
// 				}
// 				else {
// 					var var_name = out.replace(/(var +|( ?)+=.+\n?)/g, '');
				
// 					var_name = var_name.replace(/[\n\r;]/g, '');
// 					localVars.push(var_name);
// 				}

				
// 			}

// 			return out;
// 		});

// 		// var localVarRex = scripts[s].innerHTML.match(rex);

// 		// //if any of the results aren't brackets, get the var name and add it to list of local vars
// 		// for(i in localVarRex)  {
// 		// 	var match = localVarRex[i];
// 		// 	if(match.charAt(0) != '{') {
// 		// 		if(match.indexOf("function") != -1) {
// 		// 			// alert(match);
// 		// 			var func_string = match.match(/function \w*/g)[0]
// 		// 			var var_name = func_string.substring("function ".length);
// 		// 			alert("function found "+var_name);
// 		// 		}
// 		// 		else {
// 		// 			var var_name = match.replace(/(var +|( ?)+=.+\n?)/g, '');
				
// 		// 			var_name = var_name.replace(/[\n\r;]/g, '');
// 		// 			localVars.push(var_name);
// 		// 		}

				
// 		// 	}
// 		// }
// 	}

// 	//if user defines window locally, this will cause issues
// 	var evalHelper = PINE.evals[evalIndex]["__eval__"] = {};
// 	evalHelper.injects = {};

// 	for(key in injects) {
// 		var exitKey = key.replace('.', '_');
// 		evalHelper.injects[key] = evalPrefix+"__eval__."+exitKey;
// 		evalHelper[exitKey] = injects[key];
// 	}

// 	// var loc = evalHelper.injects["window.location"] = evalPrefix+"__eval__.window_location";
// 	// evalHelper.window_location = {};
// 	// evalHelper.window_location.search = "?s=hey";

	



// 	//go through all the scripts again
// 	for(var s = 0; s < scripts.length; s++) {

// 		//get the code and check it for local variables
// 		//if a local variable is found, append the evalPrefix so it is stored globally instead
// 		var textToEval = scripts[s].innerHTML;

// 		for(key in evalHelper.injects) {
// 			var replaceMe = key;
// 			var addMe = evalHelper.injects[key];
// 			textToEval = U.replaceVarInScript(replaceMe, addMe, textToEval);
// 		}



// 		for(i in localVars)  {
// 			var replaceMe = localVars[i];
// 			var addMe = evalPrefix+replaceMe;

// 			textToEval = U.replaceVarInScript(replaceMe, addMe, textToEval);
// 		}

// 		//once all local variables have been renamed to be stored globally, proceed with eval
// 		console.log(textToEval);
// 		eval(textToEval);
// 	}

// 	// initMe._pine_.previouslyEvaled = true;

// 	return PINE.evals[evalIndex];
// }

// U.replaceVarInScript = function(replaceMe, addMe, script) {
// 	var noVarZones = "\\/\\*\\*.*?\\*\\/";  	/**multiline comment*/
// 		noVarZones += "|" + "\\/\\/.*?\\n";  	//single line comment
// 		noVarZones += "|" + "'.*?'"			//'string'   ".*?"
// 		noVarZones += "|" + "\".*?\""		//"string"
// 	//match anything that has the name of the variable without a dot or letter before it
// 	//this is the trolliest regex I've ever used
// 	//(var)?([^\.\/\\\w]|^)varName(?=([\.\s:]|$))
// 	var rex = new RegExp(noVarZones+"|(var)?([^\\.\\/\\\\\\w]|^)"+replaceMe+"(?=([\\.\\s;:]|$))", "g");
// 	// console.log(rex);

// 	return script.replace(rex, function(replaceMe) {
// 		// console.log(replaceMe);

// 		var char = replaceMe.charAt(0);
// 		var out = replaceMe;

// 		if(char != "\/" && char != "'" && char != "\"") {
// 			out = addMe;
// 			//special case for not "var some_name" ie "some_name = 'joe'"
// 			if(char != 'v')
// 				out = replaceMe.charAt(0)+out;

// 		}

// 		return out;
// 	});
// }



// U.evalElementStyles = function(initMe) {
// 	var addMe = document.createElement('style');
// 	addMe.type = 'text/css';
// 	addMe.innerHTML = "";

// 	var styles = initMe.getElementsByTagName("style");

// 	for(var s = 0; s < styles.length; s++)  {
// 		addMe.innerHTML += styles[s].innerHTML;
// 		// console.log(styles[s].innerHTML);
// 	}

// 	// console.log(addMe);
// 	document.getElementsByTagName('head')[0].appendChild(addMe);
// }






// // var p_needle = PINE.createNeedle("needle");
// // p_needle.includeBank = {};

// // p_needle.addFunction({
// // 	step_type : PINE.ops.INITIALIZER,
// // 	autoComplete : false,
// // 	fn: function(initMe, needle) {

// // 		var pineFunc = this;

// // 		function doInclude(target) {
// // 			if(needle.includeBank[target].outerHTML == null)  {
// // 				setTimeout(function(){ doInclude(target) }, 10);
// // 			}
// // 			else  {
// // 				var domNode = document.createElement('div');
// // 				domNode.innerHTML = needle.includeBank[target].outerHTML;

// // 				// console.log(needle.includeBank[target].outerHTML);

// // 				U.evalElementScripts(domNode);
// // 				U.evalElementStyles(domNode);
				

// // 				pineFunc.complete();
// // 			}
// // 		}

// // 		INC.ajaxGetSrc(initMe, needle, doInclude);
		
// // 	}
// // });






// /****************
// *    include
// ***************/


// var p_needle = PINE.createNeedle("needle");

// // p_include.update = function(initMe, callback) {

// // 	console.log("updating")


// // 	var url = U.attr(initMe, "src");
		
// // 	if(url) {
// // 		INC.get(url).then(function(response) {

// // 			if(url.indexOf(".html") != -1) {
// // 				initMe.innerHTML = response;

// // 				U.evalElementScripts2(initMe, url);

// // 				//FUCKING KLUDGE;
// // 				if(PINE.pnv) {
// // 					PINE.pnv.parseText(initMe);
// // 					PINE.pnv.parseAtts(initMe);
// // 				}
// // 			}
// // 			else if(url.indexOf(".css") != -1) {
// // 				initMe.innerHTML = "<style>"+response+"</style>"
// // 			}
// // 			else {
// // 				PINE.err("file is neither .html or .css");
// // 			}


// // 			callback ? callback() : null
// // 		});
	
// // 	} else {
// // 		PINE.err("include src for "+initMe+" in not set");
// // 	}
// // }



// // p_needle.init = function(initMe, needle, pineFunc) {
// // 	p_include.update(initMe, pineFunc.complete);

// // 	PINE.addFunctionToNode(initMe, "changeSrc", function(src, callback) {
// // 		// callback = callback || function(){};
// // 		initMe.setAttribute("src", src);
// // 		p_include.update(initMe, function(){
// // 			PINE.updateAt(initMe, callback);
// // 		});
// // 	});
// // }


// p_needle.addFunction({
// 	step_type : PINE.ops.INITIALIZER,
// 	autoComplete : false,
// 	fn: function(initMe, needle, pineFunc) {
// 		console.log("updating")


// 		var url = U.attr(initMe, "src");
			
// 		if(url) {
// 			INC.get(url).then(function(response) {

// 				if(url.indexOf(".html") != -1) {
// 					initMe.innerHTML = response;

// 					U.evalElementScripts2(initMe, url);
// 				}
// 				else if(url.indexOf(".css") != -1) {
// 					initMe.innerHTML = "<style>"+response+"</style>"
// 				}
// 				else {
// 					PINE.err("file is neither .html or .css");
// 				}


// 				// callback ? callback() : null
// 				pineFunc.complete();
// 			});
		
// 		} else {
// 			PINE.err("include src for "+initMe+" in not set");
// 		}
// 	}
// });









