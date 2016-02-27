PINE.createNeedle("[opacity]").registerFunction({
	step_type: PINE.ops.INITIALIZER,
	fn: function(initMe, needle) {
		var opacity = initMe.attributes.opacity ? initMe.attributes.opacity.value : "1.0";
		$(initMe).css('opacity', opacity);	
	}
});



PINE.createNeedle("[textAlign]").registerFunction({
	step_type: PINE.ops.INITIALIZER,
	fn: function(initMe, needle) {
		var align = initMe.attributes.textAlign ? initMe.attributes.textAlign.value : "left";
		$(initMe).css('text-align', align);	
	}
});


PINE.createNeedle("[fontSize]").registerFunction({
	step_type: PINE.ops.INITIALIZER,
	fn: function(initMe, needle) {
		var fsize = initMe.attributes.fontSize ? initMe.attributes.fontSize.value : "inherit";
		$(initMe).css('font-size', fsize);	
	}
});


PINE.createNeedle("[bgImage]").registerFunction({
	step_type: PINE.ops.INITIALIZER,
	fn: function(initMe, needle) {
		var bgImage = initMe.attributes.bgImage ? initMe.attributes.bgImage.value : "NOT SPECIFIED";
		$(initMe).css('background-image', bgImage);	
	}
});












PINE.createNeedle("[trigger]").registerFunction({
	step_type: PINE.ops.POPULATER,
	fn: function(initMe, needle) {
		var triggerType = initMe.attributes.trigger.value;


		initMe.addEventListener(triggerType, function() {
			var target = initMe.attributes.target.value;
			var fn = initMe.attributes.fn.value;
			var args = initMe.attributes.args.value;

			$(target).each(function() {
				this._pine_.fns[fn]();
			});
		}, false);
	}
});


function selectNodeText( domNode ) {
	 if ( document.selection ) {
        var range = document.body.createTextRange();
        range.moveToElementText( domNode  );
        range.select();
    } else if ( window.getSelection ) {
        var range = document.createRange();
        range.selectNodeContents( domNode );
        window.getSelection().removeAllRanges();
        window.getSelection().addRange( range );
    }
}



PINE.createNeedle("[selectOnClick]").registerFunction({
	step_type: PINE.ops.POPULATER,
	fn: function(initMe, needle) {
		initMe.addEventListener("click", function(e) {
			selectNodeText(initMe);
		});
	}
});
