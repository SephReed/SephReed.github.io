/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*                 4.1       /\
*          by: Seph Reed   X  X
*                           \/
*
********************************************/

"use strict"









var PINE = function(arg1, arg2, arg3) {
	if(typeof arg1 == "string") {
		if(typeof arg2 == "string" && typeof arg3 == "function") {
			var out = PINE.Needle(arg1);
			out.addFunction(arg2, arg3);
			return out;
		}
		
		else if ((typeof arg2 == "function" || typeof arg2 == "object") && arg3 === undefined) {
			var out = PINE.Needle(arg1);
			out.addFunction(arg2);
			return out;
		}
	}
}
PINE.class = {};

var U = PINE.UTILITIES = {};
// PINE.createMutateLogger = false;


PINE.loaded = false;

PINE.evals = [];

PINE.stopTags = [
	"ENDPINE",
	"SCRIPT",
	"STYLE"
]





/**********************************
*	 	PINE INTERFACE FUNCTIONS 
**********************************/

var ev = PINE.events = {};
PINE.events.load = "load";
PINE.events.logUpdate = "logUpdate";
PINE.validEvents = [ev.load, ev.logUpdate];
PINE.eventListeners = {};

PINE.addEventListener = function(type, callback) {
	if(PINE.validEvents.indexOf(type) != null) {
		if(PINE.eventListeners[type] === undefined)
			PINE.eventListeners[type] = [];

		PINE.eventListeners[type].push(callback);

		if(type == PINE.events.load && PINE.loaded == true) {
			callback();
		}
	}
	else {
		PINE.err("event of type:"+type+" has no meaning for PINE.  not valid.  see PINE.validEvents");
	}
}

PINE.ready = function(callback) {
	PINE.addEventListener(PINE.events.load, callback);
}


PINE.disabledNeedles = [];

PINE.disable = function(needles) {
	PINE.disabledNeedles = PINE.disabledNeedles.concat(needles);
}







/**********************************
*	 	ORDER OF OPERATIONS 
**********************************/

PINE.ops = {};

PINE.ops.order = [
	PINE.ops.INIT = "init",
	PINE.ops.PVARS = "pvars",
	PINE.ops.STATIC = "static",
	PINE.ops.COMMON = "common",
	PINE.ops.GATHER = "gather"
]

PINE.ops.POLISH = PINE.ops.GATHER;


//INIT assumes nothing.  It is used to set initial values (usually PVARS) prior to permeation or inline pvars.  
//PVARS assumes all core values (usually PVARS) are set except those to be set by "[pvars]".  PVARS is a special step for the "[pvars]" tag.
//STATIC assumes all core values (usually PVARS) are set.  STATIC functions have no inline attribute dependencies.
//COMMON assumes all values are properly set, both inline and PVAR.
//POLISH assumes the growth from it is complete.  
// 		It is important that any Needles which mod their children do so during a POLISH stage.
// 		All generative content added by POLISH should be repermeated.











/**********************************
*	 	NEEDLE STUFF
* do they inject functionality?
* are they the last step in the pine branching process?
* do they fulfill a need?
* YES
**********************************/

PINE.needles = {};

PINE.class.Needle = function(keyword) {
	LOG("overview", "Creating Needle "+keyword);	
	this.keyword = keyword;
	this.uses = 0;
	this.pinefuncs = {};

	for(var i in PINE.ops.order)  {
		var opType = PINE.ops.order[i];
		this.pinefuncs[ opType ] = [];
	}

}


PINE.class.Needle.prototype.addFunction = function(arg1, arg2) {

	var args;

	if(typeof arg1 == "object") {
		args = arg1;
	}
	else if(typeof arg1 == "string" && typeof arg2 == "function") { 	
		args = {};
		args.opType = arg1;
		args.fn = arg2;
	}
	else if(typeof arg1 == "function" && arg2 === undefined ) {
		args = {};
		args.opType = PINE.ops.COMMON;
		args.fn = arg1;
	}
	else {
		PINE.err("needle.addFunction has unrecognized parameters ("+typeof arg1+", "+typeof arg2+")");
		return;
	}

	args.needle = this;

	PINE.registerPineFunc(args);
}



PINE.createNeedle = function(key)  {
	key = key.toUpperCase();

	if(PINE.disabledNeedles.indexOf(key) !== -1) {
		U.log("info", "Needle of type: "+key+" disabled")
		var dummyNeedle = {};
		dummyNeedle.addFunction = function(){};
		return dummyNeedle;
	}

	var needles = PINE.needles;
	if(needles[key] == null)  {
		needles[key] = new PINE.class.Needle(key);
	}
	else {
		PINE.err("needle "+key+" already exists!");
	}

	return needles[key];
};


PINE.get = function(keyword) {
	if(keyword === undefined) return null;
	return PINE.needles[keyword.toUpperCase()];
}


PINE.Needle = function(keyword) {
	if(keyword === undefined) return null;

	var out = PINE.needles[keyword.toUpperCase()];

	if(out === undefined)
		out = PINE.createNeedle(keyword);

	return out;
}







/**********************************
*	 	<>PINEFUNC STUFF
**********************************/

PINE.pinefuncs = {};
PINE.pinefuncs.all = {};  //bookeeping
PINE.pinefuncs.queued = {};  //for super root, only remove oneOffs
PINE.pinefuncs.passed = {};  //for late commers


PINE.registerPineFunc = function(args)  {

	var needle = args.needle;
	var keyword = needle.keyword;
	var opType = args.opType || PINE.ops.COMMON;
	var userFn = args.fn;
	
	var isAsync = args.isAsync === true;
	var isMultirun = args.isMultirun === true;

	var pinefuncs = PINE.pinefuncs;


	if(opType == null)
		PINE.err("opType specified by needle '"+keyword+"' is undefined");

	else if(userFn == null)  
		PINE.err("function specified by needle '"+keyword+"' for opType "+opType+" is undefined");

	else if(pinefuncs.all[opType] == null) 
		PINE.err("operation of type '"+opType+"' specified by needle '"+keyword+"' does not exist");

	else {
		var addMe = new PINE.class.PineFunc(needle, opType, userFn, isAsync, isMultirun);
		
		pinefuncs.all[opType].push(addMe);
		pinefuncs.queued[opType].push(addMe);
		needle.pinefuncs[opType].push(addMe);
	}
}



//<>Pinefunc
PINE.class.PineFunc = function(needle, opType, userFn, isAsync, isMultirun)  {
	var my = this;

	my.id = PINE.class.PineFunc.counter++;

	my.keyword = needle.keyword;
	my.needle = needle;
	my.opType = opType;
		//
	my.isAsync = isAsync;
	my.runningAsyncs = [];

	my.isMultirun = isMultirun;

	
	my.fn = function(domNode)  {

		return U.Go( function( resolve, reject )  {
			var pinefunc = my;
			var history = domNode._pine_.pinefuncHistory;
			var passed = history[my.id];

			history[my.id] = true;
			my.needle.uses += 1;

			var onComplete = function() { 
				if(my.isAsync == true) {
					LOG("async", "completing async function for "+my.keyword);
					my.runningAsyncs.shift();
				}
				resolve();
			}

			if(!passed || my.isMultirun) {
				LOG("pinefunc", "running needle "+my.needle.keyword+my.opType+my.id+" at", domNode);

				if(my.isAsync == false) {
					userFn.call(my.needle, domNode);
					onComplete();
				}
				else {
					userFn.call(my.needle, domNode, onComplete);
					my.runningAsyncs.push(domNode);
				}
			}
			else {
				LOG("pinefunc", my.needle.keyword+my.opType+my.id+" not being run a second time");
				onComplete();
			}
		});
	}
}

PINE.class.PineFunc.counter = 0;







/**********************************
*	 	NODE FUNC
**********************************/

PINE.class.NodeFunc = function(domNode, func) {
	var me = this;
	this.domNode = domNode;
	// this.name = name;
	
	this.pre_fns = [];
	this.post_fns = [];

	this.fn = function() {
		var args = arguments;

		for(var pr in me.pre_fns)
			me.pre_fns[pr].apply(me.domNode, args);

		var out = func.apply(me.domNode, args);

		for(var po in me.post_fns)
			me.post_fns[po].apply(me.domNode, args);

		return out;
	}

	this.fn.add = function(arg1, arg2) {
		var beforeOrAfter;
		var func;
		if(typeof arg1 == "function") {
			beforeOrAfter = "after";
			func = arg1;
		}
		else {
			beforeOrAfter = arg1.toLowerCase();
			func = arg2;	
		}

		if(beforeOrAfter == "after") me.post_fns.push(func);
		else if(beforeOrAfter == "before") me.pre_fns.push(func);
		else PINE.err(beforeOrAfter+" is not a valid.  choose 'before' or 'after'");
	};

	return this.fn;
}


PINE.addFunctionToNode = function(domNode, funcName, func) {
	PINE.addNodeFunction(domNode, funcName, func);
}

PINE.addNodeFunction = function(domNode, funcName, func) {
	if(typeof domNode != "object" 
		|| typeof funcName != "string" 
		|| typeof func != "function") {
		PINE.err("PINE.addFunctionToNode takes the arguments (object domNode, sting funcname, function func)");
		return;
	}

	LOG("FNS", "adding function "+funcName+" to ", domNode);

	if(domNode.FNS[funcName] !== undefined) 
		PINE.err("fuction "+funcName+" already registered at", domNode)

	else domNode.FNS[funcName] = new PINE.class.NodeFunc(domNode, func);
}


PINE.getNodeFunction = function(domNode, funcName) {
	return domNode.FNS[funcName];
}














/**********************************
*	 	RUN HELPERS
**********************************/

PINE.keyApplies = function(keyword, domNode)  {
	if(keyword == '*') return true;
		//
	else if(keyword && domNode)  {
		keyword = keyword.toUpperCase();
		if(domNode.attributes && keyword.charAt(0) == '[')  {
			var att = keyword.replace(/\[|\]/g, '');
			return domNode.attributes[att] != null;
		}
		else return domNode.tagName == keyword;
	}
	return false;
}







/**********************************
*	 	          RUN
**********************************/

document.addEventListener("DOMContentLoaded", function(event) { 

	PINE.debug.init();
	LOG("overview", "DOMContentLoaded");

	PINE.loadResources().then( function() {
		
		PINE.run().then(function() {
			var listeners = PINE.eventListeners[PINE.events.load];

			if(listeners) {
				for(var i in listeners)
					listeners[i]();
			}


	  		PINE.loaded = true;
	  		U.log("success", "PINE Run complete");
	  		LOG("overview", "PINE Finished");	
		});
	});
});



//Perhaps best placed near PINEFuncs
//init() called at bottom of page
PINE.init = function() {

	for(var i in PINE.ops.order)  {
			//
		var opType = PINE.ops.order[i];

		PINE.pinefuncs.all[ opType ] = [];
		PINE.pinefuncs.queued[ opType ] = [];
		PINE.pinefuncs.passed[ opType ] = [];
	}
}



PINE.loadResources = function() {
	LOG("overview", "Loading Resources");	
	var promises = [];

	var resources = document.getElementsByTagName("needle");

	for( var i_r = 0; i_r < resources.length; i_r++ ) {
		promises.push(PINE.runResource(resources[i_r]));
	}

	return U.Go.all(promises);	
}

PINE.addedResources = {};
PINE.runResource = function(domNode) {
		//
	return U.Go(function(resolve, reject) {
			//
		var src = El.attr(domNode, "src");

		if(PINE.addedResources[src] !== undefined) resolve();

		else {
			PINE.addedResources[src] = domNode;

			LOG("overview", "Adding Resource "+src);	

			U.Ajax.get(src).then( function(request) {
				if(src.includes('.js')) {
					U.runScript(request.response, domNode, src);
					resolve();
				}

				else {
					var response = request.response;

					// var promises = [];
					var promise;

					response = response.replace(/<script(.|\s)*?>(\s|.)*?<\/script>/g, function(replaceMe) {
						replaceMe = replaceMe.replace(/<script(.|\s)*?>|<\/script>/g, '')
						// var promise = U.runScript(replaceMe, domNode, src);
						var addMe = U.runScript(replaceMe, domNode, src);;
						promise = promise ? promise.then(addMe) : addMe;
						// promises.push(promise);
						return '';
					});

					domNode.innerHTML += response;

					// Promise.all(promises).then(resolve);
					promise.then(resolve);
				}

			}, reject);
		}
	});

}








//the major function for PINE.  it creates the super root (PINE.forest), initiates it, and runs
//sprout on it using the queued pine funcs array (which all new pine funcs are added to)
PINE.run = function() {
	return U.Go(function(resolve, reject) {

		if(PINE.forest == null) {
			PINE.forest = {};
			PINE.forest.attributes = {};
			PINE.forest.tagName = "_PINE_FOREST";
		}

		var Pine_Forest = PINE.forest;
		Pine_Forest.childNodes = El.firstsOfKey(document, "PINE", false);

		//default to using body if "PINE" tag is never used
		if(Pine_Forest.childNodes == null)
			Pine_Forest.childNodes = [document.body];
		

		LOG("overview", "PINE Initiating DOM Tree");	
		PINE.initiate(Pine_Forest);

		LOG("overview", "PINE Sprouting Needles");	
		PINE.sprout(Pine_Forest, {
			queuedOps : PINE.pinefuncs.queued,
			passedOps : PINE.pinefuncs.passed
		}).then(resolve);
	});
}









// //initiate traverses the entire dom tree from root adding a variable for pine (_pine_)
PINE.initiate = function(root) {
	if(El.attr(root, "NOPINE") !== undefined) return;

	LOG("initiate", "initiate", root);

	//do not initiate text or comments
	if(root.nodeName == "#text" || root.nodeName == "#comment")
		return;

	//if not initiated, do so
	if(root._pine_ === undefined){
		root._pine_ = {};
			//
		root._pine_.ops = {};
		root._pine_.ops.hold = false;
		root._pine_.ops.queue = [];
		root._pine_.ops.applied = {};

		for( var i in PINE.ops.order )  {
			var opType = PINE.ops.order[ i ];
			root._pine_.ops.applied[ opType ] = [];
		}
			//
		root._pine_.fns = {};

		root._pine_.pinefuncHistory = {};
	}

	//pvars might be defined before an initiation
	if(root.PVARS === undefined)
		root.PVARS = {};

	if(root.PVARS.this === undefined)
		root.PVARS.this = root; 

	if(root.FNS === undefined)
		root.FNS = {};

	if(El.attr(root, "PINEEND") === undefined) {
		var branches = root.childNodes;
		for(var i = 0; branches && i < branches.length; i++)  
			PINE.initiate(branches[i]);
	}
}













/******************************************
*   ___   ___   ___   ___   _ _   ___
*  |  _| | _ \ | _ \ |   | | | | |_ _|
*  |_  | |  _/ |   / | | | | | |  | |
*  |___| |_|   |_|\_\|___| |___|  |_|
*
*	Make holds and current step separate
*
********************************************/



//TODO: micro improve performance by not running empty updates
PINE.updateAt = function(root, callback, passedOps) {

	LOG("async", "update at", root);

	var newRoot = (root._pine_ === undefined);
	if(newRoot){
		PINE.initiate(root);
		LOG("async", "new Root Found");
	}
	else if(root._pine_.ops.hold){
		LOG("async", "held node needs no updating!", root);
		
		//if a node is held, it is in the process of being updated already
		if(typeof callback == "function")
			PINE.ready(callback)

		return;
	}

	//if there are no passed ops, default to overal passed ops.  
	//case where passedOps are given is for when found by sprout.
	//passedOps will be all the ops which have already occured at the parent node
	//PINE.pinefuncs.passed contains only ops which have permeated the entire tree
	//the passedOps of parent may still be working through the tree and not in PINE.pinefuncs.passed
	var cloneMe = passedOps !== undefined ? passedOps : PINE.pinefuncs.passed;
	var updates = {};
	for(var opType in cloneMe) 
		updates[opType] = cloneMe[opType].slice(0);

	LOG("async", "updates for found node", updates);
	

	var willSprout = PINE.sprout(root, { queuedOps: updates }, newRoot);

	if(callback)
		willSprout.then(callback)
}









// PINE.growingSprouts = [];

//Sprout is a major function.  it applies all fuctions in queued ops to root
//and it's children, moving them to passedOps when they are complete, and then
//callsback when all queued functions have been applied.  If a function is added
//mid process to queued ops, it will be sent as well
PINE.sprout = function( root, args)  {
	var willSprout = U.Go( function( resolve, reject ) {
		var queuedOps = args.queuedOps;
			//
		LOG("sprout", "sprouting at; with; ", root, queuedOps);

		//active ops is where all the ops which have been noticed by sprout are held
		var incompleteOps = {};
		var unsentOps = {};
		var passedOps = args.passedOps = args.passedOps || {};
			
		//initializing
		for(var key in queuedOps) {
			incompleteOps[key] = [];
			unsentOps[key] = [];
			passedOps[key] = passedOps[key] || [];
		}		

		//permeateCalled is a boolean which checks whether on not this occurence of sprout was needed
		var permeateCalled = false;
		var permeatePromises = [];

		//in order of operations, multi use loop for checking for new
		//operations functions, and sending them off
		var checkNotPerm = true;
		for(var i = 0; i < PINE.ops.order.length; i++)  {

			//get the operation type
			var opType = PINE.ops.order[i];
			
			//checking mode, checks for new functions in the queue
			if(checkNotPerm)  {
				//if anything is queued for this operation type
				//copy the queue over to unsent and incomplete arrays
				//the unsent keeps track of what hasn't been sent (so no double sends occur)
				//while the incomplete array makes sure everything gets a callback
				if(queuedOps[opType].length) {
					unsentOps[opType] = unsentOps[opType].concat(queuedOps[opType]);
					incompleteOps[opType] = incompleteOps[opType].concat(queuedOps[opType]);
					queuedOps[opType] = [];		
				}

				//if everything has been moved from the queue to the unsent pile,
				//start sending things off
				var atTheEnd = (i == PINE.ops.order.length - 1);
				if(atTheEnd) {
					i = -1;
					checkNotPerm = false;
				}
			}

			//sending mode checks for things to send
			else {
				//get the not yet sent functions for this operation type
				//if there are any send them to be permeated and remove them from unsent
				var opFuncs = unsentOps[opType];
				if(opFuncs && opFuncs.length) {
						//
					unsentOps[opType] = [];
					

					(function(opFuncs, opType) {
						var permeate = PINE.permeate(root, opFuncs, null);
						var full_permeate = permeate.then( function() {
								//
							for(var i = 0; i < opFuncs.length; i++)  {
								LOG("opFunc", "removing ", opFuncs[i]);

								var target = incompleteOps[opType].indexOf(opFuncs[i]);
								if(target == -1)
									PINE.err(opFuncs[i]+" (opFuncs[i] does not exist in "+incompleteOps[opType]);
								else  {
									//remove the op from the queue
									//returns an array of length 1
									//then pushes the first element into the passedOps section
									var justCompleted = incompleteOps[opType].splice(target, 1);
									passedOps[ opType ].push( justCompleted[ 0 ] );
								}
							}
						});

						permeatePromises.push( full_permeate );
					})(opFuncs, opType);

					//after they have been sent, restart the check to make sure no new operations
					//have entered the queue, and mark permeate called as true
					permeateCalled = true;
					i = -1;
					checkNotPerm = true;
				}
			}	
		}

		


		//if permeate is never called, then the callback was never sent out as dependent on some other stuff
		//so just call it now.
		if(permeateCalled == false) {
			LOG("sprout uneeded", "sprout");
			resolve();
		}
		else U.Go.all( permeatePromises ).then( function() {
			return PINE.sprout( root, args );
		}).then(resolve);
	});
	
	// PINE.growingSprouts.push(willSprout);
	return willSprout;
}










//TODO verify that sproutstate is useless
PINE.permeate = function(root, opFuncs, layer)  {
	// if(sproutState === undefined) {
	// 	PINE.err("sproutState undefined in", root);
	// }

	layer = layer || '';
	layer += '.';

	return U.Go(function(resolve, reject) {
		LOG("permeate", layer+">> permeate", root, opFuncs)


		//Stop Case 1:  [NOPINE]
		if(El.attr(root, "NOPINE") !== undefined) {
			LOG("permeate", layer+"<<permeate stopping at NOPINE", root);
			resolve();
			return;
		}


		//Stop Case 2:  if this is a stopping point tag, resolve.  Don't muck around with script, style, or ENDPINE
		for(var i in PINE.stopTags) {
			if(root.tagName == PINE.stopTags[i]) {
				LOG("permeate", layer+"<<permeate stopping at tag "+root.tagName, root);
				resolve();
				return;
			}
		}

		//Stop Case 3:  text or comment node
		if(root.nodeName == "#text" || root.nodeName == "#comment") {
			LOG("permeate", layer+"<<permeate stopping at node "+root.nodeName, root);
			resolve();	
			return;
		}


		//function for how to apply itself when the time comes.
		//used below at different times in different cases
		var apply = function() {
			root._pine_.ops.hold = true;

			PINE.applyOpFuncsAtNode(root, opFuncs, layer).then(function() {
				root._pine_.ops.hold = false;

				PINE.permeateChildren(root, opFuncs, layer).then(resolve);

				//Once GATHER is done, try switching this out for the one above
				//If problems arise, put this in the then for permeate children
				var nextOpFuncs = root._pine_.ops.queue.shift();
					//
				if(nextOpFuncs)
					nextOpFuncs();			
			});
		}



		if(opFuncs[0].opType == PINE.ops.GATHER) {
			apply = function() {
				root._pine_.ops.hold = true;

				PINE.permeateChildren(root, opFuncs, layer).then(function() {
					PINE.applyOpFuncsAtNode(root, opFuncs, layer).then(function() {
						root._pine_.ops.hold = false;

						resolve();

						var nextOpFuncs = root._pine_.ops.queue.shift();
							//
						if(nextOpFuncs) 
							nextOpFuncs();			
						
					});		
				});
			}
		}







		//if this root has been initialized, it's a known part of the branch and up to date
		if(root._pine_ !== undefined) {

			//TODO: fix queing issues.
			//holds should only work if placed by an operation that is supposed to happen
			//before this operation

			//if an asynchronis needle is still working on this node, queue up
			if(root._pine_.ops.hold){
				LOG("async", layer+"queueing for hold on", root, opFuncs);
				root._pine_.ops.queue.push(function () {
					LOG("async", layer+"queued function called");
					apply();
				});
			}
			else apply();
		}

		//if this node has not been initiated
		else if(root._pine_ === undefined) {
			LOG("async", layer+"updates for found node");

			if(root.parentNode == undefined)
				PINE.err("no parent node for ", root)

			PINE.updateAt(root, function() {
				PINE.permeate(root, opFuncs, layer).then(resolve);
			}, root.parentNode._pine_.ops.applied);
		}

	});
}



PINE.applyOpFuncsAtNode = function(root, opFuncs, layer)  {

	return U.Go(function(resolve, reject) {

		var localOpFuncs = [];
		
		for(var i in opFuncs)  {
			if(PINE.keyApplies(opFuncs[i].keyword, root)) {
				localOpFuncs.push(opFuncs[i]);
			}
			root._pine_.ops.applied[opFuncs[i].opType].push(opFuncs[i]);
		}


		if(localOpFuncs.length)  {

			var promises = [];

			for(var op in localOpFuncs) {
				var opFunc = localOpFuncs[op];
				promises.push(opFunc.fn(root));
			}	

			U.Go.all(promises).then(resolve);
		}
		else resolve();

	});
	

}



PINE.permeateChildren = function(root, opFuncs, layer) {
		//
	return U.Go( function(resolve, reject) {

		if(El.attr(root, "ENDPINE") !== undefined) {
			resolve();
			return;
		}
			//
		var branches = root.childNodes;

		LOG("permeating children", "permeate");
		LOG(branches, "permeate");
		// LOG(childNodes, "run");

		if(branches && branches.length) {

			var childPermPromises = [];
				//
			for(var i = 0; i < branches.length; i++)  {
				childPermPromises.push( PINE.permeate(branches[i], opFuncs, layer) );
			}

			U.Go.all(childPermPromises).then(resolve);
				
		}
		else resolve();
	});
}






















/**********************************
*	 	<>DEBUGGING
**********************************/

//<>LOG

// U.showLog["all"] = true;  //
// U.showLog["needle"] = true; //
// U.showLog["permeate"] = true;
// U.showLog["pnv"] = true;
// U.showLog["initiate"] = true;
// U.showLog["run"] = true;
// U.showLog["sprout"] = true;  //
// U.showLog["pinefunc"] = true;  //
// U.showLog["opFunc"] = true;  //		
// U.showLog["async"] = true;
// U.showLog["FNS"] = true;

U.showLog = [];
U.observeLog = [];
var LOG = function()  {
	var logType = arguments[0] || "all";

	// console.log(logType);
	if (U.showLog[logType]){

		var callerLine = new Error().stack.split('\n');

		var line = logType+"::"
		line += callerLine[1].match(/([^\/])+?$/g)[0];

		if(callerLine[2]) {
			line += "....";
			line += callerLine[2].match(/([^\/])+?$/g)[0];
		}
		
		U.log("light", line);

		var args = [];

		for(var ar = 1; ar < arguments.length; ar++)
			args[ar-1] = arguments[ar];

		console.log.apply(console, args);
	}

	if (U.observeLog[logType]) {
		//output for event listeners
		var fns = PINE.eventListeners[ev.logUpdate];
			//
		if(fns) {
			var out = {};
			out.type = logType;
			out.text = '';

			for (var i = 1; i < arguments.length; i++)
				out.text += arguments[i];

			for(var i in fns)
				fns[i](out);	
		}
	}
}


PINE.debug = {};
PINE.debug.logErr = true;
PINE.debug.disableLOG = false;
PINE.debug.alertErr = false;
PINE.debug.on = true;
PINE.debug.showUnusedNeedles = true;
PINE.debug.showRunningAsyncs = true;

PINE.err = function(whatevers_the_problem) { //?
	if(PINE.debug.logErr)  {
		// var callerLine = new Error().stack.split('\n');
		// var line = callerLine[1].match(/([^\/])+?$/g)[0];
		// if(callerLine[2]) {
		// 	line += "....";
		// 	line += callerLine[2].match(/([^\/])+?$/g)[0];	
		// }

		var args = [];
		var showStack = true;
		var labelPine = true;

		for(var ar in arguments) {
			if(ar == 0 && typeof arguments[ar] == "string") {
				if(arguments[ar].indexOf("nostack") != -1)
			 		showStack = false;
			 	if(arguments[ar].indexOf("notpine") != -1)
			 		labelPine = false;

			 	if(labelPine && showStack)
			 		args.push(arguments[ar]);
			}
			else	
				args.push(arguments[ar]);
		}
		
		if(labelPine)
			args.unshift("PINE error: ");
		args.unshift("error");

		if(showStack) {
			var stack = {};
			stack.lines = [];
			var errorStack = new Error().stack.split('\n');
			for(var i in errorStack) {
				var shortened = errorStack[i].match(/(\/)?([^\/]*?\/)?([^\/]+?)$/g);
				stack.lines[i] = shortened && shortened.length ? shortened[0] : errorStack[i];
			}

			var badLine = stack.lines[1];


			U.log("light", badLine, stack);
		}
		

		U.log.apply(this, args)
		// console.log(new Error());
	}
	if(PINE.debug.alertErr)  {
		alert("PINE error: "+whatevers_the_problem);
	}
}











PINE.debug.init = function()  {

	if(PINE.debug.disableLOG)
		LOG = function() {}
	
	if(PINE.debug.on) {
		PINE.ready(PINE.debug.logAnalysis);
		setTimeout(PINE.debug.showRunningAsyncs, 10000)		
	}

	LOG("overview", "Debugging Tools Initialized");	
}





PINE.debug.logAnalysis = function() {

	var output = "to stop seeing all debuging messages, set PINE.debugOn = false"; 
	U.log("info", output);

	if(PINE.showUnusedNeedles) {
			//
		var unusedNeedles = "";
		for(var key in PINE.needles)  {
			if(PINE.needles[key].uses == 0) {
				if(unusedNeedles != "")
					unusedNeedles += ", ";

				unusedNeedles += "\""+key+"\"";
			}
		}

		if(unusedNeedles != "") {
			var output = "Unused Needles found:\n";
			output += unusedNeedles + "\n";
			output += "use PINE.disable(["+unusedNeedles+"]) if you have no intention of using these needles\n";
			output += "to stop seeing this message, set PINE.showUnusedNeedles = false";

			U.log("info", output);
		}
		else {
			
			U.log("success", "All needles used at least once.  Good job!");	
		}
	}
}



PINE.debug.showRunningAsyncs = function() {
	if(PINE.showRunningAsyncs) {
		var opTypes = PINE.pinefuncs.all;

		for(var op in opTypes) {
			var funcs = opTypes[op];
			for(var fu in funcs) {
				var func = funcs[fu];

				if(func.runningAsyncs.length) {
					var output = "Unterminated async function for "+func.needle.keyword+" "+func.opType;
					PINE.err(output);
				}
			}
		}
		
	}
}


















/**********************************
*	 	PINE UTILITIES
*	shall some day be replaced by 
*  native functions I hope
**********************************/


U.docReady = function(callback) {
	document.addEventListener("DOMContentLoaded", callback);
}


U.get = function(start, keyArrayOrString, bracketsCase)  {
	return U.getnit(start, keyArrayOrString, undefined, bracketsCase);
}

U.init = function(start, keyArrayOrString, init, bracketsCase)  {
	return U.getnit(start, keyArrayOrString, init, bracketsCase);
}

U.set = function(start, keyArrayOrString, init, bracketsCase)  {
	return U.getnit(start, keyArrayOrString, init, bracketsCase, true);
}


U.assertKey = U.assertArray = U.assertVar = function() {
	alert("USE u.get or u.init!!");
	PINE.err("USE u.get or u.init!!");
}




U.stringToVariableLayers = function(keyString, rootLess) {
	if(keyString === undefined)
		return;

	if(keyString.charAt(0) == '.')
		keyString = keyString.substr(1);

	// if(keyString.charAt(0) == '[' && keyString.charAt(keyString.length-1) == ']')
	// 	keyString = keyString.substr(1, keyString.length-2);


	var keyArray = [];
	var lastStop = 0;
	var openBrackets = 0;

	//go through string splitting at 0 depth end brackets (ie [[this]] [[notthis])
	//also split at dots
	//eg. exam.tests[lala.go["hey"]] == ["exam", "tests", "[lala.go['hey']]"];
	//eg. test['[test]'] == ["test", "['test']"]
	for(var c = 0; c < keyString.length; c++) {
		var char = keyString.charAt(c);

		if(char == '[') { 
			if(openBrackets == 0 && c != 0) {
				keyArray.push(keyString.substring(lastStop, c));
				lastStop = c;	
			}
			openBrackets++; 
		}
		else if(char == ']') {  openBrackets--;  }

		else if(openBrackets == 0 && char == '.') {
			keyArray.push(keyString.substring(lastStop, c));
			lastStop = c+1;	
		}
	}
	keyArray.push(keyString.substring(lastStop));




	var out = [];

	for(var i in keyArray) {
		var key = keyArray[i];
		var rootLessBracketCase = (i == 0 && rootLess == true); 
		if(!rootLessBracketCase && key.charAt(0) == '[') {
			key = key.substr(1, key.length-2);
			out.push(U.stringToVariableLayers(key));
		}
		
		else
			out.push(key);
	}

	return out;
}



//mix between get and init.
U.getnit = function(start, keyArrayOrString, init, bracketsCase, forceSet)  {
		//
	var pos = start;

	var keyArray;
	if(typeof keyArrayOrString == "string")
		keyArray = U.stringToVariableLayers(keyArrayOrString);
	else
		keyArray = keyArrayOrString;

	//there should be a starting point
	if(start && keyArray) {
			//
		
		for(var i in keyArray)  {
			var key = keyArray[i];

			if(typeof key == "object") {
				if(bracketsCase)
					key = bracketsCase(key);

				else
					key = getnit(window, key);
			}
			
			var atEnd = i >= keyArray.length - 1;

			if(pos[key] === undefined) {
				if(init === undefined)
					return undefined;

				else if(!atEnd)
					pos[key] = {};

				else pos[key] = init;
			}
			else if(forceSet && atEnd)
				pos[key] = init;

			pos = pos[key];
		}
	}

	return pos;
}







U.initArray = function(val, size)  {
	var out = [];
	for(var i = 0; i < size; i++) {
		out[i] = val;
	}
	return out;
}


U.removeFromArray = function(val, array) {
	var target = array.indexOf(val);

	if(target != -1)
		array.splice(target, 1);

	return target != -1;
}


U.Ajax = {};
U.Ajax.get = function(url, responseType) {
	return new Promise( function(resolve, reject) {

		var request = new XMLHttpRequest();
		request.responseType = responseType || "text";
		request.open('GET', url);
		

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				LOG("ajax", request.status+" "+url, request);

			    resolve(request);			    

			} else {
			    request.onerror();
			}
		};

		request.onerror = function() {
			var err = "include src '"+url+"' does not exist";
		  	PINE.err(err)
		  	reject(err)
		};

		try {
			request.send();	
		}
		catch(e) {
			var err = "NS_ERROR_DOM_BAD_URI: Access to restricted URI '"+url+"' denied";
			PINE.err(err)
		  	reject(err)
		}
	});
}





U.helpfulEval = function(evalMe, filename) {
	try {
		console.log("trying eval for "+filename);
		eval(evalMe);
	}
	catch(e) {
		var lineNumber = e.lineNumber ? e.lineNumber : -1;
		var errorOut = {};

		errorOut.lines = evalMe.split('\n');
		var line = errorOut.lines[lineNumber-1];

		PINE.err("eval error in file "+filename+" line: "+lineNumber+" of script: \n"+line, errorOut);
	}
}


U.ranScripts = [];
U.ranScripsNextId = 0;
U.runScript = function(scriptText, appendTo, src) {
	// console.log(scriptText);
	// var scriptText = scriptText + ' ';

	return new Promise( function(resolve, reject) {
		var id = U.ranScripsNextId;
		U.ranScripsNextId++;

		var ranScript = {};
		ranScript.text = scriptText;
		ranScript.resolve = resolve;
		ranScript.src = src || "no src";
			//
		U.ranScripts[id] = ranScript;



		scriptText = "var _scriptHelper = U.ranScripts["+id+"];\n"
			+"try {\n"+scriptText
			+"\n} catch(ex){\n"
				+"U.ranScriptException(_scriptHelper, ex); }\n"
			+"_scriptHelper.resolve();";

		
		var script = document.createElement("script");
		ranScript.element = script;

		script.innerHTML = scriptText;
		

		appendTo = appendTo || document.head;
		appendTo.appendChild(script);
	});
}

U.ranScriptException = function(_scriptHelper, ex) {
	var lineNumber = ex.lineNumber-2;
	var errorOut = {};
	errorOut.exception = ex;
	errorOut.lines = _scriptHelper.text.split('\n');
	var line = errorOut.lines[lineNumber-1];
	PINE.err("nostack notpine", 
		ex.message+'\n'
		+_scriptHelper.src+' :: '+lineNumber+':\n'
		+line,
		_scriptHelper.element,
		errorOut);
}


/****
*	Console colors shared by SeriousJoker
*	http://stackoverflow.com/a/25042340/4808079
*/

U.log = function() {
    var color = arguments[0] || "black";
    var bgc = "Transparent";
    switch (color) {
        case "success":  color = "Yellow";      			bgc = "Green";      	break;
        case "info":     color = "Black"; 	   				bgc = "Orange";       	break;
        case "error":    color = "#D33";   					bgc = "#222";          break;
        case "light":    color = "rgba(150,150,150,0.3)";     						break;
        default: color = color;
    }
    
    var coloring = "color:" + color + "; background-color: " + bgc + ";";

    var args = [];

    var insertAt = 0;

    if(typeof arguments[1] == "string")  {
    	args[0] = "%c"+arguments[1];
    	args[1] = coloring;
    }
    else {
    	args[insertAt] = arguments[1];
    }


    for(var ar = 2; ar < arguments.length; ar++) {
    	if(insertAt == 0) {
	    	if(typeof arguments[ar] == "string") {
	    		args[0] += arguments[ar]
	    	}
	    	else {
	    		insertAt = 2;
	    	}
	    }

	    if(insertAt != 0) {
	    	args[insertAt] = arguments[ar]
	    	insertAt++;
	    }
    }
    
    console.log.apply(console, args);
}



U.cookie = U.setCookie = U.getCookie = U.deleteCookie = function() {
	alert("DON'T USE COOKIES, USE LOCAL STORAGE");
	PINE.err("cookies no longer supported");
}



U.getHttpArg = function(varName, url){
	if(url === undefined)
		url = window.location.href;
   	// if(varName=(new RegExp('[?&]'+encodeURIComponent(varName)+'=([^&]*)')).exec(url))
    //     return decodeURIComponent(varName[1]);
    if(varName = (new RegExp('[?&]'+varName+'=([^&]*)')).exec(url))
        return varName[1];

    else return undefined;
}








/***********
*
*	Similar to promises, but only asynchronous when necessary
*
***********/

U.Go = function(fn) {
	var async = new U.Async(fn);
	var thenFn = new U.Thenable(async);

	thenFn.run();
	return thenFn;
}


U.Go.all = function(thenables) {
	var results = [];	

	var async = new U.Async(function(resolve, reject) {
		if(thenables.length) {

			for(var th in thenables) {
				var waitForMe = thenables[ th ];

				if(waitForMe.isAsync && waitForMe.status == true) {
					results.push(waitForMe.callbackReturn);
				}
				else if (waitForMe.isAsync == false && waitForMe.hasRun) {
					results.push(waitForMe.return);	
				}
				else {

					waitForMe.then( function(result) {
						results.push(result);
						if (results.length == thenables.length) {
							resolve(results);
						}				
					});
				}

			}
		}
		

		if (results.length == thenables.length) {
			resolve(results);
		}
	});

	var thenFn = new U.Thenable(async);
	thenFn.run();
	return thenFn;
}




U.Thenable = function(fn) {
	var my = this;
	my.fn = fn;
	my.next = undefined;
	my.status = undefined;
	my.callbackReturn;
	my.return;
	my.passed = false;
	my.hasRun = false;
	my.isAsync = false;
	my.recievedThenable;


	my.resolve = function(callbackReturn) {
		if(my.passed) {
			PINE.err("resolved thenable already passed")
			return;
		}

		my.callbackReturn = callbackReturn;
		my.status = true;		

		my.tryRunNext();
	}

	my.reject = function(callbackReturn) {
		my.callbackReturn = callbackReturn;
		my.status = false;
		PINE.err("rejected promise "+callbackReturn);
	}
}

U.Thenable.prototype.run = function(val) {
	this.hasRun = true;
	if ( this.fn instanceof U.Async ) {
		this.isAsync = true;
		this.fn.run(this.resolve, this.reject);
	}

	else if( this.fn instanceof U.Thenable ) {
		this.isAsync = true;
		this.fn.then(this.resolve);
	}

	else {
		if(typeof this.fn != "function"){
			PINE.err("non function");
		}
		this.return = this.fn(val);

		if(this.return instanceof U.Async) {
			this.isAsync = true;
			this.return.run(this.resolve, this.reject);
		}

		else {
			this.tryRunNext();		
		}
	}
	
	
}


U.Thenable.prototype.tryRunNext = function() {
	if(this.passed) {
		PINE.err("thenable already passed")
		return;
	}

	if(this.next && this.hasRun) {
			//
		if( this.isAsync ) {
			if( this.status ) {
				this.next.run( this.callbackReturn );
				this.passed = true;	
			}
		}
		else {
			this.next.run(this.return)
			this.passed = true;
		}
	}
}


U.Thenable.prototype.then = function(fn) {
	// if(typeof fn != "function"){
	// 	PINE.err("non function passes to then ", fn);
	// 	fn();
	// }

	// if( this.recievedThenable !== undefined ) {
	// 	return this.recievedThenable.then(fn);
	// }

	// else {
		var out = new U.Thenable(fn);

		if(this.next === undefined) {
			this.next = out;
		} else {
			PINE.err("double then")
		}

		this.tryRunNext();

		return out;
	// }
}







U.Async = function(fn) {
	this.fn = fn;
	this.called = false;
}

U.Async.prototype.run = function(resolve, reject) {
	if(this.called == false) {
		this.called = true;
		this.fn(resolve, reject);
	}
	else {
		PINE.err("async already called")
	}
}

















var El = PINE.UTILITIES.ELEMENT = {};

El.byId = function(id) {
	return document.getElementById(id);
}

El.byTag = function(domNode, tag) {
	return domNode.getElementsByTagName(tag);
}

El.firstOfTag = function(domNode, tag) {
	var result = El.byTag(domNode, tag);
	if(result.length)
		return result[0];
	else
		return undefined;
}

El.queryChildren = function(root, keyword, limit) {
	return El.cssQuery(root, "> "+keyword, limit);
	// var out = [];
	// for(var i in root.children)
}

El.cssQuery = function(root, selector, limit) {
	if(limit === 0)
		return [];

	selector = selector.trim();
	if(selector.charAt(0) == ">")
		selector = ":scope "+selector;

	if(limit == 1)
		return [root.querySelector(selector)];

	else
		return root.querySelectorAll(selector);
}


El.firstsOfKey = function(root, keyword, skipOnce)  {
	if(skipOnce === false && PINE.keyApplies(keyword, root)) {
		return root;
	}

	var out = [];

	var branches = root.childNodes;
	for(var i = 0; branches && i < branches.length; i++)  {
		var matches = El.firstsOfKey(branches[i], keyword, false);
		
		if(matches != null)
			out = out.concat(matches);
	}

	return (out.length > 0) ? out : null;
}



El.attr = function(domNode, name, value) {
	if(typeof domNode == "string")
		domNode = El.byId(domNode);

	if(domNode.attributes) {
		var target = domNode.attributes[name];

		if(target == null){
			if(value === undefined)
				return undefined;
			else {
				domNode.setAttribute(name, value);
			}
		}
		else {
			if(value === undefined)
				return target.value;
			else
				target.value = value;
		}
	}
	else return undefined;
}






El.attArg = function(domNode, attNames, type, defaultVal) {

	var out;
	type = type ? type.toLowerCase() : undefined;

	if(typeof attNames == "string")
		out = El.attr(domNode, attNames);

	else if (typeof attNames == "object") {
		for (var i = 0; i < attNames.length && out == undefined; i++){
			out = El.attr(domNode, attNames[i]);
		}
	}

	
	if(out === undefined)
		return defaultVal;

	else if (type == "string" || type == undefined)
		return out;

	else if (type == "int")
		return parseInt(out);

	else if (type == "domnode" || type == "id")
		return El.byId(out);

	else if (type == "float" || type == "double")
		return parseFloat(out);

	return out;
}


El.windowOffset = function(target) {
	var out = {};
		//
  	var bounds = target.getBoundingClientRect();
  	out.left = bounds.left + window.scrollX;
    out.top = bounds.top + window.scrollY;

    return out;
}

El.domReady = function(callback) {
	return U.docReady(callback);
}




El.getStyle = function (domNode, styleProp) {
    var out;
    if(domNode.currentStyle) {
        out = domNode.currentStyle[styleProp];
    } else if (window.getComputedStyle) {
    	var styling = document.defaultView.getComputedStyle(domNode, null);
        out = styling.getPropertyValue(styleProp);
    }
    return out;
}





PINE.init();













