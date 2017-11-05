
CIRCLE_SIZE = 15;

function HSV_to_RGB(hue, saturation, value) {
	if(hue < 1)
		hue += 1;
	hue %= 1;

	var rgb;
	if(saturation == 0 || value == 0)
		rgb = [value, value, value];  //used car salesman rick jim here!

	else {
		rgb = [];
		var oneThird = 1/3;
		var twoThirds = 2/3;

		var rgbPos = []
		rgbPos[0] = ((hue+oneThird)%1)/twoThirds;  //at 0, red pos = 0.5 or peak of sine wave
		rgbPos[1] = hue/twoThirds;  //at .3333, green pos = 0.5 or peak of sine wave
		rgbPos[2] = (hue-oneThird)/twoThirds;  //at .6666, blue pos = 0.5 or peak of sine wave

		for(var i in rgbPos) {
			var pos = rgbPos[i];
			if(pos > 0 && pos < 1)
				rgb[i] = Math.sin(pos*Math.PI) * value;
			else
				rgb[i] = 0;
		}


		if(saturation < 1) {
			var max = Math.max(Math.max(rgb[0], rgb[1]), rgb[2]);

			for(var i in rgb)
				rgb[i] += (max-rgb[i]) * (1-saturation);
		}
	}

	for(var i in rgb) 
		rgb[i] *= 256;

	return rgb;
}

function setColor(painter, r, g, b, a) {
	if(a !== undefined){
		painter.strokeStyle = "rgba("+r+", "+g+", "+b+", "+a+")";
		painter.fillStyle = "rgba("+r+", "+g+", "+b+", "+a+")";
	}
	else {
		painter.strokeStyle = "rgb("+r+", "+g+", "+b+")";
		painter.fillStyle = "rgb("+r+", "+g+", "+b+")";
	}

	if(painter.setStrokeColor) {
		painter.setStrokeColor(r, g, b, a||0);
		painter.setFillColor(r, g, b, a||0);
	}

}





var painter, canvas;


var hue = .3;

document.addEventListener("DOMContentLoaded", function (){
	canvas = document.createElement("canvas");
	canvas.style.zIndex = 1000;
	canvas.style.pointerEvents = "none";
	canvas.style.position = "fixed";
	canvas.style.top = "0px";
	canvas.style.left = "0px";
	canvas.style.height = "100%";
	canvas.style.width = "100%";

	painter = canvas.getContext("2d");

	

	document.body.appendChild(canvas);
	canvas.height = canvas.offsetHeight;
	canvas.width = canvas.offsetWidth;

	var lastX = 0;
	var lastY = 0;
	var timedOut = false;

	var bubbles = [];
	var hue = 0;

	document.body.addEventListener("mousedown", function(event) {
		console.log(event);

		var x = event.clientX;
		var y = event.clientY;

		var bubbleTime = !timedOut;

		if(!bubbleTime) {
			var dx = Math.abs(x-lastX);
			var dy = Math.abs(y-lastY);
			bubbleTime = (dx + dy) > 50;
		}

		if(bubbleTime) {
			hue += .16666;

			var bubble = {};
			bubble.r = (Math.random()*15) + 5;
			bubble.x = x;
			bubble.y = y;
			bubble.dyt = 4;
			bubble.dxt = 0;
			bubble.rgb = HSV_to_RGB(hue, .25, 1);

			bubbles.push(bubble);

			timedOut = true;
			window.setTimeout(function() { 
				timedOut = false;
			},
			500)
		}

		if(drawBubblesRequest == undefined)
			drawBubbles();
	});



	var drawBubblesRequest;
	var drawBubbles = function() {
		painter.clearRect(0, 0, canvas.width, canvas.height);
		for(var i = 0; i < bubbles.length; i++) {
			var bubble = bubbles[i];

			var rgb = bubble.rgb;
			setColor(painter, rgb[0], rgb[1], rgb[2]);
			painter.beginPath();
			painter.arc(bubble.x, ~~bubble.y, bubble.r, 0, Math.PI * 2);

			painter.globalAlpha = 1;
			// painter.lineWidth = 2;
			painter.stroke();

			painter.globalAlpha = 0.4;
			painter.fill();

			bubble.y -= bubble.dyt;

			if(bubble.y < -30) {
				bubbles.splice(i, 1);
				i--;
			}

			else {
				// bubble.dyt += .05;
				bubble.dxt += (Math.random() * 0.25)-.07;
				bubble.x += bubble.dxt
				// bubble.dxt = Math.max(-6, Math.min(bubble.dxt, 50));
			}
		}

		if(bubbles.length)
			drawBubblesRequest = window.requestAnimationFrame(drawBubbles);

		else {
			drawBubblesRequest = undefined;
			painter.clearRect(0, 0, canvas.width, canvas.height);
		}
		
	}


});






