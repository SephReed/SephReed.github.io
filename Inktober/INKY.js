window.INKY = {};


INKY.setPainter = function(painter) {
	this.painter = painter;
}

INKY.setColor = function(rOrRgb, g, b, a) {
	INKY.setColorForPainter(this.painter, rOrRgb, g, b, a);
}

INKY.setColorForPainter = function(painter, rOrRgb, g, b, a) {
	var r;
	if(typeof rOrRgb == "object"){
		r = rOrRgb[0];
		g = rOrRgb[1];
		b = rOrRgb[2];
		a = rOrRgb[3];
	}
	else r = rOrRgb;

	if(a !== undefined){
		painter.strokeStyle = "rgba("+r+", "+g+", "+b+", "+a+")";
		painter.fillStyle = "rgba("+r+", "+g+", "+b+", "+a+")";
	}
	else {
		painter.strokeStyle = "rgb("+r+", "+g+", "+b+")";
		painter.fillStyle = "rgb("+r+", "+g+", "+b+")";
	}
}

// INKY.clearAll = function() {

// }


INKY.HSV_to_RGB = function(hue, saturation, value) {
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

INKY.getNextColor = function() {
	return INKY.colorModes.current.getNextColor();
}




INKY.getControlPanel = function() {
	if(INKY.controlPanel == undefined)
		INKY.controlPanel = new INKY.class.ControlPanel();

	return INKY.controlPanel;
}





INKY.class = {};

var ControlPanel = INKY.class.ControlPanel = function() {
	var THIS = this;
	THIS.domNode = document.createElement("InkyControlPanel");

	var showTab = document.createElement("showTab");
	var isHidden = true;
	showTab.addEventListener("click", function(){
		if(isHidden)
			THIS.domNode.style.left = (document.body.offsetWidth - THIS.domNode.offsetWidth) + "px";
		else
			THIS.domNode.style.left = "100%";

		isHidden = !isHidden
	});
	THIS.domNode.appendChild(showTab);

	var header = document.createElement("h1");
	header.textContent = "INKY Control Panel";
	THIS.domNode.appendChild(header);

	var colorModeChooser = document.createElement("select");
	for(var i = 0; i < INKY.colorModes.length; i++) {
		var addMe = document.createElement("option");
		addMe.value = INKY.colorModes[i].name;
		addMe.textContent = addMe.value;
		colorModeChooser.appendChild(addMe);
	}
	THIS.domNode.appendChild(colorModeChooser);

}





INKY.colorModes = {};

var rainbow = INKY.colorModes.current = INKY.colorModes.rainbow = {};
rainbow.hue = 0.1;
rainbow.saturation = 0.75;
rainbow.value = 1;
//
rainbow.hueChange = 0.01;
rainbow.saturationChange = 0;
rainbow.valueChange = 0;
//
rainbow.getNextColor = function() {
	var rgb = INKY.HSV_to_RGB(rainbow.hue, rainbow.saturation, rainbow.value);
	rainbow.hue += rainbow.hueChange;
	rainbow.saturation += rainbow.saturationChange;
	rainbow.value += rainbow.valueChange;
	return rgb;
}








