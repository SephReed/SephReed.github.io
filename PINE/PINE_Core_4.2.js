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

// PINE.ops.POLISH = PINE.ops.GATHER;


//INIT assumes nothing.  It is used to set initial values (usually PVARS) prior to permeation or inline pvars.  
//PVARS assumes all core values (usually PVARS) are set except those to be set by "[pvars]".  PVARS is a special step for the "[pvars]" tag.
//STATIC assumes all core values (usually PVARS) are set.  STATIC functions have no inline attribute dependencies.
//COMMON assumes all values are properly set, both inline and PVAR.
//GATHER assumes the growth from it is complete.  
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

		return new SyncPromise( function( resolve, reject )  {
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
*http://sephreed.github.io/PINE/PINE_Run_Explanation.html
**********************************/

document.addEventListener("DOMContentLoaded", function(event) { 

	PINE.debug.init();
	LOG("overview", "DOMContentLoaded");

	PINE.loadResources().syncThen( function() {
		
		PINE.run().syncThen(function() {
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

	return SyncPromise.all(promises);	
}

PINE.addedResources = {};
PINE.runResource = function(domNode) {
		//
	return new SyncPromise(function(resolve, reject) {
			//
		var src = El.attr(domNode, "src");

		if(PINE.addedResources[src] !== undefined) resolve();

		else {
			PINE.addedResources[src] = domNode;

			LOG("overview", "Adding Resource "+src);	

			U.Ajax.get(src).syncThen( function(request) {
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
						var addMe = U.runScript(replaceMe, domNode, src);
						promise = promise ? promise.syncThen(addMe) : addMe;
						// promises.push(promise);
						return '';
					});

					domNode.innerHTML += response;

					// Promise.all(promises).then(resolve);
					promise.syncThen(resolve);
				}

			}, reject);
		}
	});

}








//the major function for PINE.  it creates the super root (PINE.forest), initiates it, and runs
//sprout on it using the queued pine funcs array (which all new pine funcs are added to)
PINE.run = function() {
	return new SyncPromise(function(resolve, reject) {

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
		}).syncThen(resolve);
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
* http://sephreed.github.io/PINE/PINE_Run_Explanation.html
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
		willSprout.syncThen(callback)
}









// PINE.growingSprouts = [];

//Sprout is a major function.  it applies all fuctions in queued ops to root
//and it's children, moving them to passedOps when they are complete, and then
//callsback when all queued functions have been applied.  If a function is added
//mid process to queued ops, it will be sent as well
PINE.sprout = function( root, args)  {
	var willSprout = new SyncPromise( function( resolve, reject ) {
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
						var full_permeate = permeate.syncThen( function() {
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
		else SyncPromise.all( permeatePromises ).syncThen( function() {
			return PINE.sprout( root, args );
		}).syncThen(resolve);
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

	return new SyncPromise(function(resolve, reject) {
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

			PINE.applyOpFuncsAtNode(root, opFuncs, layer).syncThen(function() {
				root._pine_.ops.hold = false;

				PINE.permeateChildren(root, opFuncs, layer).syncThen(resolve);

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

				PINE.permeateChildren(root, opFuncs, layer).syncThen(function() {
					PINE.applyOpFuncsAtNode(root, opFuncs, layer).syncThen(function() {
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
				PINE.permeate(root, opFuncs, layer).syncThen(resolve);
			}, root.parentNode._pine_.ops.applied);
		}

	});
}



PINE.applyOpFuncsAtNode = function(root, opFuncs, layer)  {

	return new SyncPromise(function(resolve, reject) {

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

			SyncPromise.all(promises).syncThen(resolve);
		}
		else resolve();

	});
	

}



PINE.permeateChildren = function(root, opFuncs, layer) {
		//
	return new SyncPromise( function(resolve, reject) {

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

			SyncPromise.all(childPermPromises).syncThen(resolve);
				
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
U.ranScriptsNextId = 0;
U.runScript = function(scriptText, appendTo, src) {
	// console.log(scriptText);
	// var scriptText = scriptText + ' ';

	return new Promise( function(resolve, reject) {
		var id = U.ranScriptsNextId++;
		
		var ranScript = {};
		ranScript.resolve = resolve;
		U.ranScripts[id] = ranScript;

		scriptText = scriptText + "\nU.ranScripts["+id+"].resolve()";

		var	file = new Blob([scriptText], {type: "text/javascript"});
		var url = URL.createObjectURL(file);

		var script = document.createElement("script");
	    script.src = url+"?"+src;
	    script.type = "text/javascript";

		appendTo = appendTo || document.head;
		appendTo.appendChild(script);
	});
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


var SyncPromise = function(fn) {
	var syncable = this;
	syncable.state = "pending";
	syncable.value;

	var wrappedFn = function(resolve, reject) {
		var fakeResolve = function(val) {
			syncable.value = val;
			syncable.state = "fulfilled";
			resolve(val);
		}

		fn(fakeResolve, reject);
	}

	var out = new Promise(wrappedFn);
	out.syncable = syncable;
	return out;
}

SyncPromise.all = function(promises) {
	for(var i in promises) {
		if(promises[i].syncable && promises[i].syncable.state == "fulfilled") {
			promises.splice(i, 1);
			i--;
		}
	}

	if(promises.length == 0)
		return new SyncPromise(function(resolve) { resolve(); });

	else
		return Promise.all(promises);
}

Promise.prototype.syncThen = function (nextFn) {
	if(this.syncable && this.syncable.state == "fulfilled") {
			//
		if(nextFn instanceof Promise) {
			return nextFn;
		}
		else {
			var val = this.syncable.value;
			var out = nextFn(val);
			return new SyncPromise(function(resolve) { resolve(out); });
		}
	}

	else return this.then(nextFn);
}










var El = PINE.UTILITIES.ELEMENT = function(domNode) {
	return new PINE.class.ElementHelper(domNode);
}

El.byID = El.byId = function(id) {
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

// El.on = function(domNode, eventName, fn) {
// 	domNode.addEventListener(eventName, fn);
// }

El.waitForDisplay = function(domNode) {
	if(El.waitForDisplayInited == false)
		El.initWaitForDisplay();

	return new Promise(function(resolve, reject) {
		var inWindow = El.getRootNode(domNode) == window;
		var isDisplayed = El.getStyle(domNode, "display") != "none";

		if(inWindow && isDisplayed) {
			resolve();
			return;
		}
		else {
			domNode.classList.add("watch_for_display");
		 	var onStart = function(event) {
			    if (event.animationName == 'watch_for_display_inserted' && event.target == domNode) {
			    	document.removeEventListener('animationstart', onStart);
			    	resolve();
			    }
			}
		 	document.addEventListener('animationstart', onStart);
		}
	});
}


//unfortunate hack used for El.waitForDisplay().  
//Very useful for any elements which make use of their dimensions on screen.
El.waitForDisplayInited = false;
El.initWaitForDisplay = function() {
	El.waitForDisplayInited = true;
	var display_watch_style = document.createElement("style");
	display_watch_style.textContent = "@keyframes watch_for_display_inserted { from { z-index: 1; } to { z-index: 1; } }"
		+	".watch_for_display { animation-duration: 0.001s; animation-name: watch_for_display_inserted; }";
	document.body.appendChild(display_watch_style);
}


	


El.getRootNode = function(branch) {
	var out = branch
	while(out.parentNode)
		out = out.parentNode;

	return out;
}




El.attArg = function(domNode, attNames, type, defaultVal, defaultAttVal) {

	var out;
	type = type ? type.toLowerCase() : undefined;

	if(typeof attNames == "string")
		out = El.attr(domNode, attNames);

	else if (typeof attNames == "object") {
		for (var i = 0; i < attNames.length && out == undefined; i++){
			out = El.attr(domNode, attNames[i]);
		}
	}

	if(type == "exists")
		return out != undefined;


	if(out === '') 
		out = defaultAttVal;
		
	if(out === undefined)
		return defaultVal;
	
	
	if (type == "string" || type == undefined)
		return out;

	else if (type == "int")
		return parseInt(out);

	else if (type == "id")
		return El.byId(out);

	else if (type == "tag")
		return El.byTag(domNode, out);

	else if (type == "tagFirst")
		return El.firstOfTag(domNode, out);

	else if (type == "selector")
		return El.cssQuery(domNode, out);

	else if (type == "float" || type == "double")
		return parseFloat(out);

	else if (type == "boolean")
		return out == "true" ? true : out == "false" ? false : undefined;

	return out;
}


El.makeSizeCalculatable = function(domNode) {
	var positioning = El.getStyle(domNode, "position");
	
	if(positioning == undefined || positioning == 'static')
		domNode.style.position = "relative";
}

El.windowOffset = function(target) {
	var out = {};
		//
  	var bounds = target.getBoundingClientRect();
  	out.left = bounds.left + window.scrollX;
    out.top = bounds.top + window.scrollY;

    return out;
}

El.relativePos = function(ofMe, toMe) {
	var spaceBounds = ofMe.getBoundingClientRect();
	var itemBounds = toMe.getBoundingClientRect();

	var x = itemBounds.left - spaceBounds.left;
	var y = itemBounds.top - spaceBounds.top;

	return {x: x, y: y};
}


El.overlap = function(el1, el2) {

	var bounds1 = el1.getBoundingClientRect();
	var bounds2 = el2.getBoundingClientRect();

	var firstIstLeftmost = (bounds1.left <= bounds2.left);
	var leftest = firstIstLeftmost ? bounds1 : bounds2;
	var rightest = firstIstLeftmost ? bounds2 : bounds1;

	if(leftest.right > rightest.left) {
			//
		var firstIsTopmost = (bounds1.top <= bounds2.top);
		var topest = firstIsTopmost ? bounds1 : bounds2;
		var bottomest = firstIsTopmost ? bounds2 : bounds1;

		return topest.bottom > bottomest.top;
	}
	else return false;
}


// El.domReady = function(callback) {
// 	return U.docReady(callback);
// }




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





var ElementHelper = PINE.class.ElementHelper = function(domNode) {
	if(typeof domNode == "string")
		this.domNode = El.byID(domNode);

	else
		this.domNode = domNode;
}
ElementHelper.prototype.byTag = function(tag) {
	return El.byTag(this.domNode, tag);
}
ElementHelper.prototype.firstOfTag = function(tag) {
	return El.firstOfTag(this.domNode, tag);
}

ElementHelper.prototype.queryChildren = function(keyword, limit) {
	return El.cssQuery(this.domNode, "> "+keyword, limit);
}

ElementHelper.prototype.cssQuery = function(selector, limit) {
	return El.cssQuery(this.domNode, keyword, limit);
}

ElementHelper.prototype.firstsOfKey = function(keyword, skipOnce)  {
	return El.firstsOfKey(this.domNode, keyword, skipOnce);
}

ElementHelper.prototype.attr = function(name, value) {
	return El.attr(this.domNode, name, value); 
}

ElementHelper.prototype.waitForDisplay = function() {
	return El.waitForDisplay(this.domNode);
}

ElementHelper.prototype.getRootNode = function() {
	return El.getRootNode(this.domNode);	
}

ElementHelper.prototype.makeSizeCalculatable = function() {
	return El.makeSizeCalculatable(this.domNode);	
}

ElementHelper.prototype.relativePos = function(toMe) {
	return El.relativePos(this.domNode, toMe);	
}

ElementHelper.prototype.overlap = function(withMe) {
	return El.overlap(this.domNode, withMe);	
}

ElementHelper.prototype.getStyle = function(styleProp) {
	return El.getStyle(this.domNode, styleProp);	
}





PINE.init();
PINE.err("SWITCH TO 4.8!!");