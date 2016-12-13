







PINE("[opacity]", function() {
	var initMe = this.domNode;
	var opacity = El.attr(initMe, "opacity") || "1.0";
	initMe.style.opacity = opacity;
});



PINE("[textAlign]", function(initMe) {
	var initMe = this.domNode;
	var align = El.attr(initMe, "textAlign") || "left";
	initMe.style.textAlign = align;
});


PINE("[fontSize]", function(initMe) {
	var initMe = this.domNode;
	var fsize = El.attr(initMe, "fontSize") || "inherit";
	initMe.style.fontSize = fsize;
});

PINE("[bgImage]", function(initMe) {
	var initMe = this.domNode;
	initMe.style.backgroundImage = El.attr(initMe, "bgImage");
});








PINE("[selectOnClick]", function() {
	var initMe = this.domNode;
	initMe.addEventListener("click", function(e) {
		selectNodeText(initMe);
	});
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











			




var p_scrollLink = PINE.createNeedle("[scrollLink]", function(scroller) {

	scroller.defaultTime = 400;
	scroller.defaultDelayTime = 0;
	scroller.defaultOffset = 20;

	scroller.addAttArg("target", ["scrollTarget", "target", "href"], "string");
	scroller.addAttArg("time", ["scollLinkTime", "scrollTime", "time"], "number");
	scroller.addAttArg("delay", ["scollLinkDelay", "scrollDelay", "delay"], "number");
	scroller.addAttArg("offset", ["scollLinkOffset", "scrollOffset", "offset"], "number");

	scroller.addInitFn(function() {
		var job = this;
		job.domNode.addEventListener("click", function(event) {
			event.preventDefault();
			job.FNS.scrollLinkTrigger();
		});
	});


	

	scroller.FNS.scrollLinkTrigger = function() {
		var job = this;
		var target_att = job.attArg.target;

		console.log(job)

		if(target_att.charAt(0) == '#')
			target_att = target_att.substring(1);

		var target = target_att ? El.byId(target_att) : null;


		if(target) {
			var ms = job.attArg.time || p_scrollLink.defaultTime;
			var delay = job.attArg.delay || p_scrollLink.defaultDelayTime;

			smoothScroll(target, ms, delay, p_scrollLink.defaultOffset);
		}

	}
});

// p_scrollLink.fps = 42;






function smoothScroll(target, ms, delay, offset) {
	if(target == undefined)
		return;

	if(ms === undefined)
		ms = 400;

	if(delay === undefined)
		delay = 0;

	if(offset === undefined)
		offset = 20;


	var coords = { x: window.scrollX, y: window.scrollY };

	var targetY = target.offsetTop - offset;
	var targetX = target.offsetLeft - offset;

	console.log("scrolling");


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









