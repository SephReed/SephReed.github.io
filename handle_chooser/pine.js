











var PINE = {};
PINE.createMutateLogger = false;


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
	}
	if(PINE.alertErr)  {
		alert("PINE error: "+whatevers_the_problem);
	}
}



/**********************************
*	 	NEEDLE STUFF
**********************************/
PINE.needles = {};


PINE.get = function(key) {
	if(key === undefined) return null;
	return PINE.needles[key.toUpperCase()];
}


PINE.createNeedle = function(key)  {
	key = key.toUpperCase();
	var needles = PINE.needles;
	if(needles[key] == null)  {
		needles[key] = {};
		needles[key].keyName = key;
		needles[key].functions = {};
	}
	else {
		PINE.err("needle "+key+" already exists.  Using PINE.addFunctionForNeedle(key, init_function) instead");
	}

	//TODO: add typeof check
	// if(init_function != null) needles[key].inits.push(init_function);
	return needles[key];
};

PINE.createNeedle("PINE");


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

		pineFunc.fn = funcWithObserve;

		step_fns.all[key].push(pineFunc);
		step_fns.new[key].push(pineFunc);
		needle.functions[step_type].push(pineFunc);

		
	}
}


PINE.keyApplies = function(keyName, domNode)  {
	if(keyName && domNode)  {
		keyName = keyName.toUpperCase();
		if(keyName.charAt(0) == '[')  {
			var att = keyName.replace(/\[|\]/g, '');
			return domNode.attributes[att] != null;
		}
		else return domNode.tagName == keyName;
	}
	return false;
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
	PINE.run();
});





PINE.applyStepMapsTo = function(domNode, step_maps) {

	for(var step = 0; step < step_maps.length; step++)  {

		for(keyName in step_maps[step]) {
			var applyUs = step_maps[step][keyName];
			delete step_maps[step][keyName];


			var downwards = [];
			var upwards = [];
			for(i_f in applyUs)  {
				var func = applyUs[i_f];
				// console.log(func);
				if(applyUs[i_f].topToBottom) 
					downwards.push(applyUs[i_f]);
				else
					upwards.push(applyUs[i_f]);
			}

			if(downwards.length)
				PINE.fillTree(domNode, downwards);

			if(upwards.length)
				PINE.fillTree(domNode, upwards);


			// console.log(keyName)
			step = -1;
			break;
		}
		// console.log(step)
	}
}


PINE.permeateChildren = function(rootNode)  {
	var fakeGroup = {};
	fakeGroup.childNodes = rootNode.childNodes;
	fakeGroup.attributes = {};
	fakeGroup.tagName = {};

	PINE.permeate(fakeGroup);
}


PINE.permeate = function(rootNode)  {
	var step_maps = [];
	for(index in PINE.OrderOfOperations)  {
		var step_type = PINE.OrderOfOperations[index];
		step_maps.push(PINE.functions[step_type].all);
	}

	step_maps = U.clone(step_maps);

	PINE.applyStepMapsTo(rootNode, step_maps);
}





PINE.isRunning = false;

PINE.run = function()  {

	console.log("run");

	if(PINE.isRunning == true) return;
	PINE.isRunning = true;

	var Pine_Forest = {};
	Pine_Forest.attributes = {};
	Pine_Forest.tagName = {};
	// Pine_Forest.childNodes = $("pine, pineforest");

	Pine_Forest.childNodes = document.getElementsByTagName("pine");  //, pineforest


	var step_maps = [];
	for(index in PINE.OrderOfOperations)  {
		var step_type = PINE.OrderOfOperations[index];
		step_maps.push(PINE.functions[step_type].new);
	}

	PINE.applyStepMapsTo(Pine_Forest, step_maps);

	PINE.isRunning = false;
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




// PINE.fillTree = function(root, step, keyName, applyUs)  {
// 	if(root._pine_ == null) { root._pine_ = {}; }


// 	// if(applyUs.topToBottom)  {
// 		if(tryFuncKey(keyName, step, root, applyUs) == false)  {
// 			setTimeout(function() { 
// 					if(PINE.fillTree(root, step, keyName, applyUs)) 
// 						PINE.run();
// 				}, 
// 				10
// 			);
// 			return false;
// 		}

// 		applyFuncToChildren(root, step, keyName, applyUs);


// 	// }




// 	return true;
// }	


	

	// if(PINE.keyApplies(keyName, root)){
	// 	//check all steps before current step for holds on domNode
	// 	for(var i = 0; i < PINE.OrderOfOperations.length; i++){
	// 		var check_step = PINE.OrderOfOperations[i];

	// 		// console.log("checking step "+check_step+" to "+step+" in "+root.tagName);
	// 		if(step == check_step) break;
	// 		// else if(root._pine_.holds 
	// 		// 	&& 	root._pine_.holds[check_step]
	// 		// 	&& 	root._pine_.holds[check_step].length) 
	// 		// {
	// 		else if(U.get(root, "_pine_.holds["+check_step+"].length")) 
	// 		{
	// 			console.log("should wait");
	// 			setTimeout(function() { 
	// 					if(PINE.fillTree(root, step, keyName, applyUs)) 
	// 						PINE.run();
	// 				}, 
	// 				10
	// 			);
	// 			return false;
	// 		}			
	// 	}

	// 	applyFuncArray(root, PINE.get(keyName), applyUs);
	// }

	// console.log("checking children");

	// var branches = root.childNodes;

	// for(var i = 0; i < branches.length; i++)  {
	// 	var branch = branches[i];
	// 	var nodeName = branch.nodeName;

	// 	if(nodeName!="#text" && nodeName!="#comment")  {
	// 		PINE.fillTree(branch, step, keyName, applyUs);
	// 	}
	// }

	// return true;
// }






// "style = font: {{hey}}; text: hey :+: thing = what"





// PINE.init = function(initMe) {
// 	var doesDefine = $(initMe).attr("define");

// 	if(doesDefine != null)  {
// 		PINE.err("Trying to initialize a 'define' element ");
// 		console.log(initMe);
// 	}

// 	else {
// 		var catchId = $(initMe).attr("catchId") == "false" ? false : true;

// 		// var m_tagName = $(initMe)[0].tagName.toLowerCase();
// 		var m_tagName = initMe.tagName.toLowerCase();
// 		var my_data = initMe;
// 		var needle = PINE.get(m_tagName);

		

// 		$(initMe).find("[spawner]").each(function() {
// 			var my_spawn = assertSingleton($(this).children("[spawn]"));
// 			my_spawn.remove();

// 			var spawnArray = $(this).attr("spawner");

// 			var list = needle[spawnArray];

// 			if(list == null)  {
// 				PINE.err("no array called "+spawnArray+" exists under "+needle);
// 				return;
// 			}

// 			for (var i = 0; i < list.length; i++) {
// 				var appendMe = my_spawn[0].outerHTML.replace(/{{here}}/g, list[i]);
// 				$(this).append(appendMe);
// 			};
// 		});




// 		//Used by both [setsVal] and [watch] to make sure only one inits a var
// 		function ASSERT_VAR_INIT(checkMe) {
// 			if(my_data[checkMe] == null) {
// 				my_data[checkMe] = {};
// 				my_data[checkMe].value = null;
// 				my_data[checkMe].onChange = [];
// 				return false;
// 			}
// 			else return true;
// 		}


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



// 		//TODO: if no parent has watch!!!!
// 		//TODO: make watch not repeat old html, just insert new;
// 		$(initMe).find("[watch]").each(function() {
// 			var $m_watch = $(this);
// 			var m_html = $m_watch[0].innerHTML;

// 			var watched_vars = m_html.match( /{{@#?\w+}}/g );

// 			var seeChange = function(target) {
// 				var new_html = m_html;

// 				for(var i = 0; i < watched_vars.length; i++)  {
// 					var target = watched_vars[i].replace(/[{@}]/g, "");
// 					var i_val;

// 					if(target.charAt(0) == '#') {
// 						var element = catchId ? $(my_data).find(target)[0] : $(target)[0];
// 						if(element) i_val = $(element).val(); 
// 					}
// 					else {
// 						i_val = my_data[target].value;	
// 					}
					 
// 					if(i_val == null) {
// 						console.log("Pine ERR: watched data {{@"+target+"}} does not exist");
// 					}

// 					new_html = new_html.replace(watched_vars[i], i_val);
// 				}
// 				$m_watch[0].innerHTML = new_html;
// 			};



// 			watched_vars.forEach(function(watchForMe) {
// 				var target = watchForMe.replace(/[{@}]/g, "");
				
// 				if(target.charAt(0) == '#') {
// 					var element = catchId ? $(my_data).find(target)[0] : $(target)[0];
// 					$(element).change(seeChange); 
// 				}
// 				else {
// 					ASSERT_VAR_INIT(target);
// 					my_data[target].onChange.push(seeChange);
// 				}
// 			});

// 			seeChange(null);
// 		});
// 	}
// };









// Zepto(function($){


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


// });












function exitHtml(exitMe)  {
	exitMe = exitMe.replace("<!--", '');
	exitMe = exitMe.replace(/&/g, '&amp;');
	exitMe = exitMe.replace(/</g, '&lt;');
	exitMe = exitMe.replace(/>/g, '&gt;');
	
	var tabs = exitMe.match(/\t+/g);

	if(tabs){
		var likelyTabAmount = tabs[tabs.length - 1].length + 1;
		var minAmount = -1;
		for(var i = 0; i < tabs.length; i++) {
			var numTabs = tabs[i].length;
			if(numTabs < minAmount || i == 0) {
				minAmount = numTabs;
			}			
		}

		var willRemove = Math.max(likelyTabAmount, minAmount);
		var regex = new RegExp("\n\t{"+willRemove+"}", "g");

		exitMe = exitMe.replace(regex, '\n');
	}

	exitMe = exitMe.replace(/\n/g, '<br>');

	return exitMe;
}

























