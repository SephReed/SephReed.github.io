

var PINE = {};
PINE.needles = {};

PINE.showErr = true;

PINE.err = function(whatevers_the_problem) { //?
	if(PINE.showErr)  {
		console.log("PINE error: "+whatevers_the_problem);
	}
}


PINE.get = function(tagName) {
	return PINE.needles[tagName.toLowerCase()];
}




PINE.registerNeedle = function(tagName, init_function) {
	tagName = tagName.toLowerCase();
	if(PINE.needles[tagName] == null)  {
		PINE.needles[tagName] = {};
		PINE.needles[tagName].init = init_function;
	}
	else {
		PINE.err("needle already registered.  Perhaps try looking into 'PINE.needles[tagName].init' ");
	}
	return PINE.needles[tagName];
}


PINE.init = function(initMe) {
	var doesDefine = $(initMe).attr("define");

	if(doesDefine != null)  {
		PINE.err("Trying to initialize a 'define' element");
	}

	else {
		var catchId = $(initMe).attr("catchId") == "false" ? false : true;

		var m_tagName = $(initMe)[0].tagName.toLowerCase();
		var my_data = initMe;
		var masterCopy = PINE.get(m_tagName);

		function ASSERT_VAR_INIT(checkMe) {
			if(my_data[checkMe] == null) {
				PINE.err(checkMe +" does not exist, creating");
				my_data[checkMe] = {};
				my_data[checkMe].value = null;
				my_data[checkMe].onChange = [];
				return false;
			}
			else return true;
		}

		$(initMe).find("[spawner]").each(function() {
			var my_spawn = assertSingleton($(this).children("[spawn]"));
			my_spawn.remove();

			var spawnArray = $(this).attr("spawner");

			var list = masterCopy[spawnArray];

			if(list)

			for (var i = 0; i < list.length; i++) {
				var appendMe = my_spawn[0].outerHTML.replace(/{{here}}/g, list[i]);
				$(this).append(appendMe);
			};
		});



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

	$("[define]").each(function() {
		var m_handle = $(this)[0].tagName.toLowerCase();

		var needle = PINE.get(m_handle);

		if(needle == null) {
			needle = {};
		}
		needle.html = $(this)[0].innerHTML;
		needle.clones = [];
		
		$(this).remove();

		var masterCopy = this;

		$(m_handle).each(function(index) {
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
		});
	});
});



