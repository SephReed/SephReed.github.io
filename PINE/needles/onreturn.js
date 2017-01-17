


PINE.createNeedle("[onreturn]", function(onreturn) {

	onreturn.addAttArg("fnName", ["onreturn"], "string")

	onreturn.addInitFn(function() {
		var domNode = this.domNode;
		domNode.addEventListener("keypress", function(event) {
			if(event.keyCode == 13) {
				domNode.FNS.return();
			}
		});
	});

	onreturn.FNS.return = function() {
		var job = this;
		var fn = window[job.attArg.fnName];

		console.log("pressed");
		if(fn) fn(job.domNode.innerHTML);
	}
	
	
});