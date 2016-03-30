

var PINE = {};
PINE.needles = {};

PINE.STATIC = "static";
PINE.DEFINER = "definer";
PINE.POPULATER = "populater";

PINE.OrderOfOperations = [PINE.STATIC, PINE.DEFINER, PINE.POPULATER];

PINE.PREPROCESS = "preprocess";
PINE.OrderOfOperations.unshift(PINE.PREPROCESS);

PINE.functions = {};

for(index in PINE.OrderOfOperations)  {
	var key = PINE.OrderOfOperations[index];
	PINE.functions[key] = {};
	PINE.functions[key].all = {};
	PINE.functions[key].new = {};
}




PINE.logErr = true;
PINE.alertErr = true;

PINE.createMutateLogger = false;
PINE.avoidReferenceIssues = true;

PINE.err = function(whatevers_the_problem) { //?
	if(PINE.logErr)  {
		console.log("PINE error: "+whatevers_the_problem);
	}
	if(PINE.alertErr)  {
		alert("PINE error: "+whatevers_the_problem);
	}
}

PINE.logMutations = function(boolean) {
	PINE.createMutateLogger = true;
}


//Depreciated
PINE.get = function(key) {
	if(key === undefined) return null;
	return PINE.needles[key.toUpperCase()];
}


PINE.createNeedle = function(key)  {
	key = key.toUpperCase();
	var needles = PINE.needles;
	if(needles[key] == null)  {
		needles[key] = {};
		needles[key].functions = {};
	}
	else {
		PINE.err("needle "+key+" already exists.  Using PINE.addFunctionForNeedle(key, init_function) instead");
	}

	//TODO: add typeof check
	// if(init_function != null) needles[key].inits.push(init_function);
	return needles[key];
};


PINE.addFunctionForNeedle = function(key, step_type, addMe)  {
	key = key.toUpperCase();

	var step_fns = PINE.functions[step_type];

	if(step_fns == null)  {
		PINE.err("function of type: "+step_type+" does not exist");
		return;
	}

	var needle = PINE.get(key);
	if(needle == null)  {
		PINE.err("needle "+key+" does not exist.  Use PINE.createNeedle(key, addMe) first");
	}
	else {
		if(step_fns[key] == null)  {
			// step_fns.all[key] = {};
			step_fns.all[key] = [];
			step_fns.new[key] = [];

			if(needle.functions[step_type] == null)
				needle.functions[step_type] = [];

			else 
				PINE.err("function type"+step_type+"registered for needle "+key+" but not for PINE");
		}

		step_fns.all[key].push(addMe);
		step_fns.new[key].push(addMe);
		needle.functions[step_type].push(addMe);
	}

	// return needles[key];
};






Zepto(function($){
	PINE.run();
});



PINE.run = function()  {

	var Pine_Forest = {};
	Pine_Forest.attributes = {};
	Pine_Forest.tagName = {};
	Pine_Forest.childNodes = $("pine, pineforest");



	// for(var i_pine = 0; i < )

	var step_maps = [];
	for(index in PINE.OrderOfOperations)  {
		var step_type = PINE.OrderOfOperations[index];
		step_maps.push(PINE.functions[step_type].new);
	}


	for(var step = 0; step < step_maps.length; step++)  {

		for(keyName in step_maps[step]) {
			var applyUs = step_maps[step][keyName];
			delete step_maps[step][keyName];
			
			PINE.fillTree(Pine_Forest, keyName, applyUs);

			step = 0;
			break;
		}
	}
}


function applyFuncArray(root, needle, func_array)  {
	for(index in func_array)  {
		func_array[index](root, needle);
	}
}


PINE.fillTree = function(root, keyName, applyUs)  {
	if(root._pine_ == null) {
		root._pine_ = {};
		// rootNode._pine_.appliedNeedles = {};
	}

	// console.log(root);
	// console.log("checking for "+keyName);
	// console.log(root.tagName);


	if(keyName.charAt(0) == '[')  {
		var att = keyName.replace(/\[|\]/g, '');
		if(root.attributes[att] != null)  {
			applyFuncArray(root, PINE.get(keyName), applyUs);

			// applyUs(root, PINE.get(keyName));
		}
	}
	else if(root.tagName == keyName)  {
		// console.log(keyName+" found");
		// applyMe(root, PINE.get(keyName));
		applyFuncArray(root, PINE.get(keyName), applyUs);
	}
	


	var branches = root.childNodes;

	for(var i = 0; i < branches.length; i++)  {
		var branch = branches[i];
		var nodeName = branch.nodeName;

		switch(nodeName)  {
			case "#text":
				break;

			case "#comment":
				break;

			default: {
				PINE.fillTree(branch, keyName, applyUs);
			}

		}
	}
}









// function applyNeedleFunctions(keyName, domNode, func_map)  {
// 	var needleFuncs = func_map.all[keyName];
// 	if(needleFuncs != null)  {
// 		var needle = PINE.get(keyName);

// 		var pinelog = domNode._pine_.appliedNeedles[keyName];
// 		if(pinelog == null)  {
// 			pinelog = domNode._pine_.appliedNeedles[keyName] = {};
// 			pinelog.needle = needle;
// 			// pinelog.appliedFuncs = [];

// 			// while(needleFuncs.length)  {
// 			// 	needleFuncs.pop()(domNode, needle);
// 			// }

// 			for(i_func in needleFuncs) {
// 				needleFuncs[i_func](domNode, needle);
// 				// pinelog.appliedFuncs.push(needleFuncs[i_func]);
// 			}
// 		}
// 		else  {
// 			PINE.err("Needle for "+keyName+" already applied to dom element (check console)");
// 			console.log(domNode);
// 		}			
// 	}
// }



// PINE.solveTree = function(rootNode, func_type)  {
	

// 	if(rootNode._pine_ == null) {
// 		rootNode._pine_ = {};
// 		rootNode._pine_.appliedNeedles = {};
// 	}

	
// 	var needleFuncMap = PINE.functions[func_type];


// 	//attribute needles
// 	var atts = rootNode.attributes;
// 	for(i_att = 0; i_att < atts.length; i_att++) {
// 		var attKey = "["+atts[i_att].name+"]";
// 		applyNeedleFunctions(attKey, rootNode, needleFuncMap);
// 	}

// 	//tag needles
// 	var rootNodeName = rootNode.nodeName.toLowerCase();
// 	applyNeedleFunctions(rootNodeName, rootNode, needleFuncMap);


// 	var branches = rootNode.childNodes;

// 	for(var i = 0; i < branches.length; i++)  {
// 		var branch = branches[i];
// 		var nodeName = branch.nodeName.toLowerCase();

// 		switch(nodeName)  {
// 			case "#text":
// 				break;

// 			case "#comment":
// 				break;

// 			default: {
				

// 				PINE.solveTree(branch, func_type);
// 			}

// 		}
// 	}
// }










// PINE.run = function()  {
// 	$("pine").each(function() {
// 		for(index in PINE.OrderOfOperations)  {
// 			var func_type = PINE.OrderOfOperations[index];
// 			PINE.solveTree(this, func_type);
// 		}		
// 	});
// }



// function applyNeedleFunctions(keyName, domNode, func_map)  {
// 	var needleFuncs = func_map.new[keyName];
// 	if(needleFuncs != null)  {
// 		var needle = PINE.get(keyName);

// 		var pinelog = domNode._pine_.appliedNeedles[keyName];
// 		if(pinelog == null)  {
// 			pinelog = domNode._pine_.appliedNeedles[keyName] = {};
// 			pinelog.needle = needle;
// 			// pinelog.appliedFuncs = [];

// 			// while(needleFuncs.length)  {
// 			// 	needleFuncs.pop()(domNode, needle);
// 			// }

// 			for(i_func in needleFuncs) {
// 				needleFuncs[i_func](domNode, needle);
// 				// pinelog.appliedFuncs.push(needleFuncs[i_func]);
// 			}
// 		}
// 		else  {
// 			PINE.err("Needle for "+keyName+" already applied to dom element (check console)");
// 			console.log(domNode);
// 		}			
// 	}
// }



// PINE.solveTree = function(rootNode, func_type)  {
	

// 	if(rootNode._pine_ == null) {
// 		rootNode._pine_ = {};
// 		rootNode._pine_.appliedNeedles = {};
// 	}

	
// 	var needleFuncMap = PINE.functions[func_type];


// 	//attribute needles
// 	var atts = rootNode.attributes;
// 	for(i_att = 0; i_att < atts.length; i_att++) {
// 		var attKey = "["+atts[i_att].name+"]";
// 		applyNeedleFunctions(attKey, rootNode, needleFuncMap);
// 	}

// 	//tag needles
// 	var rootNodeName = rootNode.nodeName.toLowerCase();
// 	applyNeedleFunctions(rootNodeName, rootNode, needleFuncMap);


// 	var branches = rootNode.childNodes;

// 	for(var i = 0; i < branches.length; i++)  {
// 		var branch = branches[i];
// 		var nodeName = branch.nodeName.toLowerCase();

// 		switch(nodeName)  {
// 			case "#text":
// 				break;

// 			case "#comment":
// 				break;

// 			default: {
				

// 				PINE.solveTree(branch, func_type);
// 			}

// 		}
// 	}
// }





PINE.createNeedle("sayHey");
PINE.addFunctionForNeedle("sayHey", PINE.STATIC, function(initMe, needle) {
	initMe.innerHTML = "Hey";
});






PINE.createNeedle("showHtml");
PINE.addFunctionForNeedle("showHtml", PINE.PREPROCESS, function(initMe, needle) {
	initMe.innerHTML = exitHtml(initMe.innerHTML);
});

PINE.createNeedle("[showHtml]");
PINE.addFunctionForNeedle("[showHtml]", PINE.PREPROCESS, function(initMe, needle) {
	initMe.innerHTML = exitHtml(initMe.innerHTML);
});
















var templateAttNeedle = PINE.createNeedle("[template]");
PINE.addFunctionForNeedle("[template]", PINE.DEFINER, function(initMe, needle) {

	console.log("running template");

	var tagName = initMe.tagName;

	console.log(needle);
	console.log(initMe);


	var templatedNeedle = PINE.get(tagName);
	if(templatedNeedle == null) {
		templatedNeedle = PINE.createNeedle(tagName, null);	
	}

	if (templatedNeedle.template == null) {
		templatedNeedle.template = {}
		templatedNeedle.template.clones = [];
		templatedNeedle.template.masterCopy = initMe;
	}
	else {
		PINE.err("template for "+tagName+" already exists!  Overwriting in case that's what you want... if not, just remove template attribute");	
	}

	
	

	$(initMe).remove();




	PINE.addFunctionForNeedle(tagName, PINE.POPULATER, function(tagElement, tagNeedle) {
		console.log(tagElement);
		console.log(tagNeedle);

		var template = tagNeedle.template;

		$elem = $(tagElement);

		// tagNeedle.masterCopy = masterCopy;
		var attributes = template.masterCopy.attributes;

		for(var i = 0; i < attributes.length; i++) {
			var att_name = attributes[i].name;

			if(att_name != "template")  {
				var att_value = attributes[i].value;
				if($elem.attr(att_name) == null) {
					$elem.attr(att_name, att_value);
				}
			}
		}

		$elem.html(template.masterCopy.innerHTML);
		template.clones.push(tagElement);
	});

});






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






// function assertSingleton(array) {
// 	if(array.length != 1) {
// 		PINE.err("ASSERT FAIL: "+array+" not a singleton");
// 		return null;
// 	}
// 	else return $(array[0]);
// }






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




// 	if(PINE.createMutateLogger == true) {
// 		// select the target node
// 		var target = document.querySelector('body');
		 
// 		// create an observer instance
// 		var observer = new MutationObserver(function(mutations) {
// 		  mutations.forEach(function(mutation) {
// 		    console.log(mutation);
// 		  });    
// 		});
		 
// 		// configuration of the observer:
// 		var config = { attributes: true, childList: true, characterData: true, subtree: true };
		 
// 		// pass in the target node, as well as the observer options
// 		observer.observe(target, config);
//  	}




// 	$("pine [define]").each(function() {
// 		var m_handle = $(this)[0].tagName.toLowerCase();

// 		var needle = PINE.get(m_handle);

// 		if(needle == null) {
// 			needle = {};
// 		}
// 		needle.html = $(this)[0].innerHTML;
// 		needle.clones = [];
		
// 		$(this).remove();

// 		var masterCopy = this;

// 		$("pine "+m_handle).each(function(index) {
// 			this.masterCopy = masterCopy;
// 			var attributes = masterCopy.attributes;

// 			for(var i = 0; i < attributes.length; i++) {
// 				var att_name = attributes[i].name;

// 				if(att_name != "define")  {
// 					var att_value = attributes[i].value;
// 					if($(this).attr(att_name) == null) {
// 						$(this).attr(att_name, att_value);
// 					}
// 				}
// 			}

// 			$(this).html(needle.html);
// 			var addMe = { $ : $(this) }
// 			needle.clones.push(addMe);

// 			PINE.init(this);
// 			if(needle.init != null) {
// 				needle.init(initMe); }
// 		});
// 	});


// });











PINE.createNeedle("include");
PINE.addFunctionForNeedle("include", PINE.STATIC, function(initMe, needle) {

	var showText = $(initMe).attr("showText");
	showText = (showText != "false" && showText != null);

	if(needle.includeBank == null) {
		needle.includeBank = {};
	}

	var src = initMe.attributes.src;
	
	if(src != null)  {
		var target = src.value;

		if(needle.includeBank[target] == null)  {
			needle.includeBank[target] = {};

			$.get(target, 
				function(response){
					console.log(response);
					if(response == null) {
						PINE.err("include src '"+target+"' does not exist")
					}
					else {
						needle.includeBank[target].element = response.documentElement;
						doInclude();
					}
				}
			);


		}			
		else doInclude();
	}
	else {
		PINE.err("include src for "+initMe+" in not set");
	}


	function doInclude()  {
		if(needle.includeBank[target].element == null)  {
			setTimeout(doInclude, 10);
		}
		else {
			if(showText == false) {
				// $(initMe).html($(needle.includeBank[target].element).clone());
				$(initMe).html(needle.includeBank[target].element.outerHTML);

				for(index in PINE.OrderOfOperations)  {
					var func_type = PINE.OrderOfOperations[index];
					PINE.solveTree(initMe, func_type);
				}	

			}
			else {
				var decompileMe = needle.includeBank[target].element.outerHTML;
				$(initMe).html(exitHtml(decompileMe));
			}
		}
	}
});


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

































