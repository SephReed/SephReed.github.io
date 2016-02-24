












var spawner = PINE.createNeedle("[spawner]");
spawner.registerFunction({
	step_type : PINE.ops.PREPROCESS,
	topToBottog : true,
	fn : function(initMe, needle) {
		console.log("spawner PREPROCESS");
		console.log(initMe);

		// initMe._pine_["[spawner]"] = {};



		// var keyString = initMe.attributes.for.value;
		// var array = U.get(window, keyString);

		// U.assertKey(initMe, "_pine_.for");
		// initMe._pine_.for.array = array;


		var indexer = initMe.attributes.index;
		indexer = indexer ? indexer.value : "i";

		// PINE.holdVar(initMe, indexer);

		U.assertKey(initMe, "_pine_.spawner");
		initMe._pine_.spawner.indexer = indexer;

		console.log(this);

		// this.pvar(spawner).indexer = indexer;

		
		var branches = initMe.childNodes;
		var spawn = null;
		for(var i = 0; i < branches.length && !spawn; i++)  {
			var branch = branches[i];
			var atts = branch.attributes;

			// console.log(branch);
			// console.log(atts);
			
			for(var i_att = 0; atts && i_att < atts.length && !spawn; i_att++)  {

				// console.log(atts[i_att]);

				if("spawn" == atts[i_att].name)  {
					spawn = branch;	
					// branch.remove();
				}
			}
		}
		if(spawn)  {
			PINE.holdVar(spawn, indexer);
		}



		// console.log(initMe);

		// var scope = {};
		// scope.i = 0;
		// for(scope.i in array)  {
			
		// }
	}
});


spawner.registerFunction({
	step_type : PINE.ops.POPULATER,
	fn : function(initMe, needle) {
		// console.log("for found");


		// if(initMe._pine_["[spawner]"].complete == true) {
		// 	console.log("spawner already spawned");
		// 	return;
		// }

		console.log("spawner POPULATER");
		console.log(initMe);

		var keyString = initMe.attributes.spawner.value;
		// var array = U.get(window, keyString);


		var array = window[keyString];
		// var array = PINE.pnv.getVarFrom(keyString, initMe).value;

		// U.assertKey(initMe, "_pine_.for");
		// initMe._pine_.for.array = array;


		// var holdMe = initMe.attributes.index;
		// holdMe = holdMe ? holdMe.value : "i";

		// PINE.holdVar(initMe, holdMe);

		
		var branches = initMe.childNodes;
		var spawn = null;
		for(var i = 0; i < branches.length && !spawn; i++)  {
			var branch = branches[i];
			var atts = branch.attributes;
			
			for(var i_att = 0; atts && i_att < atts.length && !spawn; i_att++)  {

				if("spawn" == atts[i_att].name)  {
					spawn = branch;	
					branch.remove();
				}
			}
		}



		if(spawn){
			var indexer = initMe._pine_.spawner.indexer;

			// PINE.unholdVar(initMe, indexer);
			PINE.unholdVar(spawn, indexer);
			console.log(array);

			// var scope = {};
			// scope.indexer = 0;
			for(i in array)  {
				console.log(spawn);

				var addMe = PINE.deepCloneNode(spawn);
				// var addMe = spawn.cloneNode();
				// spawn.cloneNode(true);
				U.assertKey(addMe, "_pine_.pnv.vars."+indexer);
				addMe._pine_.pnv.vars[indexer] = i;

				addMe.setAttribute("scopeVar", indexer+'='+i);

				console.log("adding:");
				console.log(addMe);
				

				initMe.appendChild(addMe);

				// PINE.permeate(addMe);
			}

			// initMe._pine_["[spawner]"].complete = true;
		}

		
	}
});








// PINE.createNeedle("showHtml").registerFunction({
// 	step_type : PINE.PREPROCESS,
// 	// continuous : true,
// 	fn : function(initMe, needle) {


// 		initMe.innerHTML = exitHtml(initMe.innerHTML);
// 	}
// });

// PINE.createNeedle("[showHtml]").registerFunction({
// 	step_type : PINE.PREPROCESS,
// 	// continuous : true,
// 	fn : function(initMe, needle) {

// 		console.log("showingHtml");
// 		initMe.innerHTML = exitHtml(initMe.innerHTML);
// 	}
// });
















// var templateAttNeedle = PINE.createNeedle("[template]");
// PINE.registerFunction({
// 	key : "[template]",
// 	step_type : PINE.DEFINER,
// 	fn: function(initMe, needle) {

// 		// console.log("running template");

// 		var tagName = initMe.tagName;

// 		// console.log(needle);
// 		// console.log(initMe);


// 		var templatedNeedle = PINE.get(tagName);
// 		if(templatedNeedle == null) {
// 			templatedNeedle = PINE.createNeedle(tagName, null);	
// 		}

// 		if (templatedNeedle.template == null) {
// 			templatedNeedle.template = {}
// 			templatedNeedle.template.clones = [];
// 			templatedNeedle.template.masterCopy = initMe;
// 		}
// 		else {
// 			PINE.err("template for "+tagName+" already exists!  Overwriting in case that's what you want... if not, just remove template attribute");	
// 		}

		
		

// 		$(initMe).remove();



// 		PINE.registerFunction({
// 			key : tagName,
// 			step_type : PINE.POPULATER,
// 			fn: function(tagElement, tagNeedle) {
// 				// console.log(tagElement);
// 				// console.log(tagNeedle);

// 				var template = tagNeedle.template;

// 				$elem = $(tagElement);

// 				// tagNeedle.masterCopy = masterCopy;
// 				var attributes = template.masterCopy.attributes;

// 				for(var i = 0; i < attributes.length; i++) {
// 					var att_name = attributes[i].name;

// 					if(att_name != "template")  {
// 						var att_value = attributes[i].value;
// 						if($elem.attr(att_name) == null) {
// 							$elem.attr(att_name, att_value);
// 						}
// 					}
// 				}

// 				$elem.html(template.masterCopy.innerHTML);
// 				template.clones.push(tagElement);

// 				// PINE.permeate(tagElement);
// 			}
// 		});
// 	}
// });
















PINE.createNeedle("include").registerFunction({
	step_type : PINE.ops.STATIC,
	autoComplete : false,
	fn: function(initMe, needle) {

		var pineFunc = this;
		// console.log(this);

		// console.log("INCLUDING" );


		// U.assertKey(initMe, "_pine_.include.included");
		// if(initMe._pine_.include.included == true) {
		// 	console.log('already included');
		// 	return;
		// }
		// 	//
		// else initMe._pine_.include.included = false;

			


		// if(initMe.attributes.included !== undefined)  {
		// 	console.log('already included');
		// 	return;
		// }



		// console.log(needle);
		

		// console.log("include");

		if(needle.includeBank == null) {
			needle.includeBank = {};
		}

		var src = initMe.attributes.src;
		// console.log(src);
		// console.log(initMe);
		
		
		if(src != null) {
			
			if(src.value == '') return;

			var id = needle.keyName;
			// PINE.addHold(PINE.STATIC, id, initMe);

			var target = src.value;

			if(needle.includeBank[target] == null)  {
				needle.includeBank[target] = {};


				$.ajax({
					type: 'GET',
					url: target,
				  	dataType: 'html',
				  	success: function(response){
				  		needle.includeBank[target].outerHTML = response;
						doInclude();
				  	},
				  	error: function(xhr, type){
				    	PINE.err("include src '"+target+"' does not exist")
				  	}
				});


			}			
			else doInclude();
		}

		else PINE.err("include src for "+initMe+" in not set");


		function doInclude()  {
			if(needle.includeBank[target].outerHTML == null)  {
				setTimeout(doInclude, 10);
			}
			else  {
				// initMe._pine_.include.included = true;

				// console.log(needle.includeBank[target].outerHTML);

				initMe.innerHTML = needle.includeBank[target].outerHTML;

				var evalIndex = PINE.evals.length;
				PINE.evals[evalIndex] = {};
				var evalPrefix = "PINE.evals["+evalIndex+"].";

				var localVars = [];

				var scripts = initMe.getElementsByTagName("script");
				// console.log(scripts);
				for(var s = 0; s < scripts.length; s++)  {

					var rex = /(var.+(;|\n)|(\{(.|\n)+?\}))/g;
					var localVarRex = scripts[s].innerHTML.match(rex);

					for(i in localVarRex)  {
						var match = localVarRex[i];
						if(match.charAt(0) != '{') {
							var var_name = match.replace(/(var +|( ?)+=.+\n?)/g, '');
							
							var_name = var_name.replace(/[\n\r;]/g, '');
							localVars.push(var_name);
						}
					}
				}


				// console.log(localVars);


				for(var s = 0; s < scripts.length; s++) {
					var textToEval = scripts[s].innerHTML;
					for(i in localVars)  {
						var match = localVars[i];
						var replace = evalPrefix+match;

						var rex = new RegExp("(var)?[^\.]"+match, "g");
						// console.log(rex);

						textToEval = textToEval.replace(rex, function(replaceMe) {
							var out = replaceMe;
							if(replaceMe.charAt(0) != '.') {
								// console.log('match::"'+replaceMe+'"');
								out = replace;
								if(replaceMe.charAt(0) != 'v')
									out = replaceMe.charAt(0)+replace;
								
								// var var_name = match.replace(/(var +|( ?)+=.+)\n?/g, '');
								// var store = evalPrefix+var_name+" = "+var_name;
								// // var store = match.replace(/var +/g, evalPrefix);
								// out = match+'\n'+store+';\n';
								// console.log("out::"+out);
							}
							return out;
						});

						


					}

					// console.log(textToEval);

					eval(textToEval);
				}


				// var scripts = initMe.getElementsByTagName("script");
				// console.log(scripts);
				// for(var s = 0; s < scripts.length; s++)  {
				// 	console.log(scripts[s].innerHTML);

				// 	var rex = /(var.+(;|\n)|(\{(.|\n)+?\}))/g;

				// 	var textToEval = scripts[s].innerHTML.replace(rex, function(match) {
				// 		var out = match;
				// 		if(match.charAt(0) != '{') {
				// 			console.log('match::'+match);
				// 			var var_name = match.replace(/(var +|( ?)+=.+)\n?/g, '');
				// 			var store = evalPrefix+var_name+" = "+var_name;
				// 			// var store = match.replace(/var +/g, evalPrefix);
				// 			out = match+'\n'+store+';\n';
				// 			console.log("out::"+out);
				// 		}
				// 		return out;
				// 	});
				// 	// var varsToPrefix = 

				// 	// while (m = re.exec(text)) {
				// 	//    print(m.index);
				// 	// } 

				// 	// eval(scripts[s].innerHTML);
				// 	console.log(textToEval);
				// 	eval(textToEval);
				// }

				for(key in PINE.evals[evalIndex])  {
					U.assertKey(initMe, "_pine_.pnv.vars");
					initMe._pine_.pnv.vars[key] = PINE.evals[evalIndex][key];
				}



				// PINE.removeHold(PINE.STATIC, id, initMe);

				// initMe.setAttribute("included", '');

				


				// var step_maps = [];
				// for(index in PINE.OrderOfOperations)  {
				// 	var step_type = PINE.OrderOfOperations[index];
				// 	step_maps.push(PINE.functions[step_type].all);
				// }


				// var fakeGroup = {};
				// fakeGroup.childNodes = initMe.childNodes;
				// fakeGroup.attributes = {};
				// fakeGroup.tagName = {};

				

				// for(var step = 0; step < step_maps.length; step++)  {

				// 	for(keyName in step_maps[step]) {
				// 		var applyUs = step_maps[step][keyName];
				// 		delete step_maps[step][keyName];
						

				// 		var func_step = PINE.OrderOfOperations[step];
				
				// 		PINE.fillTree(fakeGroup, func_step, keyName, applyUs);

				// 		// PINE.fillTree(fakeGroup, step, keyName, applyUs);

				// 		// console.log(keyName)
				// 		step = -1;
				// 		break;
				// 	}

				// 	// console.log(step)
				// }
			
				// console.log(pineFunc);
				pineFunc.complete();
				// PINE.permeate(initMe);
				// PINE.run();
			}
		}
	}
});










