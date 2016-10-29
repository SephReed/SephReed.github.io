
var ESVG = EASY_SVG = {};

var Point = ESVG.Point = function(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.clone = function() {
	return new Point(this.x, this.y);
}

Point.prototype.createPolarPoint = function(rotation, distance) {
	var dx = Math.cos(rotation) * distance;
	var dy = Math.sin(rotation) * distance;

	var x = this.x - dx;
	var y = this.y - dy;

	return new Point(x, y);
}

Point.prototype.createTranslatePoint = function(dx, dy) {
	return new Point(this.x + dx, this.y + dy);
};


Point.prototype.midpoint = function(toMe) {
	var x = ((toMe.x - this.x)/2 + this.x);    //(3 - 1)/2 + 1 = 2
	var y = ((toMe.y - this.y)/2 + this.y);

	return new Point(x, y);
}


Point.prototype.distance = function(toMe) {
	var dx = this.x - toMe.x;
	var dy = this.y - toMe.y;
	return Math.sqrt((dx*dx)+(dy*dy));
}


Point.prototype.angle = function(toMe) {
	var dx = toMe.x - this.x;
	var dy = toMe.y - this.y;

	var out;

	if(dx == 0)
		out = Math.PI/2;
	else
	 	out = Math.atan(dy/dx);

	if(dx > 0 && dy < 0)
		out += 2 * Math.PI;
	else if (dx < 0 || (dx <= 0 && dy < 0))
		out += Math.PI;

	return out;
}







ESVG.Path = function(startPos) {
	var path = this;

	path.steps = [];

	if(startPos !== undefined)
		path.start(startPos)

}




ESVG.Path.prototype.addCmdNode = function(forward) {
	var path = this;

	var out = {};
	out.lastStep = path.tailStep;

	if(out.lastStep)
		out.lastStep.nextStep = out;

	out.forward = forward

	if(path.headStep == undefined)
		path.headStep = out;

	path.tailStep = out;

	path.steps.push(out);

	return out;
}





ESVG.Path.prototype.start = function(startPos) {
	var path = this;
		//
	path.addCmdNode(function(lastStep) {
		var out = {};
		out.code = "M "+startPos.x+" "+startPos.y+" ";
		path.startPos = out.endPos = startPos.clone();
		return out;
	});
	return path;
}



ESVG.Path.prototype.line = function(endPos) {
	var path = this;
		//
	var cmd = path.addCmdNode(function(lastStep) {
		console.log("lastStep", lastStep);
		var startPos = lastStep.endPos;

		// cmd.reverse = function(reverseEnd) {
		// 	var dx = startPos.x - cmd.endPos.x;
		// 	var dy = startPos.y - cmd.endPos.y;

		// 	return "l "+dx+" "+dy+" ";
		// }

		var out = {};
		out.code = "L "+endPos.x+" "+endPos.y+" ";
		out.endPos = endPos.clone();
		out.endAngle = startPos.angle(endPos);
		return out;
	});

	return path;
}



ESVG.Path.prototype.sag = function(sagAmount, endPos) {
	var path = this;
		//

	var getQ = function(startPos, endPos, sagAmount) {
		var droopQ = startPos.midpoint(endPos);
		var dist = startPos.distance(endPos);	
		droopQ.y += (sagAmount * dist);
		return droopQ;
	}

	var cmd = path.addCmdNode(function(lastStep) {
		var startPos = lastStep.endPos;

		
		
		var droopQ = getQ(startPos, endPos, sagAmount);
		
		var step = {};		
			//
		step.code = "Q "
			+droopQ.x+" "+droopQ.y+", "
			+endPos.x+" "+endPos.y+" ";

		step.endPos = endPos.clone();
		step.endAngle = droopQ.angle(endPos);

		cmd.reverseParallel = function(lastStep, width) {
			var out = {};
			out.endAngle = droopQ.angle(startPos);

			var rightToLeft = lastStep.startPos.x > startPos.x;

			var cap90 = out.endAngle;
			// if(rightToLeft)
				cap90 -= Math.PI/2;
			// else
				// cap90 += Math.PI/2;

			out.endPos = startPos.createPolarPoint(cap90, width)

			var qPos = getQ(startPos, endPos, sagAmount);
			if(rightToLeft)
				qPos.y -= width;
			else
				qPos.y += width;

			out.code = "Q "
				+qPos.x+" "+qPos.y+", "
				+out.endPos.x+" "+out.endPos.y+" ";
			return out;
		}

		return step;
	});

	
	return path;
}


ESVG.Path.prototype.turn = function(degrees, radius) {
	var path = this;
		//
	var cmd = path.addCmdNode(function(lastStep) {

		var deg;

		if(typeof degrees == "function")
			deg = degrees.call(path, lastStep);

		else
			deg = degrees;

		var out = {};

		var startPos = out.startPos = lastStep.endPos;
		var startAngle = lastStep.endAngle;

		var towardsCenter = startAngle;
		var sweepFlag = 0;

		console.log(deg)
		if(deg > 0 )
			towardsCenter += Math.PI/2;
		else {
			towardsCenter -= Math.PI/2;
			sweepFlag = 1;
		}


		var centerPoint = startPos.createPolarPoint(towardsCenter, radius);

		var dRad = (deg-180)/360 * 2 * Math.PI;
		var endRad =  towardsCenter - dRad;
		var endPos = centerPoint.createPolarPoint(endRad, radius);


		
		out.code = "A "+radius+" "+radius+" 0 0 "+sweepFlag+" "+endPos.x+" "+endPos.y+" ";
		out.endAngle = endRad + Math.PI/2;				
		out.endPos = endPos;

		return out;
	});
	return path;
}

// ESVG.Path.prototype.reverseRepeat = function(stepNum) {
// 	var path = this;
// 		//
// 	var cmd = path.addCmdNode(function(lastStep) {
// 		var step = path.steps[stepNum-1];
// 		console.log(step);

// 		cmd.reverseRepeat = step.repeat;
// 		cmd.repeat = step.reverseRepeat;

// 		return cmd.repeat(lastStep);
// 	});
// 	return path;
// }

ESVG.Path.prototype.returnToStart = function() {
	var path = this;
		//
	var cmd = path.addCmdNode(function(lastStep) {
		out = {};
		out.code = "Z ";
		out.endAngle = lastStep.endPos.angle(path.startPos);
		out.endPos = path.startPos;
		return out;
	});
	return path;
}

ESVG.Path.prototype.reverseParallel = function(width) {
	var path = this;

	// var cmd = path.addCmdNode(function(lastStep) {
		// var out = {};

		var ptr = path.tailStep;

		var degreeTest = function(lastStep) {
			// if(this.startPos.x > lastStep.endPos.x || this.startPos.y > lastStep.endPos.y)
			// 	return -180;

			// else return 180;
			return 180;
		}

		path.turn(degreeTest, width/2);

		console.log("path", path);

		for( ;ptr != path.headStep; ptr = ptr.lastStep) {
			(function (ptr) {
				path.addCmdNode(function(lastStep) {
					return ptr.reverseParallel(lastStep, width);
				});
			})(ptr);
		}

		path.turn(degreeTest, width/2);


	// 	out.code = "";
	// 	out.endAngle = lastStep.endAngle
	// 	out.endPos = lastStep.endPos;
	// 	return out;
	// });
	return path;
}





ESVG.Path.prototype.code = function() {
	var path = this;

	var out = '';
	var result;
	for(var ptr = path.headStep; ptr != undefined; ptr = ptr.nextStep) {
		result = ptr.forward(result);
		out += result.code;
	}
	return out;
}






var start = new Point(1, 1);
var end = new Point(3, 3);

var test = new ESVG.Path(start);
test.sag(10, end).reverseParallel(5);

console.log(test.code());
