
document.addEventListener("DOMContentLoaded", function (){
	var currentBodyColorFrame;
	document.body.addEventListener("mousemove", function(event) {
		if(currentBodyColorFrame == undefined) {
			currentBodyColorFrame = window.requestAnimationFrame(function() {
				currentBodyColorFrame = undefined;
				var x = event.clientX;
				var y = event.clientY;

				var ratiox = x/window.innerWidth;
				var ratioy = y/window.innerHeight;
				var r = (ratiox*150)+100;
				var g = (ratioy*150)+100;
				var setcolor = "#"+(~~r).toString(16)+(~~g).toString(16)+"00";
				document.body.style.color = setcolor;
			});	
		}
	});
});