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

"use strict"









var PINE = {};
PINE.class = {};

var U = PINE.UTILITIES = {};
// PINE.createMutateLogger = false;


PINE.loaded = false;

PINE.evals = [];

PINE.stopTags = [
	"DEPINE",
	"SCRIPT",
	"STYLE",
	"HTML"
]


PINE.stopNodes = [
	"#text",
	"#comment"
]




/**********************************
*	 	PINE INTERFACE FUNCTIONS 
**********************************/

var ev = PINE.events = {};
PINE.events.load = "DOMContentLoaded";
PINE.validEvents = [ev.load];
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
PINE.ops.PREPROCESS = "preprocess";
PINE.ops.INITIALIZER = "initializers";
PINE.ops.STATIC = "static";
PINE.ops.POPULATER = "populater";
PINE.ops.DEFINER = "definer";
PINE.ops.FINALIZER = "finalizer";

PINE.ops.order = [
	PINE.ops.PREPROCESS, 
	PINE.ops.INITIALIZER, 
	PINE.ops.STATIC, 
	// PINE.ops.SEMISTATIC, 
	PINE.ops.POPULATER, 
	PINE.ops.DEFINER,
	PINE.ops.FINALIZER
];


//resources, inits, static, common, captures, antistatic, polish









/**********************************
*	 	<>PINEFUNC STUFF
**********************************/

PINE.pinefuncs = {};
PINE.pinefuncs.all = {};  //bookeeping
PINE.pinefuncs.queued = {};  //for super root, only remove oneOffs
PINE.pinefuncs.passed = {};  //for late commers


for(var i in PINE.ops.order)  {
		//
	var opType = PINE.ops.order[i];

	PINE.pinefuncs.all[ opType ] = [];
	PINE.pinefuncs.queued[ opType ] = [];
	PINE.pinefuncs.passed[ opType ] = [];
}




//<>Pinefunc
PINE.class.PineFunc = function(needle, opType, userFn, autoComplete, oneOff)  {
	var my = this;

	my.id = PINE.class.PineFunc.counter;
	PINE.class.PineFunc.counter++;

	my.keyword = needle.keyword;
	my.needle = needle;
	my.opType = opType;
	my.oneOff = true;
	my.runningAsyncs = [];

	
	my.fn = function(domNode)  {

		return U.Go( function( resolve, reject )  {
			var helpers = {};
			var pinefunc = my;
			var history = domNode._pine_.pinefuncHistory;
			var passed = history[my.id];

			my.needle.uses += 1;

			helpers.complete = function() { 
				// console.log("complete");
				// console.log(domNode);
				// console.log(pinefunc.keyword);

				history[my.id] = true;
				// domNode._pine_.needles[pinefunc.keyword].passed = true;
				// callbackPermeate(pinefunc);
				if(autoComplete == false) {
					LOG("async", "completing async function for "+my.keyword);
					my.runningAsyncs.shift();
				}

				resolve();
			}


			// var passed = U.getnit(domNode, "_pine_.needles['"+my.keyword+"'].passed", false);
			// LOG(my.keyword+" passed = "+passed, "pinefunc");
			

			// var passes = U.getnit(domNode, "_pine_.pinefuncs", {});
			// LOG(my.keyword+" passed = "+passed, "pinefunc");


			if(!passed || !my.oneOff) {

				// alert(my.needle.keyword+my.opType+my.id+" IS ON");

				LOG("running needle "+my.keyword+" at", "needle");
				LOG(domNode, "needle");
				userFn.call(helpers, domNode, my.needle, helpers);

				if(autoComplete) {
					LOG("calling autoComplete for "+my.keyword, "pinefunc");
					helpers.complete();
				}
				else {
					my.runningAsyncs.push(domNode);
				}
			}
			else {
				LOG("pinefunc", my.needle.keyword+my.opType+my.id+" not being run a second time");
				helpers.complete();
			}
		});
		
	}
}

PINE.class.PineFunc.counter = 0;




PINE.registerFunction2 = function(args)  {
	var keyword = args.keyword.toUpperCase();
	var opType = args.step_type;
	var userFn = args.fn;
	var autoComplete = !(args.autoComplete == false);
	var oneOff = args.oneOff || false;
	var asyncContent = args.asyncContent || false;


	var needle = PINE.get(keyword);
	var pinefuncs = PINE.pinefuncs;


	if(needle == null)  
		PINE.err("needle of keyword:"+keyword+" does not exist.  Use PINE.createNeedle(keyword) first");

	else if(opType == null)
		PINE.err("opType specified by needle '"+keyword+"' is undefined");

	
	else {
		var addMe = new PINE.class.PineFunc(needle, opType, userFn, autoComplete, oneOff);
		
		if(pinefuncs.all[opType] == null) {
			PINE.err("operation of type '"+opType+"' specified by needle '"+keyword+"' did not exist in the original OrderOfOperations (PINE.ops.order).  If not explicitly added to the order, it will never be called.");
			pinefuncs.all[opType] = pinefuncs.all[opType] | [];
			pinefuncs.queued[opType] = pinefuncs.queued[opType] | [];
			pinefuncs.passed[opType] = pinefuncs.passed[opType] | [];
		}

		pinefuncs.all[opType].push(addMe);
		pinefuncs.queued[opType].push(addMe);

		if(needle.pinefuncs[opType] == null)
			needle.pinefuncs[opType] = [];

		needle.pinefuncs[opType].push(addMe);

		
	}
}





/**********************************
*	 	NEEDLE STUFF
* do they inject functionality?
* are they the last step in the pine branching process?
* do they fulfill a need?
* YES
**********************************/
PINE.needles = {};

PINE.class.Needle = function(keyword) {
	this.keyword = keyword;
	this.uses = 0;
	this.pinefuncs = {};

	for(var i in PINE.OrderOfOperations)  {
			//
		var opType = PINE.OrderOfOperations[i];

		this.pinefuncs[ opType ] = [];
	}

}


PINE.class.Needle.prototype.addFunction = function(args) {
	args.keyword = this.keyword;
	// PINE.registerFunction(args);
	PINE.registerFunction2(args);
}


PINE.class.DummyNeedle = function(keyword) {}
PINE.class.DummyNeedle.prototype.addFunction = function(args) {}



PINE.createNeedle = function(key)  {
	key = key.toUpperCase();

	if(PINE.disabledNeedles.indexOf(key) !== -1) {
		U.log("info", "Needle of type: "+key+" disabled")
		return new PINE.class.DummyNeedle(key);
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



// PINE.createNeedle("PINE");






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

		func.apply(me.domNode, args);

		for(var po in me.post_fns)
			me.post_fns[po].apply(me.domNode, args);
	}

	this.fn.add = function(func, beforeOrAfter) {
		beforeOrAfter == beforeOrAfter ? beforeOrAfter.toLowerCase() : "after"

		if(beforeOrAfter == "after") me.post_fns.push(func);
		else if(beforeOrAfter == "before") me.pre_fns.push(func);
		else PINE.err(beforeOrAfter+" is not a valid.  choose 'before' or 'after'");
	};

	return this.fn;
}

// PINE.class.NodeFunc.prototype.setMainFn(func) {
	

// 	return this.fn;
// }


// PINE.class.NodeFunc.prototype.add = function(fn, postNotPre) {
// 	if(postNotPre === undefined)
// 		postNotPre = true;

// 	if(postNotPre) post_fns.push(fn);
// 	else pre_fns.push(fn);
// };


PINE.addFunctionToNode = function(domNode, funcName, func) {
	LOG("adding function "+funcName+" to node:", "FNS");
	LOG(domNode, "FNS");

	if(domNode.FNS[funcName] !== undefined) {
		// PINE.err("fuction "+funcName+" already registered at domNode ")
		// PINE.err(domNode)
		// PINE.err("this is an error with passed round in PINE.updateAt ")
	}

	else domNode.FNS[funcName] = new PINE.class.NodeFunc(domNode, func);
}


PINE.getNodeFunction = function(domNode, funcName) {
	return domNode.FNS[funcName];
}





/**********************************
*	 	NEEDLE HELPERS
**********************************/






PINE.atFirstHtml = function(domNode, callback)  {

	if(domNode.innerHTML.match(/.+/g))
		callback(domNode);

	else {
		// create an observer instance
		var observer = new MutationObserver(function(mutations) {
			if(domNode.innerHTML.match(/.+/g)) {
				observer.disconnect();
				callback(domNode);
			}
		});
		 
		var config = { childList: true, subtree: true }; 
		observer.observe(domNode, config);
	}
}


















/**********************************
*	 	RUN HELPERS
**********************************/

PINE.getFirstsOf = function(root, keyword)  {
	if(PINE.keyApplies(keyword, root)) {
		return root;
	}

	var out = [];

	var branches = root.childNodes;
	for(var i = 0; branches && i < branches.length; i++)  {
		var matches = PINE.getFirstsOf(branches[i], keyword);
		
		if(matches != null)
			out = out.concat(matches);
	}

	return (out.length > 0) ? out : null;
}


PINE.keyApplies = function(keyword, domNode)  {
	if(keyword && domNode)  {
		keyword = keyword.toUpperCase();
		if(keyword.charAt(0) == '[')  {
			var att = keyword.replace(/\[|\]/g, '');
			return domNode.attributes[att] != null;
		}
		else return domNode.tagName == keyword;
	}
	return false;
}






/******************************************
*   ___   ___   __    ___
*  |_ _| |   | |  \  |   |
*   | |  | | | | | | | | |
*   |_|  |___| |__/  |___|
*
*	Make holds and current step separate
*
********************************************/




document.addEventListener("DOMContentLoaded", function(event) { 

	// console.log(event)
	// alert("content loaded")

  	
  	if(PINE.debugOn === true)
  		PINE.initDebug();


	PINE.run().then(function() {
		var listeners = PINE.eventListeners[PINE.events.load];

		if(listeners) {
			for(var i in listeners)
				listeners[i]();
		}

		if(PINE.debugOn === true)
  			setTimeout(PINE.logDebugAnalysis, 2000);

  		PINE.loaded = true;
  		U.log("success", "PINE Run complete");
	});


	setTimeout(function() {
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
	}, 5000)
	
});





//TODO: make sure hold and steps are separated



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
		Pine_Forest.childNodes = PINE.getFirstsOf(document, "PINE");

		PINE.initiate(Pine_Forest);
		PINE.sprout(Pine_Forest, {
			// PINE.pinefuncs.queued, PINE.pinefuncs.passed, true
			queuedOps : PINE.pinefuncs.queued,
			passedOps : PINE.pinefuncs.passed
		}).then(resolve);
	});
}









PINE.initiationFuncs = [];

PINE.initiationFuncs.push(function(root) {
	LOG("initiate", "initiate");
	LOG(root, "initiate");


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
			//
		root._pine_.fns = {};

		root._pine_.pinefuncHistory = {};
	}

	//pvars might be defined before an initiation
	if(root.PVARS === undefined)
		root.PVARS = {};

	if(root.FNS === undefined)
		root.FNS = {};

	//move on to children, regardless of personal init state
	var branches = root.childNodes;
	for(var i = 0; branches && i < branches.length; i++)  
		PINE.initiate(branches[i]);
});


//initiate traverses the entire dom tree from root adding a variable for pine (_pine_)
PINE.initiate = function(root) {
	for(var i in PINE.initiationFuncs) {
		PINE.initiationFuncs[i](root);
	}
}










PINE.growingSprouts = [];



//Sprout is a major function.  it applies all fuctions in queued ops to root
//and it's children, moving them to passedOps when they are complete, and then
//callsback when all queued functions have been applied.  If a function is added
//mid process to queued ops, it will be sent as well
PINE.sprout = function( root, args)  {
	var willSprout = U.Go( function( resolve, reject ) {
		var queuedOps = args.queuedOps;
			//
		LOG("sprouting at; with; ", "sprout");
		LOG(root, "sprout");
		LOG(queuedOps, "sprout");

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

		//this is the callback that happens after each successful permeate
		//the fuction is what is called back when all permeates have occured
		//because some permeates might be asynchronous, sprout is called again to ensure
		//nothing was added in while waiting
		// var permeateCallback = PINE.createPermeateCallBack(queuedOps, incompleteOps, passedOps, function() {
			// PINE.sprout(root, queuedOps, passedOps, newRoot).then(resolve);
		// });
		

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
				//get the unsent functions for this operation type
				//if there are any send them to be permeated and remove them from unsent
				var opFuncs = unsentOps[opType];
				if(opFuncs && opFuncs.length) {
						//
					unsentOps[opType] = [];

					// if(newRoot) {
						// PINE.permeate2(root, opFuncs, permeateCallback, newRoot);
					(function(opFuncs, opType, sproutState) {
						var permeate = PINE.permeate(root, opFuncs, null, sproutState);
						permeate = permeate.then( function() {
								//
							for(var i = 0; i < opFuncs.length; i++)  {
								LOG("removing", "opFunc");
								LOG(opFuncs[i], "opFunc");

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

						permeatePromises.push( permeate );
					})(opFuncs, opType, args);

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
			// if(resolve !== undefined)
				resolve();
		}
		else U.Go.all(permeatePromises).then(resolve);
	});
	
	PINE.growingSprouts.push(willSprout);
	return willSprout;
}











PINE.permeate = function(root, opFuncs, layer, sproutState)  {
	if(sproutState === undefined) {
		PINE.err("sproutState undefined in", root);
	}

	layer = layer || '';
	layer += '.';

	return U.Go(function(resolve, reject) {
		LOG("permeate", layer+">> permeate", root, opFuncs)


		//if this is a stopping point tag, resolve
		for(var i in PINE.stopTags) {
			if(root.tagName == PINE.stopTags[i]) {
				LOG("permeate", layer+"<<permeate stopping at tag "+root.tagName, root);
				resolve();
				return;
			}
		}

		//if this is a stopping point node, resolve
		for(var i in PINE.stopNodes) {
			if(root.nodeName == PINE.stopNodes[i]) {
				LOG("permeate", layer+"<<permeate stopping at node "+root.nodeName, root);
				resolve();
				return;
			}
		}

		
		//if this is a stopping point tag, resolve
		// var runNextInQueue = function() {
		// 	var nextOpFuncs = root._pine_.ops.queue.pop();

		// 	if(nextOpFuncs)
		// 		nextOpFuncs();
		// }

		var apply = function() {
			PINE.applyOpFuncsAtNode(root, opFuncs, layer).then(function() {

				PINE.permeateChildren(root, opFuncs, layer, sproutState).then(function() {
					LOG("permeate", layer+"<< permeate", root)
					resolve();

					var nextOpFuncs = root._pine_.ops.queue.shift();

					if(nextOpFuncs) {
						nextOpFuncs();			
					}
				});

			});
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

			// //TODO: Fix this so that it is the passed functions of this round.

			LOG("async", layer+"updates for found node");
	
			
			PINE.updateAt(root, function() {
				PINE.permeate(root, opFuncs, layer, sproutState).then(resolve);
			}, sproutState.passedOps);

			
		}

	});
}



PINE.applyOpFuncsAtNode = function(root, opFuncs, layer)  {

	return U.Go(function(resolve, reject) {
		// var resolve = resolve;
		// console.log(layer+">> applyOpFuncs", root, opFuncs)
			//
		root._pine_.ops.hold = true;
		LOG("hold", "run");
		LOG(root, "run");

		//TODO: callback parent first if nothing in queue should happen first
		var complete = function() {

			LOG("unhold", "run");
			LOG(root, "run");
			root._pine_.ops.hold = false;

			// console.log(layer+"<< applyOpFuncs", root)F

			resolve();
		}


		var localOpFuncs = [];

		
		for(var i in opFuncs)  {
			if(PINE.keyApplies(opFuncs[i].keyword, root)) {
				localOpFuncs.push(opFuncs[i]);
			}
		}


		if(localOpFuncs.length)  {
				//
			// console.log("local ops found", localOpFuncs);

			var promises = [];

			for(var op in localOpFuncs) {
				var opFunc = localOpFuncs[op];
				promises.push(opFunc.fn(root));
			}

			// console.log(layer+"promises", promises);

			U.Go.all(promises).then(complete);
		}
		else complete();

	});
	

}



PINE.permeateChildren = function(root, opFuncs, layer, sproutState) {
		//
	return U.Go( function(resolve, reject) {
			//
		var branches = root.childNodes;

		LOG("permeating children", "permeate");
		LOG(branches, "permeate");
		// LOG(childNodes, "run");

		if(branches && branches.length) {

			// var childListCopy = [];
			var childPermPromises = [];
				//
			for(var i = 0; i < branches.length; i++)  {
				// childListCopy.push(branches[i]);
				childPermPromises.push( PINE.permeate(branches[i], opFuncs, layer, sproutState) );
			}

			// console.log( layer + "child promises", childPermPromises )
			U.Go.all(childPermPromises).then(resolve);


			// var childCallback = PINE.createChildCallback(root, opFuncs, childListCopy, callbackParent);
				//
			// for(var i = 0; i < childListCopy.length; i++)  
				// PINE.permeate2(childListCopy[i], opFuncs, childCallback);
				
		}
		else resolve();
	});
}









//TODO: micro improve performance by not running empty updates
PINE.updateAt = function(root, callback, passedOps) {

	LOG("async", "update at", root);

	var newRoot = (root._pine_ === undefined);
	if(newRoot){
		PINE.initiate(root);
		LOG("async", "new Root Found");
		// console.log("new Root", root);
	}
	else if(root._pine_.ops.hold){
		LOG("async", "held node needs no updating!", root);
		// alert("wo")

		if(typeof callback == "function")
			PINE.ready(callback)
		//TODO FIX
		return;
	}

	//TODO: Fix this so that it is the passed functions of this round.
	var cloneMe = passedOps !== undefined ? passedOps : PINE.pinefuncs.passed;
	var updates = {};
	for(var opType in cloneMe) 
		updates[opType] = cloneMe[opType].slice(0);

	LOG("async", "updates for found node", updates);
	

	var willSprout = PINE.sprout(root, { queuedOps: updates }, newRoot);

	if(callback)
		willSprout.then(callback)
}













/**********************************
*	 	<>DEBUGGING
**********************************/
PINE.logErr = true;
PINE.alertErr = false;
PINE.debugOn = true;
PINE.showUnusedNeedles = true;
PINE.showRunningAsyncs = true;

PINE.err = function(whatevers_the_problem) { //?
	if(PINE.logErr)  {
		var callerLine = new Error().stack.split('\n');
		var line = callerLine[1].match(/([^\/])+?$/g)[0];
		if(callerLine[2]) {
			line += "....";
			line += callerLine[2].match(/([^\/])+?$/g)[0];	
		}

		var args = [];

		for(var ar in arguments)
			args[ar] = arguments[ar];
		
		args.unshift("PINE error: ");
		args.unshift("error");

		U.log("light", line);

		U.log.apply(this, args)
		// console.log(new Error());
	}
	if(PINE.alertErr)  {
		alert("PINE error: "+whatevers_the_problem);
	}
}



var LOG = function() { return; }
U.showLog = [];

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


PINE.initDebug = function()  {

	if(PINE.createMutateLogger == true) {
		// select the target node
		var target = document.querySelector('body');
		 
		// create an observer instance
		var observer = new MutationObserver(function(mutations) {
		  mutations.forEach(function(mutation) {
		    console.log(mutation);
		  });    
		});
		 
		// configuration of the observer:
		var config = { attributes: true, childList: true, characterData: true, subtree: true };
		 
		// pass in the target node, as well as the observer options
		observer.observe(target, config);

		console.log(observer);
 	}


 	LOG = function()  {
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
	}

	

}


PINE.logDebugAnalysis = function() {

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





















/**********************************
*	 	PINE UTILITIES
*	shall some day be replaced by 
*  native functions I hope
**********************************/





U.get = function(start, keyString, bracketsCase)  {
	return U.getnit(start, keyString, undefined, bracketsCase);
}



U.assertVar = function(start, keyString, keyNotArray)  {
	var keyArray = keyString.match(/[\w\d]+/g)
	var pos = start;

	var noNeed = true;

	if(start) {
		for(var i in keyArray)  {
			var key = keyArray[i];
			if(pos[key] == null) {
				pos[key] = {};
				noNeed = false;
			}
			pos = pos[key];
		}
	}
	else noNeed = false;

	if(keyNotArray == false && noNeed == false){
		pos = [];
	}

	return noNeed;
}



//mix between get and init.
U.getnit = function(start, keyString, init, bracketsCase)  {
	// console.log("case");
	// console.log(bracketsCase);
	// console.log(keyString);

	if(keyString === undefined)
		return start;

	var bracketsCase = bracketsCase || U.get;

	// console.log("getting"+keyString)
	// console.log(start);
	
	var pos = start;

	
	//if there is a starting point
	if(start) {
			//
		var keyArray = [];
		var lastStop = 0;
		var openBrackets = 0;
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

		// console.log(keyArray);


		//match any brackets, or any string of digits and characters
		//KLUDGE: very little error handling
		// var keyArray = keyString.match(/(\[.+?\])|([\w\d]+)/g)
		for(var i in keyArray)  {
			var key = keyArray[i];

			// console.log("IN"+key);

			//if this is a brackets match, remove the outermost brackets
			if(key.charAt(0) == '[') {
				key = key.replace(/(^\[|\]$)/g, '');

				//if the new first char not a quote it is it's own variable
				if (key.charAt(0) != "'" && key.charAt(0) != '"') {
					// console.log("HEYHE");
					key = bracketsCase(start, key, bracketsCase);
					// console.log("SPECIAL CASE"+key);
				}

				//otherwise, replace the quotes
				else {
					key = key.replace(/['"]/g, '');
				}
			}
			

			// console.log("OUT"+key);

			if(pos[key] === undefined) {
				if(init === undefined)
					return undefined;

				//last one
				else if(i < keyArray.length - 1)
					pos[key] = {};

				else pos[key] = init;
			}
			pos = pos[key];
		}
	}

	return pos;
}




U.assertKey = function(start, keyString)  {
	U.assertVar(start, keyString, true);
}

U.assertArray = function(start, keyString)  {
	U.assertVar(start, keyString, false);
}


// U.clone = function(obj) {
//     if (null == obj)  return obj;

//     // console.log(typeof obj + "::");
//     // console.log(obj);

//     if("object" == typeof obj)  {
//     	var copy;
//     	try { copy = obj.constructor(); }
//     	catch(e) {
//     		PINE.err("Trynig to copy an object which references itself", e);

//     		return;
//     	}

//     	// console.log("should not be last");

// 	    for (var attr in obj) {
// 	        if (obj.hasOwnProperty(attr)) {
// 	        	copy[attr] = U.clone(obj[attr]);
// 	        }
//     	}
//     }
//     else if("array" == typeof obj)  {
//     	// console.log("IN ARRAY");
//     	PINE.err("U.clone array case unfinished");
//     }
//     else return obj;
    
//     return copy;
// }


U.initArray = function(val, size)  {
	var out = [];
	for(var i = 0; i < size; i++) {
		out[i] = val;
	}
	return out;
}



// PINE.deepCloneNode = function(cloneMe)  {
// 	// console.log("cloning:");
// 	// console.log(cloneMe);

// 	var out = cloneMe.cloneNode(true);
// 	out._pine_ = U.clone(cloneMe._pine_);

// 	return out;
// }




// U.ajax = function(url, callback){
//     var xmlhttp;
//     // compatible with IE7+, Firefox, Chrome, Opera, Safari
//     xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function(){
//         if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
//             callback(xmlhttp.responseText);
//         }
//         else {
//         	console.log("error in U.ajax");
//         }
//     }
//     xmlhttp.open("GET", url, true);
//     xmlhttp.send();
// }


// U.attr = function(domNode, name, value) {
// 	var target = domNode.attributes[name];

// 	if(target == null){
// 		if(value === undefined)
// 			return undefined;
// 		else return null;
// 			//create the attribute and assign value
// 	}
// 	else {
// 		if(value === undefined)
// 			return target.value;
// 		else
// 			target.value = value;
// 	}
// }



/****
*	Console colors shared by SeriousJoker
*	http://stackoverflow.com/a/25042340/4808079
*/

U.log = function() {
    var color = arguments[0] || "black";
    var bgc = "Transparent";
    switch (color) {
        case "success":  color = "Yellow";      	bgc = "Green";      	break;
        case "info":     color = "Black"; 	   		bgc = "Orange";       	break;
        case "error":    color = "Red";        		bgc = "Black";          break;
        case "light":    color = "rgba(150,150,150,0.3)";     				break;
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





/***
*	Cookie get and set shared by Srinivas Sabbani
*	http://stackoverflow.com/a/4825695/4808079
* 	Modded
***/

U.setCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

U.getCookie = function(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

U.deleteCookie = function(varName) {
  	document.cookie = varName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
			// if( this.return instanceof U.Thenable ) {
			// 	// this.isAsync = true;
			// 	this.return.next = this.next;
			// 	this.next = this.return;
			// 	this.recievedThenable = this.return;
			// 	this.return = undefined;
			// 	// this.return.run(this.resolve, this.reject);
			// }

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
	if(typeof fn != "function"){
		PINE.err("non function passes to then");
		fn();
	}

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
	return(document.getElementById(id));
}



El.attr = function(domNode, name, value) {
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









