

var PINE = {};
PINE.needles = {};

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


PINE.get = function(tagName) {
	if(tagName === undefined) return null;
	return PINE.needles[tagName.toLowerCase()];
}





PINE.registerNeedle = function(tagName, init_function) {
	tagName = tagName.toLowerCase();
	if(PINE.needles[tagName] == null)  {
		PINE.needles[tagName] = {};
		// PINE.needles[tagName].init = init_function;
	}
	else {

		console.log(PINE.needles.clones);


		PINE.err("needle already registered.  OVERWRITING init.  Perhaps try looking into 'PINE.needles[tagName].init' ");
	}

	PINE.needles[tagName].init = init_function;
	return PINE.needles[tagName];
}

PINE.register = PINE.registerNeedle;


PINE.init = function(initMe) {
	var doesDefine = $(initMe).attr("define");

	if(doesDefine != null)  {
		PINE.err("Trying to initialize a 'define' element ");
		console.log(initMe);
	}

	else {
		var catchId = $(initMe).attr("catchId") == "false" ? false : true;

		// var m_tagName = $(initMe)[0].tagName.toLowerCase();
		var m_tagName = initMe.tagName.toLowerCase();
		var my_data = initMe;
		var needle = PINE.get(m_tagName);

		

		$(initMe).find("[spawner]").each(function() {
			var my_spawn = assertSingleton($(this).children("[spawn]"));
			my_spawn.remove();

			var spawnArray = $(this).attr("spawner");

			var list = needle[spawnArray];

			if(list == null)  {
				PINE.err("no array called "+spawnArray+" exists under "+needle);
				return;
			}

			for (var i = 0; i < list.length; i++) {
				var appendMe = my_spawn[0].outerHTML.replace(/{{here}}/g, list[i]);
				$(this).append(appendMe);
			};
		});




		//Used by both [setsVal] and [watch] to make sure only one inits a var
		function ASSERT_VAR_INIT(checkMe) {
			if(my_data[checkMe] == null) {
				my_data[checkMe] = {};
				my_data[checkMe].value = null;
				my_data[checkMe].onChange = [];
				return false;
			}
			else return true;
		}


		$(initMe).find("[setsVal]").each(function() {
			var target = $(this).attr("setsVal");
			ASSERT_VAR_INIT(target);

			$(this).change(function() {
				var i_val = $(this).val();

				my_data[target].value = i_val;

				var update_us = my_data[target].onChange;
				for(var i = 0; i < update_us.length; i++)  {
					update_us[i](target);
				}
			});

			$(this).change();
		});



		//TODO: if no parent has watch!!!!
		//TODO: make watch not repeat old html, just insert new;
		$(initMe).find("[watch]").each(function() {
			var $m_watch = $(this);
			var m_html = $m_watch[0].innerHTML;

			var watched_vars = m_html.match( /{{@#?\w+}}/g );

			var seeChange = function(target) {
				var new_html = m_html;

				for(var i = 0; i < watched_vars.length; i++)  {
					var target = watched_vars[i].replace(/[{@}]/g, "");
					var i_val;

					if(target.charAt(0) == '#') {
						var element = catchId ? $(my_data).find(target)[0] : $(target)[0];
						if(element) i_val = $(element).val(); 
					}
					else {
						i_val = my_data[target].value;	
					}
					 
					if(i_val == null) {
						console.log("Pine ERR: watched data {{@"+target+"}} does not exist");
					}

					new_html = new_html.replace(watched_vars[i], i_val);
				}
				$m_watch[0].innerHTML = new_html;
			};



			watched_vars.forEach(function(watchForMe) {
				var target = watchForMe.replace(/[{@}]/g, "");
				
				if(target.charAt(0) == '#') {
					var element = catchId ? $(my_data).find(target)[0] : $(target)[0];
					$(element).change(seeChange); 
				}
				else {
					ASSERT_VAR_INIT(target);
					my_data[target].onChange.push(seeChange);
				}
			});

			seeChange(null);
		});
	}
};






function assertSingleton(array) {
	if(array.length != 1) {
		PINE.err("ASSERT FAIL: "+array+" not a singleton");
		return null;
	}
	else return $(array[0]);
}






Zepto(function($){


	//THIS SOLVES THE PROBLEM BADLY
	//TODO: call init functions without observing all changes.
	//know when a static page will call for inits to work
	if(PINE.avoidReferenceIssues) {
		// select the target node
		var target = document.querySelector('body');
		 
		// create an observer instance
		var observer = new MutationObserver(function(mutations) {
		  	mutations.forEach(function(mutation) {
		  		var newBits = mutation.addedNodes;
		  		// console.log(newBits);
		  		for(var i = 0; i < newBits.length; i++) {

		  			var justAdded = newBits[i];
		  			var needle = PINE.get(justAdded.tagName);

		    		if(needle != null) {
		    			PINE.init(justAdded);
		    			needle.init(justAdded);
		    		}
		    	}
		  	});    
		});
		 
		// configuration of the observer:
		var config = { childList: true, subtree: true };
		 
		// pass in the target node, as well as the observer options
		observer.observe(target, config);
	}




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
 	}




	$("pine [define]").each(function() {
		var m_handle = $(this)[0].tagName.toLowerCase();

		var needle = PINE.get(m_handle);

		if(needle == null) {
			needle = {};
		}
		needle.html = $(this)[0].innerHTML;
		needle.clones = [];
		
		$(this).remove();

		var masterCopy = this;

		$("pine "+m_handle).each(function(index) {
			this.masterCopy = masterCopy;
			var attributes = masterCopy.attributes;

			for(var i = 0; i < attributes.length; i++) {
				var att_name = attributes[i].name;

				if(att_name != "define")  {
					var att_value = attributes[i].value;
					if($(this).attr(att_name) == null) {
						$(this).attr(att_name, att_value);
					}
				}
			}

			$(this).html(needle.html);
			var addMe = { $ : $(this) }
			needle.clones.push(addMe);

			PINE.init(this);
			if(needle.init != null) {
				needle.init(initMe); }
		});
	});


});










PINE.registerNeedle("include", function(initMe) {

	var showText = $(initMe).attr("showText");
	showText = (showText != "false" && showText != null);

	var needle = this;

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

































