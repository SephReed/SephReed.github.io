


console.log("Hey you! \n\n"+
	"I'm glad you came here to check things out.  Below you'll probably see a lot of console Jargon.  "+
	"This is because this page is running on my own js frontend which I'm still developing.  "+
	"Almost everything you see here is made from scratch.  "+
	"And what isn't made from scratch is so basic I'm likely to replace it just for the sake of being able to "+
	"say that absolutely everything is.\n\n"+
	"Anyways, thanks for coming to check it out!\n"+
	"-Seph\n"+
	"\n"+
	"P.S. WebGL may show some warnings below.  It's very new tech and the things become deprecated very quickly."
);






var currentlyShown = null;




PINE.ready(function () {
	var view = El.byID("portfolio_view");
	view.addEventListener("viewChange", function() {
		smoothScroll(view);
	});

	var popin = El.byID("popin_wrapper");
	var requestedFrame;
	document.addEventListener("scroll", function(event) {
		// console.log(event);
		if(requestedFrame == undefined) {
			requestedFrame = window.requestAnimationFrame(function() {
				if(window.scrollY > 900)
					popin.classList.remove("offscreen");
				else
					popin.classList.add("offscreen");

				requestedFrame = undefined;
			})
		}
	})
})

