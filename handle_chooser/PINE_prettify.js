//html
//matches tags    (>(\w?)+)?(<\/?\w+|>)>?

//within
//<.+>
//        /  \w+/g
//		(".+?"|'.+')




PINE.createNeedle("[pretifyCode]").registerFunction({
	step_type : PINE.PREPROCESS,
	fn : function(initMe, needle) {
		// console.log("HEY");
		var codeType = initMe.attributes.pretifyCode.value || "html";

		console.log("codeType "+codeType);

		initMe.innerHTML = pretifyCode(initMe.innerHTML, codeType);
	}
});






var _Pretify = {};
_Pretify.fns = {};


_Pretify.html = {};
_Pretify.html.scriptsRex = "(<script(.|\n)+?<\/script>)";
_Pretify.html.stylesRex =  "(<style(.|\n)+?<\/style>)";
_Pretify.html.leftoversRex =  "(.+\n*)+";
// _Pretify.html.tagsRex = "(>(\w?)+)?(<\/?\w+|>)>?";
_Pretify.html.bracketsRex = "<.+?>";
_Pretify.html.tagsRex = "((<\w+)>?|>)";
_Pretify.html.attsRex = "( \w+)";
_Pretify.html.stringsRex = "(\".+?\"|'.+')";
	//
_Pretify.fns["html"] = function(code, notScript)  {
	var h = _Pretify.html;
	var htmlSectionsRex = new RegExp(h.scriptsRex+'|'+h.stylesRex+'|'+h.leftoversRex, 'g');
	var htmlTagSectionsRex = new RegExp(h.tagsRex+'|'+h.attsRex+'|'+h.stringsRex, 'g');

	// console.log("hey");

	var out = code.replace(htmlSectionsRex, function(match, p1, p2, p3, p4, p5)  {
		var out = match;


		if(p1 != null && notScript != true)  {
			var jsfn = _Pretify.fns["js"];

			if(jsfn != null) {
			//splits the tags from the script
				return out.replace(/(<\/?script.*>)|((.|\n)+?(?=<\/script>))/g, function(match, p1, p2){

					// console.log(match);

					if(p1 !== undefined) 
						return _Pretify.fns["html"](match, true);
					else
						return jsfn(semiExitHtml(match));
				});
			}

			// if(jsfn != null) 
				// return jsfn(exitHtml(match));
				// return jsfn(match);
		}
		else if(p3 != null)  {
			// console.log("stlye match:"+match);

		}
		else  {
			// console.log("html match:"+match);
			out = out.replace(new RegExp(h.bracketsRex, 'g'), function(match){
				// match = semiExitHtml(match);
				// console.log(match+"::");

				// var tagMatch = "(\w+)";
				// var attMatch = "( \w+)";
				// var stringMatch = "(\".+?\"|'.+')";
				
				return match.replace(/(\w+)|( \w+)|(\".+?\"|'.+')|(<)|(>)/g, function(match, p1, p2, p3) {
					// console.log(match);
					// match = semiExitHtml(match);
					
					if(p1 !== undefined) 
						return "<tg>"+match+"</tg>";	
					
					else if(p2 !== undefined) 
						return "<att>"+match+"</att>";
					
					else if(p3 !== undefined) 
						return "<st>"+match+"</st>";

					else if(match == '<') 
						return "&lt;";

					else if(match == '>') 
						return "&gt;";

					else return match;
				});
			});

			// console.log(out);
			return out;
		}

		return out;
	});


	return out;
	
}




//		true|false|undefined
//		function

//		function(.+|\n+)\)        all of function stuff
//		(function)|(.+)			  // split

_Pretify.fns["js"] = function(code)  {
	var out = code;

	// console.log("js");
	//get function(....)
	// out = out.replace(/function(.+|\n+)\)/g, function(match){
	// 	console.log(match);

	// 	//split function and (...)
	// 	return match.replace(/(function)|(.+)/g, function(match, p1, p2) {
	// 		if(p1 != null)
	// 			return "<st>"+match+"</st>";
	// 		else
	// 			return match;
	// 	});
	// });

	//matches strings, and everything between strings
	out = out.replace(/(\".+?\"|'.+?')|(\/{2,}.+\n)|((.|\n)+?(?=["']|$|\/{2,}))/g, function(match, p1, p2){
		
		if(p1 != null) {
			return "<st>"+match+"</st>";
		}
		else if (p2 != null) {
			return "<com>"+match+"</com>";
		}
		else {
			var out = match;
			out = out.replace(/true|false|undefined/g, 
				function(match){ return "<att>"+match+"</att>"; });

			out = out.replace(/if|else|new|return|&&?|\+|\|\||!|-|=|\*|%|\$/g, 
				function(match){ return "<tg>"+match+"</tg>"; });

			out = out.replace(/var|function/g, 
				function(match){ return "<vr>"+match+"</vr>"; });

			return out;
		}
	});


	return out;
}






function pretifyCode(code, codeType)  {
	var fn = _Pretify.fns[codeType.toLowerCase()];

	var out = code;


	out = deTab(out);


	if(fn != null)  
		out = fn(out);



	out = removeSurroundingWhitespace(out);
	out = out.replace(/\n/g, '<br>');


	


	// out = exitHtml(out);
	return out;
	

	
}


function deTab(code)  {
	var out = code;

	var tabs = out.match(/(\n|^)\t*[\w\d]/g);	
	if(tabs){
		var minAmount = -1;
		for(var i = 0; i < tabs.length && minAmount != 0; i++) {
			var numTabs = tabs[i].length - 1;
			if(tabs[i].charAt(0) != '\t')
				numTabs--;

			if(numTabs < minAmount || i == 0) {
				minAmount = numTabs;
			}			
		}
		
		if(minAmount > 0) {
			var regex = new RegExp("(\n|^)\t{"+minAmount+"}", "g");
			out = out.replace(regex, function(match){
				if(match.charAt(0) != '\t')
					return match.charAt(0);
				else return '';
			});
		}
	}

	return out;
}


function removeSurroundingWhitespace(code)  {
	return code.replace(/(^[\n\s]+)|([\n\s]+$)/g, '');
}



function semiExitHtml(code)  {
	var out = code;

	out = out.replace(/&/g, '&amp;');
	out = out.replace(/</g, '&lt;');
	out = out.replace(/>/g, '&gt;');

	return out;
}










function exitHtml(exitMe)  {
	// exitMe = exitMe.replace("<!--", '');
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





