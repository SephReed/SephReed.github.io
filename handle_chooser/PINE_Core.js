









var PINE = {};
PINE.class = {};
// PINE.createMutateLogger = false;


PINE.evals = [];



/**********************************
*	 	PINE UTILITIES
*	shall some day be replaced by 
*  native functions I hope
**********************************/



var U = PINE.UTILITIES = {};

U.get = function(start, keyString)  {
	
	// var keyArray = keyString.match(/([\w\d]+|\[.+\])/g);
	var keyArray = keyString.match(/[\w\d]+/g);
	var pos = start;

	for(i in keyArray)  {
		if(pos === null || pos === undefined) 
			return undefined;
		
		var key = keyArray[i];
		// if(key.charAt(0) == '[') {
		// 	key = U.get(pos, key);
		// }
		// else pos = pos[key];

		// var num = parseInt(key);
		// if(num != NaN)  key = num;

		pos = pos[key];
		
	}
	return pos;
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

U.getnit = function(start, keyString, init)  {
	
	var pos = start;

	if(start) {
			//
		var keyArray = keyString.match(/([\w\d]+)|('.+')|(".+")/g)
		for(i in keyArray)  {
			var key = keyArray[i];
			key = key.replace(/['"]/g, '');

			if(pos[key] == null) {
				//last one
				if(i == keyArray.length - 1)
					pos[key] = init;

				else
					pos[key] = {};

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
    		PINE.err("Trynig to copy an object which references itself");
    		PINE.err(e);

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
	console.log("cloning:");
	console.log(cloneMe);

	var out = cloneMe.cloneNode(true);
	out._pine_ = U.clone(cloneMe._pine_);

	return out;
}


/**********************************
*	 	ORDER OF OPERATIONS 
**********************************/

PINE.ops = {};
PINE.ops.PREPROCESS = "preprocess";
PINE.ops.STATIC = "static";
PINE.ops.DEFINER = "definer";
PINE.ops.POPULATER = "populater";
PINE.ops.order = [PINE.ops.PREPROCESS, PINE.ops.STATIC, PINE.ops.POPULATER, PINE.ops.DEFINER];



PINE.PREPROCESS = "preprocess";
PINE.STATIC = "static";
PINE.DEFINER = "definer";
PINE.POPULATER = "populater";

// PINE.OrderOfOperations = [PINE.PREPROCESS, PINE.STATIC, PINE.DEFINER, PINE.POPULATER];
PINE.OrderOfOperations = [PINE.PREPROCESS, PINE.STATIC, PINE.POPULATER, PINE.DEFINER];

PINE.functions = {};

for(index in PINE.OrderOfOperations)  {
	var key = PINE.OrderOfOperations[index];
	PINE.functions[key] = {};
	PINE.functions[key].all = {};
	PINE.functions[key].new = {};
}




/**********************************
*	 	ERROR HANDLING
**********************************/
PINE.logErr = true;
PINE.alertErr = false;

PINE.err = function(whatevers_the_problem) { //?
	if(PINE.logErr)  {
		console.log("PINE error: "+whatevers_the_problem);
		console.log(new Error().stack);
	}
	if(PINE.alertErr)  {
		alert("PINE error: "+whatevers_the_problem);
	}
}



/**********************************
*	 	NEEDLE STUFF
**********************************/
PINE.needles = {};

PINE.class.Needle = function(keyword) {
	this.keyword = keyword;
	// this.keyword = keyword;
	// this.functions = {};
	this.pinefuncs = {};

	for(i in PINE.OrderOfOperations)  {
			//
		var opType = PINE.OrderOfOperations[i];

		this.pinefuncs[ opType ] = [];
	}

}


PINE.class.Needle.prototype.registerFunction = function(args) {
	args.keyword = this.keyword;
	// PINE.registerFunction(args);
	PINE.registerFunction2(args);
}


PINE.createNeedle = function(key)  {
	key = key.toUpperCase();
	var needles = PINE.needles;
	if(needles[key] == null)  {
		needles[key] = new PINE.class.Needle(key);
		// needles[key] = {};
		// needles[key].keyName = key;
		// needles[key].functions = {};
	}
	else {
		PINE.err("needle "+key+" already exists.  Using PINE.addFunctionForNeedle(key, init_function) instead");
	}

	//TODO: add typeof check
	// if(init_function != null) needles[key].inits.push(init_function);
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
		this.complete = function() { 
			console.log(domNode);
			console.log(this.keyword);

			domNode._pine_.needles[this.keyword].completed = true;
			callbackPermeate(this);
		}

		var completed = U.getnit(domNode, "_pine_.needles.['"+this.keyword+"'].completed", false);

		if(!completed || !oneOff) {
			console.log("calling function");
			console.log(userFn);
			console.log(domNode);

			userFn.call(this, domNode, this.needle);

			if(autoComplete)
				this.complete();
		}
	}
}


PINE.registerFunction = function(args)  {
	var key = args.key.toUpperCase();
	var step_type = args.step_type ? args.step_type : PINE.STATIC;
	var addMe = args.fn;
	var continuous = args.continuous ? args.continuous : false;
	var topToBottom = args.topToBottom === true;
	var layersOnSelf = !(args.layersOnSelf === false);


	//TODO: add oneOff option
	// var oneOff = args.oneOff ? args.oneOff : false;


	var step_fns = PINE.functions[step_type];

	if(step_fns == null)  {
		PINE.err("function group of type: "+step_type+" does not exist");
		return;
	}

	var needle = PINE.get(key);
	if(needle == null)  {
		PINE.err("needle of keyname:"+key+" does not exist.  Use PINE.createNeedle(key, addMe) first");
	}
	else {
		if(step_fns[key] == null)  {
			// step_fns.all[key] = {};
			step_fns.all[key] = [];
			step_fns.new[key] = [];

			if(needle.functions[step_type] == null)
				needle.functions[step_type] = [];

			else 
				PINE.err("function type: '"+step_type+"' registered for needle '"+key+"'' but not in PINE.functions");
		}


		//KLUDGE: make classes
		var pineFunc = {};
		pineFunc.key = key;
		pineFunc.step = step_type;
		pineFunc.topToBottom = topToBottom;


		//TODO:  make this work for things which do not trigger the mutation observers
		//eg: remove skipOne for those cases
		var funcWithObserve = addMe;
		if(continuous)  {
			funcWithObserve = function(initMe, needle)  {
				addMe(initMe, needle);


				var observers = initMe._pine_.observers = {};
				var parentSee = observers.parentSee = {};
				parentSee.skipOne = false;

				var config = { childList: true, subtree: true };

				//observer for the parent only acts on the sibling which looks like this
				parentSee.observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
				  		if(PINE.keyApplies(key, mutation.target)){
				  			if(parentSee.skipOne == false) {
					  			parentSee.skipOne = true;
					  			addMe(initMe, needle);
					  		}
					  		else parentSee.skipOne = false;
				  		}
				  	});    
				});
				observers.parentSee.observer.observe(initMe, config);
			}
		}



		//create a fuction which takes a domNode and a callback
		//make it have a function called complete()

		pineFunc.fn = funcWithObserve;

		step_fns.all[key].push(pineFunc);
		step_fns.new[key].push(pineFunc);
		needle.functions[step_type].push(pineFunc);

		
	}
}


PINE.registerFunction2 = function(args)  {
	var keyword = args.keyword.toUpperCase();
	var opType = args.step_type || PINE.STATIC;
	var userFn = args.fn;
	var autoComplete = args.autoComplete || true;
	var oneOff = args.oneOff || false;


	var needle = PINE.get(keyword);
	var pinefuncs = PINE.pinefuncs;


	if(needle == null)  
		PINE.err("needle of keyword:"+keyword+" does not exist.  Use PINE.createNeedle(keyword) first");
	
	else {

		var addMe = new PINE.class.PineFunc(needle, opType, userFn, autoComplete, oneOff);
		

		pinefuncs.all[opType].push(addMe);
		pinefuncs.queued[opType].push(addMe);

		if(needle.pinefuncs[opType] == null)
			needle.pinefuncs[opType] = [];

		needle.pinefuncs[opType].push(addMe);

		
	}
}




PINE.getFirstsOf = function(root, keyword)  {
	if(PINE.keyApplies(keyword, root)) {
		return root;
	}

	var out = [];

	var branches = root.childNodes;
	for(var i = 0; i < branches.length; i++)  {
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



PINE.holdVar = function(scopeDom, var_name)  {
	console.log('!!holding var '+var_name);

	U.assertKey(scopeDom, "_pine_.pnv.holds");
	scopeDom._pine_.pnv.holds[var_name] = true;
}



PINE.unholdVar = function(scopeDom, var_name)  {
	console.log('!!unholding var '+var_name);

	U.assertKey(scopeDom, "_pine_.pnv.holds");
	scopeDom._pine_.pnv.holds[var_name] = false;
}



PINE.addHold = function(step_type, holdId, domNode)  {

	console.log("adding hold"+holdId)

	if(domNode._pine_.holds == null) {
		domNode._pine_.holds = {};
	}

	var holds = domNode._pine_.holds;
	if(holds[step_type] == null)  {
		holds[step_type] = [];
	}

	holds[step_type].push(holdId);

	if(domNode.tagName != "PINE" && domNode.tagName != "PINEFOREST") {
		var parent = domNode.parentNode;
		if(parent != null) {
			PINE.addHold(step_type, holdId, parent);		
		}
	}
}






PINE.removeHold = function(step_type, holdId, domNode)  {

	console.log("removing hold"+holdId)
	// console.log(domNode);

	var holds = domNode._pine_.holds;
	if(holds && holds[step_type]) {
		var index = holds[step_type].indexOf(holdId);
		if (index > -1) {
			holds[step_type].splice(index, 1);
		}	
	}

	if(domNode.tagName != "PINE" && domNode.tagName != "PINEFOREST") {
		var parent = domNode.parentNode;
		if(parent != null) {
			PINE.removeHold(step_type, holdId, parent);		
		}
	}
}






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

}





document.addEventListener("DOMContentLoaded", function(event) { 
  	PINE.initDebug();
	// PINE.run();
	PINE.run2();
});





// PINE.applyStepMapsTo = function(domNode, step_maps) {

// 	for(var step = 0; step < step_maps.length; step++)  {

// 		for(keyName in step_maps[step]) {
// 			var applyUs = step_maps[step][keyName];
// 			delete step_maps[step][keyName];


// 			var downwards = [];
// 			var upwards = [];
// 			for(i_f in applyUs)  {
// 				var func = applyUs[i_f];
// 				// console.log(func);
// 				if(applyUs[i_f].topToBottom) 
// 					downwards.push(applyUs[i_f]);
// 				else
// 					upwards.push(applyUs[i_f]);
// 			}

// 			if(downwards.length)
// 				PINE.fillTree(domNode, downwards);

// 			if(upwards.length)
// 				PINE.fillTree(domNode, upwards);


// 			// console.log(keyName)
// 			step = -1;
// 			break;
// 		}
// 		// console.log(step)
// 	}
// }


// PINE.permeateChildren = function(rootNode)  {
// 	var fakeGroup = {};
// 	fakeGroup.childNodes = rootNode.childNodes;
// 	fakeGroup.attributes = {};
// 	fakeGroup.tagName = {};

// 	PINE.permeate(fakeGroup);
// }


// PINE.permeate = function(rootNode)  {
// 	var step_maps = [];
// 	for(index in PINE.OrderOfOperations)  {
// 		var step_type = PINE.OrderOfOperations[index];
// 		step_maps.push(PINE.functions[step_type].all);
// 	}

// 	step_maps = U.clone(step_maps);

// 	PINE.applyStepMapsTo(rootNode, step_maps);
// }





// PINE.isRunning = false;

// PINE.run = function()  {

// 	// console.log("run");

// 	if(PINE.isRunning == true) return;
// 	PINE.isRunning = true;

// 	var Pine_Forest = {};
// 	Pine_Forest.attributes = {};
// 	Pine_Forest.tagName = {};
// 	// Pine_Forest.childNodes = $("pine, pineforest");

// 	Pine_Forest.childNodes = document.getElementsByTagName("pine");  //, pineforest


// 	var step_maps = [];
// 	for(index in PINE.OrderOfOperations)  {
// 		var step_type = PINE.OrderOfOperations[index];
// 		step_maps.push(PINE.functions[step_type].new);
// 	}

// 	PINE.applyStepMapsTo(Pine_Forest, step_maps);

// 	PINE.isRunning = false;
// }





LOG = function(logMe, logType)  {
	logType = logType || "all";
	if (LOG.showLog[logType] !== false)
		console.log(logMe);
}
LOG.showLog = [];
// LOG.showLog["all"] = false;













PINE.run2 = function() {
	if(PINE.forest == null) {
		PINE.forest = {};
		PINE.forest.attributes = {};
		PINE.forest.tagName = "_PINE_FOREST";
	}

	var Pine_Forest = PINE.forest;
	Pine_Forest.childNodes = PINE.getFirstsOf(document, "PINE");

	PINE.initiate(Pine_Forest);
	PINE.sprout(Pine_Forest, PINE.pinefuncs.queued, PINE.pinefuncs.completed, function() {
		alert("run complete");
	});

	//this one permeates with new funcs
	//others permeate wit old funcs

}

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
	}

	//pvars might be defined before an initiation
	if(root.PVARS === undefined)
		root.PVARS = {};

	//move on to children, regardless of personal init state
	var branches = root.childNodes;
	for(var i = 0; i < branches.length; i++)  
		PINE.initiate(branches[i]);
}


PINE.sprout = function(root, queuedOps, completedOps, callback)  {
		//
	LOG("sprout", "run");
	LOG(root, "run");

	//if sprout is run from Pine.forest
	//whenever something is added to new
	//tell everything to hold whatever is supposed to come after it
	

	//remove everything from queue and place into personal list
	//add it to complete when done

	var myOps = {};
	for(key in queuedOps) {
		myOps[key] = queuedOps[key];
		queuedOps[key] = [];
	}


	var permeateCallback = PINE.createPermeateCallBack(myOps, completedOps, callback);
	completedOps = completedOps || {};

	var permeateCalled = false;
	var furthestStep = 0;
	for(var i = 0; i < PINE.ops.order.length; i++)  {

		for(key in queuedOps) {
			if(queuedOps[key].length) {
				//take anything after furthest step and merge is in
				//create a new myOps out of everything else to be done
				//before
			}
		}

		furthestStep = Math.max(furthestStep, i);
		
		var opType = PINE.ops.order[i];
		completedOps[opType] = completedOps[opType] || [];

		var opFuncs = myOps[opType];
		if(opFuncs && opFuncs.length) {
			if(i < furthestStep) {
				alert("stepping backwards");
			}

			LOG(opType, "run");
			PINE.permeate2(root, opFuncs, permeateCallback)//add callback
			permeateCalled = true;
			i = -1;
		}
	}

	if(permeateCalled == false) 
		callback();

	//send ops, with callback to remove themselves from queue at completion
	
}

//no opType
PINE.createPermeateCallBack = function(myOps, completedOps, sproutCallback)  {
	var myOps = myOps;
	var completedOps = completedOps;
	// var opType = opType;
	var checklist = [];
	for(opType in myOps)
		checklist.push(opType);
	

	return function(domNode, completedOpFuncs) {
			//
		var opType = completedOpFuncs[0].opType;
		var t_opType = checklist.indexOf(opType);
		if(t_opType == -1)
			PINE.err(t_opType+" does not exist in "+checklist);

		else {
			for(i in completedOpFuncs)  {

				var target = myOps[opType].indexOf(completedOpFuncs[i]);
				if(target == -1)
					PINE.err(target+" does not exist in "+myOps[opType]);
				else  {
						//remove the op from the queue
						//returns an array of length 1
						//then pushes the first element into the completedOps section
					var justCompleted = myOps[opType].splice(target, 1);
					completedOps[opType].push(justCompleted[0]);

				}
			}
		}
		
		//when all opTypes have come back completed, call sprouts (sprout being the
		//only thing that calls this function) callback
		if(checklist.length == 0)
			sproutCallback();
	};
}



PINE.permeate2 = function(root, opFuncs, callbackParent)  {

	LOG("permeate", "run");
	LOG(root, "run");
	LOG("opFuncs", "run");
	LOG(opFuncs, "run");


	if(root.nodeName == "#text" || root.nodeName == "#comment"){
		LOG("text or comment found", "run");
		callbackParent(root, opFuncs);
		return;
	}
		

	//node has a
	//current step
	//hold
	//queue


	//if Super Root is on a previous step, tell it to call this back when it's back 
	//to an equal or greater step

	if(root._pine_ === undefined){
		PINE.initiate(root);

		if(opFuncs)  {
			//* uninitiated node was found mid cycle
			//* set hold vertically until it get's up to speed.
			//*initiate it with all "old" funcs
			//*then release hold
			//*and move on normally

			root._pine_.ops.hold = true;

			var cloneMe = PINE.pinefuncs.completed;
			var updates;
			for(opType in cloneMe) 
				updates[opType] = cloneMe[opType].slice(0);
			

			PINE.sprout(root, updates, null, function() {
				root._pine_.ops.hold = false;
				PINE.permeate2(root, opFuncs, callbackParent);
			});



		}



	}

	//TODO: fix queing issues.
	//holds should only work if placed by an operation that is supposed to happen
	//before this operation
	else if(root._pine_.ops.hold){
		LOG("queueing for hold on", "run");
		LOG(root, "run");
		root._pine_.ops.queue.push(function () {
			LOG("queued function called", "run");
			PINE.permeate2(root, opFuncs, callbackParent);
		});
	}
	else {
		



		//add hold for this function, release when complete?
		//when is it complete?
		//when complete is called by all applicable prior opFuncs in children, and
		//all applicable current opFuncs in this domNode

		//if key applies and hold, wait again

		//if all my callbacks have occured, I call back too
		//my first callbacks are for applying needles
		//then I send them onto my children
		//who return a call back when they've done the above

		
		root._pine_.ops.hold = true;
		LOG("hold", "run");
		LOG(root, "run");

		var onComplete = function(root, callbackParent) {
			var root = root;
			var callbackParent = callbackParent;
			return function(domNode, opFuncs) {
				root._pine_.ops.hold = false;
				LOG("unhold", "run");
				LOG(root, "run");
				callbackParent(domNode, opFuncs);

				var nextOpFuncs = root._pine_.ops.queue.pop();

				if(nextOpFuncs)
					nextOpFuncs();
			}
		}(root, callbackParent);


		var localOpFuncs = [];
			//
		// if(opFuncs)  {
			for(i in opFuncs)  {
				if(PINE.keyApplies(opFuncs[i].keyword, root)) {
					localOpFuncs.push(opFuncs[i]);
				}
			}
		// }

		



		if(localOpFuncs.length)  {

			var pineFuncCallback = PINE.createPineFuncCallback(root, opFuncs, localOpFuncs.slice(0), onComplete);

			for(i in localOpFuncs) {
				var opFunc = localOpFuncs[i];
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






//This function returns a function that is a callback for pinefuncs when they complete
//when all pinefuncs have been completed, it moves on to the next stage
PINE.createPineFuncCallback = function(root, opFuncs, localOpFuncs, callbackParent) {
	var localOpFuncs = localOpFuncs;
	var root = root;
	var opFuncs = opFuncs;
	var callbackParent = callbackParent;

	return function(removeMe)  {

		var index = localOpFuncs.indexOf(removeMe);  //TODO:  this needs to be a list of PineFunc ID's
		if(index == -1)
			PINE.err(removeMe+" does not exist in "+localOpFuncs);
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

	if(branches != null && branches.length > 0) {

		var childListCopy = [];
			//
		for(var i = 0; i < branches.length; i++)  
			childListCopy.push(branches[i]);


		var childCallback = PINE.createChildCallback(root, opFuncs, childListCopy, callbackParent);
			//
		for(var i = 0; i < branches.length; i++)  
			PINE.permeate2(branches[i], opFuncs, childCallback);
			
	}
	else callbackParent(root, opFuncs);
}


PINE.createChildCallback = function(root, opFuncs, childNodes, callbackParent) {
	var root = root;
	var childNodes = childNodes;
	var opFuncs = opFuncs;
	var callbackParent = callbackParent;

	return function(removeMe)  {
		var index = childNodes.indexOf(removeMe);
		if(index == -1)
			PINE.err(removeMe+" does not exist in "+childNodes);
		else 
			childNodes.splice(index, 1);

		if(childNodes.length == 0)
			callbackParent(root, opFuncs);
	}
}





















function applyFuncArray(root, needle, func_array)  {
	for(index in func_array)  {
		func_array[index].fn(root, needle);
	}
}


//KLUDGE: using step when it's in func_array
function tryFuncKey(keyName, step, root, func_array)  {
	if(PINE.keyApplies(keyName, root)){
		//check all steps before current step for holds on domNode
		for(var i = 0; i < PINE.OrderOfOperations.length; i++){
			var check_step = PINE.OrderOfOperations[i];

			// console.log("checking step "+check_step+" to "+step+" in "+root.tagName);
			if(step == check_step) break;
			else if(U.get(root, "_pine_.holds["+check_step+"].length")) 
			{
				console.log("should wait");
				
				return false;
			}			
		}

		applyFuncArray(root, PINE.get(keyName), func_array);
	}
	return true;
}



function applyFuncToChildren(root, step, keyName, applyUs)  {
	var branches = root.childNodes;

	for(var i = 0; i < branches.length; i++)  {
		var branch = branches[i];
		var nodeName = branch.nodeName;

		if(nodeName!="#text" && nodeName!="#comment")  {
			// PINE.fillTree(branch, step, keyName, applyUs);
			PINE.fillTree(branch, applyUs);
		}
	}

}


PINE.fillTree = function(root, pinefuncs, isRetry)  {
	// console.log(pinefuncs);

	if(root.tagName == "DEPINE") 
		return;


	if(root._pine_ == null) { root._pine_ = {}; }
	var topToBottom = pinefuncs[0].topToBottom;
	var key = pinefuncs[0].key;
	var step = pinefuncs[0].step;


	//KLUDGE: don't use isRetry
	// if(topToBottom == false) {
	// 	if(isRetry != true)
	// 		applyFuncToChildren(root, step, key, pinefuncs);

	// 	if(tryFuncKey(key, step, root, pinefuncs) == false)  {
	// 		setTimeout(function() { 
	// 				if(PINE.fillTree(root, pinefuncs, true)) 
	// 					PINE.run();
	// 			}, 
	// 			10
	// 		);
	// 		return false;
	// 	}
	// }
	// else {
		// applyFuncToChildren(root, step, key, pinefuncs);
		if(tryFuncKey(key, step, root, pinefuncs) == false)  {
			setTimeout(function() { 
					if(PINE.fillTree(root, pinefuncs)) 
						PINE.run();
				}, 
				10
			);
			return false;
		}
		applyFuncToChildren(root, step, key, pinefuncs);
	// }
	
	

	// if(topToBottom == true) 
		

	


	// }




	return true;
}





// 		$(initMe).find("[setsVal]").each(function() {
// 			var target = $(this).attr("setsVal");
// 			ASSERT_VAR_INIT(target);

// 			$(this).change(function() {
// 				var i_val = $(this).val();

// 				my_data[target].value = i_val;

// 				var update_us = my_data[target].onChange;
// 				for(var i = 0; i < update_us.length; i++)  {
// 					update_us[i](target);
// 				}
// 			});

// 			$(this).change();
// 		});













// 	//THIS SOLVES THE PROBLEM BADLY
// 	//TODO: call init functions without observing all changes.
// 	//know when a static page will call for inits to work
// 	if(PINE.avoidReferenceIssues) {
// 		// select the target node
// 		var target = document.querySelector('body');
		 
// 		// create an observer instance
// 		var observer = new MutationObserver(function(mutations) {
// 		  	mutations.forEach(function(mutation) {
// 		  		var newBits = mutation.addedNodes;
// 		  		// console.log(newBits);
// 		  		for(var i = 0; i < newBits.length; i++) {

// 		  			var justAdded = newBits[i];
// 		  			var needle = PINE.get(justAdded.tagName);

// 		    		if(needle != null) {
// 		    			PINE.init(justAdded);
// 		    			needle.init(justAdded);
// 		    		}
// 		    	}
// 		  	});    
// 		});
		 
// 		// configuration of the observer:
// 		var config = { childList: true, subtree: true };
		 
// 		// pass in the target node, as well as the observer options
// 		observer.observe(target, config);
// 	}
































