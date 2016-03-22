/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*	     Live a little: blur the line
*
*		                    /\
*          by: Seph Reed   X  X
*		           		    \/
*
********************************************/











var PINE = {};
PINE.class = {};
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
	PINE.ops.SEMISTATIC, 
	PINE.ops.POPULATER, 
	PINE.ops.DEFINER,
	PINE.ops.FINALIZER
];


//resources, inits, static, common, captures, antistatic, polish







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

	for(i in PINE.OrderOfOperations)  {
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
		U.log("Needle of type: "+key+" disabled", "info")
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



PINE.createNeedle("PINE");




/**********************************
*	 	PINEFUNC STUFF
**********************************/

PINE.pinefuncs = {};
PINE.pinefuncs.all = {};  //bookeeping
PINE.pinefuncs.queued = {};  //for super root, only remove oneOffs
PINE.pinefuncs.completed = {};  //for late commers


for(i in PINE.ops.order)  {
		//
	var opType = PINE.ops.order[i];

	PINE.pinefuncs.all[ opType ] = [];
	PINE.pinefuncs.queued[ opType ] = [];
	PINE.pinefuncs.completed[ opType ] = [];
}




PINE.class.PineFunc = function(needle, opType, userFn, autoComplete, oneOff)  {
	this.keyword = needle.keyword;
	this.needle = needle;
	this.opType = opType;

	
	this.fn = function(domNode, callbackPermeate)  {
		var helpers = {};
		var pinefunc = this;

		this.needle.uses += 1;

		helpers.complete = function() { 
			// console.log("complete");
			// console.log(domNode);
			// console.log(pinefunc.keyword);

			domNode._pine_.needles[pinefunc.keyword].completed = true;
			callbackPermeate(pinefunc);
		}


		var completed = U.getnit(domNode, "_pine_.needles['"+this.keyword+"'].completed", false);
		LOG(this.keyword+" completed = "+completed, "pinefunc");

		if(!completed || !oneOff) {

			LOG("running needle "+this.keyword+" at", "needle");
			LOG(domNode, "needle");
			userFn.call(helpers, domNode, this.needle, helpers);

			if(autoComplete) {
				LOG("calling autoComplete for "+this.keyword, "pinefunc");
				helpers.complete();
			}
		}
	}
}




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
			pinefuncs.completed[opType] = pinefuncs.completed[opType] | [];
		}

		pinefuncs.all[opType].push(addMe);
		pinefuncs.queued[opType].push(addMe);

		if(needle.pinefuncs[opType] == null)
			needle.pinefuncs[opType] = [];

		needle.pinefuncs[opType].push(addMe);

		
	}
}





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

		for(pr in me.pre_fns)
			me.pre_fns[pr].apply(me.domNode, args);

		func.apply(me.domNode, args);

		for(po in me.post_fns)
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
		PINE.err("fuction "+funcName+" already registered at domNode ")
		PINE.err(domNode)
		PINE.err("this is an error with completed round in PINE.updateAt ")
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

	console.log(event)
	// alert("content loaded")

  	
  	if(PINE.debugOn === true)
  		PINE.initDebug();


	PINE.run(function() {
		var listeners = PINE.eventListeners[PINE.events.load];

		if(listeners) {
			for(i in listeners)
				listeners[i]();
		}

		if(PINE.debugOn === true)
  			setTimeout(PINE.logDebugAnalysis, 2000);

  		PINE.loaded = true;
  		U.log("PINE Run complete", "success");
	});

	
});





//TODO: make sure hold and steps are separated



//the major function for PINE.  it creates the super root (PINE.forest), initiates it, and runs
//sprout on it using the queued pine funcs array (which all new pine funcs are added to)
PINE.run = function(callback) {
	LOG("running", "needle");

	if(PINE.forest == null) {
		PINE.forest = {};
		PINE.forest.attributes = {};
		PINE.forest.tagName = "_PINE_FOREST";
	}

	var Pine_Forest = PINE.forest;
	Pine_Forest.childNodes = PINE.getFirstsOf(document, "PINE");

	PINE.initiate(Pine_Forest);
	PINE.sprout(Pine_Forest, PINE.pinefuncs.queued, PINE.pinefuncs.completed, true, function() {
		callback();
	});
}











//initiate traverses the entire dom tree from root adding a variable for pine (_pine_)
PINE.initiate = function(root) {
	LOG("initiate", "run");
	LOG(root, "run");


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
}












//Sprout it a major function.  it applies all fuctions in queued ops to root
//and it's children, moving them to completedOps when they are complete, and then
//callsback when all queued functions have been applied.  If a function is added
//mid process to queued ops, it will be sent as well
PINE.sprout = function(root, queuedOps, completedOps, newRoot, callback)  {
		//
	LOG("sprouting at; with; ", "needle");
	LOG(root, "needle");
	LOG(queuedOps, "needle");

	//active ops is where all the ops which have been noticed by sprout are held
	var incompleteOps = {};
	var unsentOps = {};
	completedOps = completedOps || {};
		
	//initializing
	for(key in queuedOps) {
		incompleteOps[key] = [];
		unsentOps[key] = [];
		completedOps[key] = completedOps[key] || [];
	}

	//this is the callback that happens after each successful permeate
	//the fuction is what is called back when all permeates have occured
	//because some permeates might be asynchronous, sprout is called again to ensure
	//nothing was added in while waiting
	var permeateCallback = PINE.createPermeateCallBack(queuedOps, incompleteOps, completedOps, function() {
		PINE.sprout(root, queuedOps, completedOps, newRoot, callback);
	});
	

	//permeateCalled is a boolean which checks whether on not this occurence of sprout was needed
	var permeateCalled = false;

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
					PINE.permeate2(root, opFuncs, permeateCallback, newRoot);
				// }

				// else {
				// 	for(var c = 0; c < root.childNodes.length; c++) {

				// 	}
				// }

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
		LOG("sprout uneeded", "needle");
		if(callback !== undefined)
			callback();
	}
}











//no opType
PINE.createPermeateCallBack = function(queuedOps, incompleteOps, completedOps, sproutCallback)  {
	var queuedOps = queuedOps;
	var incompleteOps = incompleteOps;
	var completedOps = completedOps;
	// var opType = opType;
	var checklist = [];
	// for(opType in incompleteOps)
		// checklist.push(opType);
	

	return function(domNode, callbackOpFuncs) {
			//
		LOG("ops left", "sprout");
		LOG(incompleteOps);
		LOG("callback completed ops", "sprout");
		LOG(callbackOpFuncs);
		

		var opType = callbackOpFuncs[0].opType;
		// var t_opType = checklist.indexOf(opType);
		if(incompleteOps[opType] == null)
			PINE.err("opType :"+opType+" does not exist in "+incompleteOps);

		else {
			for(var i = 0; i < callbackOpFuncs.length; i++)  {
				LOG("removing", "sprout");
				LOG(callbackOpFuncs[i], "sprout");

				var target = incompleteOps[opType].indexOf(callbackOpFuncs[i]);
				if(target == -1)
					PINE.err(callbackOpFuncs[i]+" (callbackOpFuncs[i] does not exist in "+incompleteOps[opType]);
				else  {
						//remove the op from the queue
						//returns an array of length 1
						//then pushes the first element into the completedOps section
					var justCompleted = incompleteOps[opType].splice(target, 1);
					completedOps[opType].push(justCompleted[0]);
				}
			}
		}
		

		//if there are still any operations left in incompleteOps, this is not yet the end
		//return
		// for(key in queuedOps) {
		// 	if(queuedOps[key].length) return false;
		// }

		for(key in incompleteOps) {
			if(incompleteOps[key].length) return false;
		}

		// LOG("all ops complete", "sprout");
		// LOG(queuedOps);

		//when all opTypes have come back completed, call sprouts (sprout being the
		//only thing that calls this function) callback
		sproutCallback();
	};
}



PINE.permeate2 = function(root, opFuncs, callbackParent, newRoot)  {

	LOG("permeate", "run");
	LOG(root, "run");
	LOG("opFuncs", "run");
	LOG(opFuncs, "run");


	for(var i in PINE.stopTags) {
		if(root.tagName == PINE.stopTags[i]) {
			LOG("depine, text, or comment found", "run");
			callbackParent(root, opFuncs);
			return;
		}
	}

	for(var i in PINE.stopNodes) {
		if(root.nodeName == PINE.stopNodes[i]) {
			LOG("depine, text, or comment found", "run");
			callbackParent(root, opFuncs);
			return;
		}
	}

	

	var runNextInQueue = function() {
		var nextOpFuncs = root._pine_.ops.queue.pop();

		if(nextOpFuncs)
			nextOpFuncs();
	}



	//node has a
	//current step
	//hold
	//queue


	
	if(root._pine_ !== undefined) {
		//TODO: fix queing issues.
		//holds should only work if placed by an operation that is supposed to happen
		//before this operation
		if(root._pine_.ops.hold){
			LOG("queueing for hold on", "run");
			LOG(root, "run");
			root._pine_.ops.queue.push(function () {
				LOG("queued function called", "run");
				PINE.permeate2(root, opFuncs, callbackParent, newRoot);
			});
		}
		else {
			


			
			root._pine_.ops.hold = true;
			LOG("hold", "run");
			LOG(root, "run");

			//TODO: callback parent first if nothing in queue should happen first
			var onComplete = function(root, callbackParent) {
				var root = root;
				var callbackParent = callbackParent;
				return function(domNode, opFuncs) {
					root._pine_.ops.hold = false;
					LOG("unhold", "run");
					LOG(root, "run");
					callbackParent(domNode, opFuncs);

					runNextInQueue();
				}
			}(root, callbackParent);


			if (newRoot === false) {
				PINE.permeate2Children(root, opFuncs, onComplete);
				// console.log("non new root, skipping");
			}
			else {

				var localOpFuncs = [];

				
				for(i in opFuncs)  {
					if(PINE.keyApplies(opFuncs[i].keyword, root)) {
						localOpFuncs.push(opFuncs[i]);
					}
				}

				if(localOpFuncs.length)  {

					var pineFuncCallback = PINE.createPineFuncCallback(root, opFuncs, localOpFuncs.slice(0), onComplete);

					for(i in localOpFuncs) {
						var opFunc = localOpFuncs[i];
						// console.log("calling op Func at");
						// console.log(opFunc);
						// console.log(i);
						// console.log(localOpFuncs);
						// console.log(root);

						opFunc.fn(root, pineFuncCallback);
					}
				}
				else PINE.permeate2Children(root, opFuncs, onComplete);

				//key applies
				//if no hold, apply func
				//else wait, try again (keyapplies)

				//don't move onto children if keyApplies and u
			}
			
			
			

			



		
			

			

			
		}
	}

	//if this node has not been initiated
	else if(root._pine_ === undefined){
		// PINE.initiate(root);

		// //TODO: Fix this so that it is the completed functions of this round.
		// var cloneMe = PINE.pinefuncs.completed;
		// var updates = {};
		// for(opType in cloneMe) 
		// 	updates[opType] = cloneMe[opType].slice(0);

		// LOG("updates for found node", "async");
		// LOG(updates, "async");
		

		// PINE.sprout(root, updates, null, function() {
		// 	// root._pine_.ops.hold = false;
		// 	PINE.permeate2(root, opFuncs, callbackParent);
		// });

		PINE.updateAt(root, function() {
			PINE.permeate2(root, opFuncs, callbackParent);
		});
	}	
}



//TODO: fix completed rounds error
PINE.updateAt = function(root, callback) {

	LOG("update at", "async");
	LOG(root, "async");

	var newRoot = (root._pine_ === undefined);
	if(newRoot){
		PINE.initiate(root);
		LOG("new Root Found", "async");
		// console.log("new Root", root);
	}

	//TODO: Fix this so that it is the completed functions of this round.
	var cloneMe = PINE.pinefuncs.completed;
	var updates = {};
	for(opType in cloneMe) 
		updates[opType] = cloneMe[opType].slice(0);

	LOG("updates for found node", "async");
	LOG(updates, "async");
	

	PINE.sprout(root, updates, null, newRoot, callback);
}






//This function returns a function that is a callback for pinefuncs when they complete
//when all pinefuncs have been completed, it moves on to the next stage
PINE.createPineFuncCallback = function(root, opFuncs, localOpFuncs, callbackParent) {
	var localOpFuncs = localOpFuncs;
	var root = root;
	var opFuncs = opFuncs;
	var callbackParent = callbackParent;

	return function(removeMe)  {
		// console.log("removing, from, at ");
		// console.log(removeMe);
		// console.log(localOpFuncs);
		// console.log(root);

		var index = localOpFuncs.indexOf(removeMe);
		if(index == -1) {
			PINE.err(removeMe.needle.keyword+" does not exist in localOpFuncs: "+localOpFuncs);
			// console.log(removeMe);
			// console.log(localOpFuncs);
		}
		else 
			localOpFuncs.splice(index, 1);

		if(localOpFuncs.length == 0)  {
			PINE.permeate2Children(root, opFuncs, callbackParent);
		}
	}
}

PINE.permeate2Children = function(root, opFuncs, callbackParent) {
	var root = root;
	var opFuncs = opFuncs;
	var callbackParent = callbackParent;
	var branches = root.childNodes;

	LOG("permeating children", "run");
	LOG(branches, "run");
	// LOG(childNodes, "run");

	if(branches && branches.length) {

		var childListCopy = [];
			//
		for(var i = 0; i < branches.length; i++)  
			childListCopy.push(branches[i]);


		var childCallback = PINE.createChildCallback(root, opFuncs, childListCopy, callbackParent);
			//
		for(var i = 0; i < childListCopy.length; i++)  
			PINE.permeate2(childListCopy[i], opFuncs, childCallback);
			
	}
	else callbackParent(root, opFuncs);
}


PINE.createChildCallback = function(root, opFuncs, copyMeChildNodes, callbackParent) {
	var root = root;
	var childNodes = [];
	// var childListCopy = [];
			//
	for(var i = 0; i < copyMeChildNodes.length; i++)  
		childNodes.push(copyMeChildNodes[i]);
	var opFuncs = opFuncs;
	var callbackParent = callbackParent;

	return function(removeMe)  {
		LOG("child finished, removing from", "run");
		LOG(removeMe, "run");
		LOG(childNodes, "run");

		var index = childNodes.indexOf(removeMe);
		if(index == -1)
			PINE.err(removeMe+" does not exist in "+childNodes);
		else 
			childNodes.splice(index, 1);

		if(childNodes.length == 0)
			callbackParent(root, opFuncs);

		LOG("child nodes left", "run");
		LOG(childNodes, "run");
	}
}













/**********************************
*	 	DEBUGGING
**********************************/
PINE.logErr = true;
PINE.alertErr = false;
PINE.debugOn = true;
PINE.showUnusedNeedles = true;

PINE.err = function(whatevers_the_problem) { //?
	if(PINE.logErr)  {
		var callerLine = new Error().stack.split('\n');
		var line = callerLine[1].match(/([^\/])+?$/g)[0];
		line += "....";
		line += callerLine[2].match(/([^\/])+?$/g)[0];
		U.log(line, "light");
		U.log("PINE error: "+whatevers_the_problem, "error")
		// console.log(new Error());
	}
	if(PINE.alertErr)  {
		alert("PINE error: "+whatevers_the_problem);
	}
}



LOG = function() { return; }


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


 	LOG = function(logMe, logType)  {
		logType = logType || "all";

		// console.log(logType);
		if (LOG.showLog[logType] !== false){

			var callerLine = new Error().stack.split('\n');

			var line = logType+"::"
			line += callerLine[1].match(/([^\/])+?$/g)[0];
			line += "....";
			line += callerLine[2].match(/([^\/])+?$/g)[0];
			U.log(line, "light");

			console.log(logMe);
		}
	}

	LOG.showLog = [];

	LOG.showLog["all"] = false;  //
	LOG.showLog["needle"] = false; //
	LOG.showLog["pnv"] = false;
	LOG.showLog["run"] = false;
	LOG.showLog["sprout"] = false;  //
	LOG.showLog["pinefunc"] = false;  //		
	LOG.showLog["async"] = false;
	LOG.showLog["FNS"] = false;

}


PINE.logDebugAnalysis = function() {

	var output = "to stop seeing all debuging messages, set PINE.debugOn = false"; 
	U.log(output, "info");

	if(PINE.showUnusedNeedles) {
			//
		var unusedNeedles = "";
		for(key in PINE.needles)  {
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

			U.log(output, "info");
		}
		else {
			
			U.log("All needles used at least once.  Good job!", "success");	
		}
	}
	
}





















/**********************************
*	 	PINE UTILITIES
*	shall some day be replaced by 
*  native functions I hope
**********************************/



var U = PINE.UTILITIES = {};

U.get = function(start, keyString, bracketsCase)  {
	return U.getnit(start, keyString, undefined, bracketsCase);
}



U.assertVar = function(start, keyString, keyNotArray)  {
	var keyArray = keyString.match(/[\w\d]+/g)
	var pos = start;

	var noNeed = true;

	if(start) {
		for(i in keyArray)  {
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
		for(i in keyArray)  {
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


U.clone = function(obj) {
    if (null == obj)  return obj;

    // console.log(typeof obj + "::");
    // console.log(obj);

    if("object" == typeof obj)  {
    	var copy;
    	try { copy = obj.constructor(); }
    	catch(e) {
    		PINE.err("Trynig to copy an object which references itself", e);

    		return;
    	}

    	// console.log("should not be last");

	    for (var attr in obj) {
	        if (obj.hasOwnProperty(attr)) {
	        	copy[attr] = U.clone(obj[attr]);
	        }
    	}
    }
    else if("array" == typeof obj)  {
    	// console.log("IN ARRAY");
    	PINE.err("U.clone array case unfinished");
    }
    else return obj;
    
    return copy;
}


U.initArray = function(val, size)  {
	var out = [];
	for(var i = 0; i < size; i++) {
		out[i] = val;
	}
	return out;
}



PINE.deepCloneNode = function(cloneMe)  {
	// console.log("cloning:");
	// console.log(cloneMe);

	var out = cloneMe.cloneNode(true);
	out._pine_ = U.clone(cloneMe._pine_);

	return out;
}




U.ajax = function(url, callback){
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
        else {
        	console.log("error in U.ajax");
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


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



/****
*	Console colors shared by SeriousJoker
*	http://stackoverflow.com/a/25042340/4808079
*/

U.log = function(msg, color) {
    color = color || "black";
    bgc = "White";
    switch (color) {
        case "success":  color = "Yellow";      bgc = "Green";       break;
        case "info":     color = "Black"; 	   bgc = "Orange";       break;
        case "error":    color = "Red";        bgc = "Black";           break;
        // case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
        // case "warning":  color = "Tomato";     bgc = "Black";           break;
        // case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
        case "light":    color = "LightGrey";       bgc = "White";			break;
        default: color = color;
    }

    if (typeof msg == "object") {
        console.log(msg);
    } else if (typeof color == "object") {
        console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
        console.log(color);
    } else {
        console.log("%c" + msg, "color:" + color + "; background-color: " + bgc + ";");
    }
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
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
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






