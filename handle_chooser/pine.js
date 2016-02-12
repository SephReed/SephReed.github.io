

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



PINE.registerFunction = function(args)  {
	var key = args.key.toUpperCase();
	var step_type = args.step_type ? args.step_type : PINE.STATIC;
	var addMe = args.fn;
	var continuous = args.continuous ? args.continuous : false;


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
				PINE.err("function type"+step_type+"registered for needle "+key+" but not for PINE");
		}


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
					console.log(mutations);

					mutations.forEach(function(mutation) {
				  		if(PINE.keyApplies(key, mutation.target)){
				  			if(parentSee.skipOne == false) {
					  			parentSee.skipOne = true;
					  			addMe(initMe, needle);

					  			console.log("applying watch");
					  		}
					  		else {
					  			console.log("skipping watch");
					  			console.log(mutation);
					  			parentSee.skipOne = false;
					  		}
							// else parentSee.skipOne = false;
				  		}
				  	});    
				});
				// observers.parentSee.observer.observe(initMe.parentNode, config);
				observers.parentSee.observer.observe(initMe, config);


				// var deepObserver = new MutationObserver(function(mutations) {
				//   	mutations.forEach(function(mutation) {
				//   		console.log(mutation);
				//   		// applyFuncArray(initMe, needle, addMe);
				//   		addMe(initMe, needle);
				//   	});    
				// });
				// deepObserver.observe(initMe, config);


				// console.log("addingObserver");
				// console.log(observer);
			}
		}

		step_fns.all[key].push(funcWithObserve);
		step_fns.new[key].push(funcWithObserve);
		needle.functions[step_type].push(funcWithObserve);

		
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




Zepto(function($){
	PINE.initDebug();
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

			console.log(keyName)
			step = -1;
			break;
		}
		console.log(step)
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
		// root._pine_.holds = {};
	}

	// console.log(root);
	// console.log("checking for "+keyName);
	// console.log(root.tagName);


	if(PINE.keyApplies(keyName, root)){
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










PINE.createNeedle("sayHey");
PINE.registerFunction({
	key : "sayHey",
	step_type : PINE.STATIC,
	continuous : false,
	fn : function(initMe, needle) {
		initMe.innerHTML = "<b>Hey</b>";
	}
});
// PINE.addFunctionForNeedle("sayHey", PINE.STATIC, function(initMe, needle) {
// 	initMe.innerHTML = "<b>Hey</b>";
// });






PINE.createNeedle("showHtml");
PINE.addFunctionForNeedle("showHtml", PINE.PREPROCESS, function(initMe, needle) {
	initMe.innerHTML = exitHtml(initMe.innerHTML);
});

PINE.createNeedle("[showHtml]");
PINE.registerFunction({
	key : "[showHtml]",
	step_type : PINE.PREPROCESS,
	continuous : true,
	fn : function(initMe, needle) {
		initMe.innerHTML = exitHtml(initMe.innerHTML);
	}
});
// PINE.addFunctionForNeedle("[showHtml]", PINE.PREPROCESS, function(initMe, needle) {
// 	initMe.innerHTML = exitHtml(initMe.innerHTML);
// });
















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

	console.log("include");

	if(needle.includeBank == null) {
		needle.includeBank = {};
	}

	var src = initMe.attributes.src;
	
	if(src != null)  {
		var target = src.value;

		if(needle.includeBank[target] == null)  {
			needle.includeBank[target] = {};


			$.ajax({
				type: 'GET',
				url: target,
			  	// type of data we are expecting in return:
			  	dataType: 'html',
			  	success: function(response){
			  		console.log(response);
			  		needle.includeBank[target].outerHTML = response;
					doInclude();
			    	// needle.includeBank[target].element = response.documentElement;
					// doInclude();
			  	},
			  	error: function(xhr, type){
			    	PINE.err("include src '"+target+"' does not exist")
			  	}
			});


		}			
		else doInclude();
	}
	else {
		PINE.err("include src for "+initMe+" in not set");
	}


	function doInclude()  {
		if(needle.includeBank[target].outerHTML == null)  {
			setTimeout(doInclude, 10);
		}
		else  {

			initMe.innerHTML = needle.includeBank[target].outerHTML;

			// var div = document.createElement('div');
			// div.innerHTML = needle.includeBank[target].outerHTML;
			// var elements = div.childNodes;

			// console.log(div);
			// console.log(initMe);
			// // initMe.appendChild( div);

			// initMe.innerHTML = div.innerHTML;



			// $(initMe).html(needle.includeBank[target].outerHTML);

			var step_maps = [];
			for(index in PINE.OrderOfOperations)  {
				var step_type = PINE.OrderOfOperations[index];
				step_maps.push(PINE.functions[step_type].all);
			}


			var fakeGroup = {};
			fakeGroup.childNodes = initMe.childNodes;
			fakeGroup.attributes = {};
			fakeGroup.tagName = {};

			for(var step = 0; step < step_maps.length; step++)  {

				for(keyName in step_maps[step]) {
					var applyUs = step_maps[step][keyName];
					delete step_maps[step][keyName];
					
					PINE.fillTree(fakeGroup, keyName, applyUs);

					console.log(keyName)
					step = -1;
					break;
				}

				console.log(step)
			}
		
			PINE.run();
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

































