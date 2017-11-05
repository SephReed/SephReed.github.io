
var painter, canvas;
var lastX, lastY, x, y;
var dx = 0, dy = 0;
var cracks = [];
var hue = 0.1;

document.addEventListener("DOMContentLoaded", function (){
	// var controlPanel = INKY.getControlPanel();
	// document.body.appendChild(controlPanel.domNode);

	canvas = document.createElement("canvas");
	canvas.style.zIndex = 1000;
	canvas.style.pointerEvents = "none";
	canvas.style.position = "fixed";
	canvas.style.top = "0px";
	canvas.style.left = "0px";
	canvas.style.height = "100%";
	canvas.style.width = "100%";

	painter = canvas.getContext("2d");
	INKY.setPainter(painter);
	INKY.colorModes.rainbow.hueChange = 0.77;
	

	document.body.appendChild(canvas);
	canvas.height = canvas.offsetHeight;
	canvas.width = canvas.offsetWidth;



	document.body.addEventListener("mousedown", function(event) {
		console.log(event);
		x = event.clientX;
		y = event.clientY;

		
		startCrack(x, y, hue, 1);
		hue += .3;
	});

	var startCrack = function(x, y, hue, depth) {
		if(depth > 4)
			return;

		var count = 5-depth;
		for(var i = 0; i < count; i++) {
			var dist = (Math.random() * 300/depth) + 10;
			var dir = Math.random() * 2/count * Math.PI + ((i/count)*2*Math.PI);

			var crack = {};
			crack.lastX = crack.x = x;
			crack.lastY = crack.y = y;
			crack.endX = x + (Math.cos(dir) * dist);
			crack.endY = y + (Math.sin(dir) * dist);
			crack.dx = (crack.endX - crack.x);
			crack.slope = (crack.endY - crack.y)/crack.dx;
			crack.numFrames = dist/50;
			crack.dxPerFrame = crack.dx/crack.numFrames;
			crack.depth = depth + 1;
			crack.hue = hue;
			cracks.push(crack);
		}
	}



	var drawCracks = function() {

		for(var i = 0; i < cracks.length; i++) {
			var crack = cracks[i];

			painter.beginPath();
			painter.moveTo(crack.lastX, crack.lastY);

			var xNow = crack.lastX + crack.dxPerFrame;
			var yNow = crack.lastY + (crack.dxPerFrame * crack.slope);

			painter.lineTo(xNow, yNow);

			INKY.setColor(INKY.HSV_to_RGB(crack.hue, .75, 1));
			// painter.lineWidth = 2;
			painter.stroke();

			crack.lastX = xNow;
			crack.lastY = yNow;

			crack.numFrames--;
			crack.hue += .05;

			if(crack.numFrames <= 0) {
				startCrack(xNow, yNow, crack.hue, crack.depth);
				cracks.splice(i, 1);
				i--;
			}
		}
		window.requestAnimationFrame(drawCracks);
	}
	drawCracks();
	




	
	var fadeOut = function(){
		var imgData = painter.getImageData(0, 0, canvas.width, canvas.height);
		painter.clearRect(0, 0, canvas.width, canvas.height);
	
		for(var i = 0; i < imgData.data.length; i++) {
			var val = imgData.data[i];

			if(val > 0)
				imgData.data[i] = Math.max(val - 10, 0);
		}

		painter.putImageData(imgData, 0, 0)

		window.requestAnimationFrame(fadeOut);
	}
	fadeOut();
});