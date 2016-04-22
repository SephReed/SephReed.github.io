PINE.createNeedle("[opacity]").addFunction({
	opType: PINE.ops.COMMON,
	fn: function(initMe, needle) {
		var opacity = initMe.attributes.opacity ? initMe.attributes.opacity.value : "1.0";
		$(initMe).css('opacity', opacity);	
	}
});



PINE.createNeedle("[textAlign]").addFunction({
	opType: PINE.ops.COMMON,
	fn: function(initMe, needle) {
		var align = initMe.attributes.textAlign ? initMe.attributes.textAlign.value : "left";
		$(initMe).css('text-align', align);	
	}
});


PINE.createNeedle("[fontSize]").addFunction({
	opType: PINE.ops.COMMON,
	fn: function(initMe, needle) {
		var fsize = initMe.attributes.fontSize ? initMe.attributes.fontSize.value : "inherit";
		$(initMe).css('font-size', fsize);	
	}
});


PINE.createNeedle("[bgImage]").addFunction({
	opType: PINE.ops.COMMON,
	fn: function(initMe, needle) {
		var bgImage = initMe.attributes.bgImage ? initMe.attributes.bgImage.value : "NOT SPECIFIED";
		$(initMe).css('background-image', bgImage);	
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



PINE.createNeedle("[selectOnClick]").addFunction({
	opType: PINE.ops.STATIC,
	fn: function(initMe, needle) {
		initMe.addEventListener("click", function(e) {
			selectNodeText(initMe);
		});
	}
});
