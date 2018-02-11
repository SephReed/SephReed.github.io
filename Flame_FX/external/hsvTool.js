hsvToRgb = function(hue, saturation, value) {
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
		rgb[i] = Math.floor(rgb[i] * 255);

	return {
		r: rgb[0],
		g: rgb[1],
		b: rgb[2],
	};
}