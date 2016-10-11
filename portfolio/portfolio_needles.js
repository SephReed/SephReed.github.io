







PINE("[opacity]", function(initMe) {
	var opacity = El.attr(initMe, "opacity") || "1.0";
	initMe.style.opacity = opacity;
});



PINE("[textAlign]", function(initMe) {
	var align = El.attr(initMe, "textAlign") || "left";
	initMe.style.textAlign = align;
});


PINE("[fontSize]", function(initMe) {
	var fsize = El.attr(initMe, "fontSize") || "inherit";
	initMe.style.fontSize = fsize;
});

PINE("[bgImage]", function(initMe) {
	initMe.style.backgroundImage = El.attr(initMe, "bgImage");
});


PINE.createNeedle("[selectOnClick]").addFunction({
	opType: PINE.ops.STATIC,
	fn: function(initMe, needle) {
		initMe.addEventListener("click", function(e) {
			selectNodeText(initMe);
		});
	}
});











			




var p_scrollLink = PINE("[scrollLink]", function(initMe) {

	initMe.addEventListener("click", function(event) {
		event.preventDefault();
		initMe.FNS.scrollLinkTrigger();
	});

	PINE.addFunctionToNode(initMe, "scrollLinkTrigger", function() {
		var target_att = El.attr(initMe, "scrollLinkTarget")
			|| El.attr(initMe, "target");

		if(target_att == undefined) {
			target_att = El.attr(initMe, "href");
			if(target_att.charAt(0) == '#')
				target_att = target_att.substring(1);
			else
				target_att = undefined;
		}

		var target = target_att ? El.byId(target_att) : null;

		if(target) {
			var ms = El.attr(initMe, "scrollLink") || p_scrollLink.defaultTime;
			var delay_att = El.attr(initMe, "scrollLinkDelay")
			var delay = p_scrollLink.defaultDelayTime
			if(delay_att)
				delay = parseInt(delay_att);

			var coords = { x: window.scrollX, y: window.scrollY };
			var targetY = target.offsetTop - p_scrollLink.defaultTopOffset;
			var targetX = target.offsetLeft - p_scrollLink.defaultSideOffset;


			setTimeout(function() {
				var tween = new TWEEN.Tween(coords)
				    .to({ x: targetX, y: targetY }, ms)
				    .onUpdate(function() {
				        window.scrollTo(~~this.x, ~~this.y);
				    })
				    .easing(TWEEN.Easing.Sinusoidal.InOut)
				    .start();

				requestAnimationFrame(animate);

				function animate(time) {
				    requestAnimationFrame(animate);
				    TWEEN.update(time);
				}
			}, delay);
		}

	});
});
p_scrollLink.defaultTime = 400;
p_scrollLink.defaultDelayTime = 0;
p_scrollLink.defaultTopOffset = 20;
p_scrollLink.defaultSideOffset = 20;
// p_scrollLink.fps = 42;










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




