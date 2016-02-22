




var templateAttNeedle = PINE.createNeedle("[template]");
templateAttNeedle.registerFunction({
	step_type : PINE.DEFINER,
	fn: function(initMe, needle) {

		console.log(initMe);
		// console.log("running template");

		var tagName = initMe.tagName;

		// console.log(needle);
		// console.log(initMe);


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

		
		

		// $(initMe).remove();
		initMe.remove();



		templatedNeedle.registerFunction({
			step_type : PINE.POPULATER,
			fn: function(tagElement, tagNeedle) {
				// console.log(tagElement);
				// console.log(tagNeedle);

				var template = tagNeedle.template;

				// $elem = $(tagElement);

				// tagNeedle.masterCopy = masterCopy;
				var attributes = template.masterCopy.attributes;

				for(var i = 0; i < attributes.length; i++) {
					var att_name = attributes[i].name;

					if(att_name != "template")  {
						var att_value = attributes[i].value;
						if(tagElement.attributes[att_name] == null) {
							// $elem.attr(att_name, att_value);
							tagElement.setAttribute(att_name, att_value);
						}
					}
				}

				// $elem.html(template.masterCopy.innerHTML);
				tagElement.innerHTML = template.masterCopy.innerHTML;
				template.clones.push(tagElement);

				// PINE.permeate(tagElement);
			}
		});
	}
});



