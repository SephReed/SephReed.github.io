


PINE("onreturn", function(initMe) {
	
	PINE.addFunctionToNode(initMe, "return", function() {
		var submitFn = El.attr(initMe, "onreturn");
		var fn = window[submitFn];

		if(fn) fn(initMe.innerHTML);
	});

	initMe.addEventListener("keypress", function(event) {
		if(event.keyCode == 13) {
			initMe.FNS.return();
		}
	});
});