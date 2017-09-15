/************************************************************
*  Written from scratch by Seph Reed (legal name: Scott Jaromin)
*
*  No particular function used, but, in short, the steps are:
*  	1. find all branch points and paths (only ever done once)
*  	2. reduce the set to only include branch points that can be
*		passed through on way from any two nodes (only start and end used so far)
*	3. within the set of potential paths for this routing, find and compare all 
*		the options
*
*	Further details below about how each function operates, above each function declaration.
*	Overall, this approach values information over speed
*	If the objective was speed, the approach would have been just step #3 above
*		with golf rules (shortest current path goes)
*
*	P.S. 
*		I have long had dreams of making a mapping program for travelers (!commuters).
*		Much of this algorithm was designed around being usable for this future project
*		with path finding around multiple factors.
*		(places to sleep, things to see, road safety, town cultures, climate, wildlife, etc.)
*
*	Live Demo:  SephReed.github.io/Challenges/SparkCognitionMaze/index.html
************************************************************/





NUM_LIVES = 3;


MazeDecoder = {};
MazeDecoder.class = {};



/************************************************************
*  class - Maze
*  (overall class holding all data for each maze)
************************************************************/

//create maze from text
MazeDecoder.class.Maze = function(loadable) {
	var THIS = this;
	var tmp = loadable.split('-');
	var dimensions = U.skinAndConvertToInts(tmp[0]);
	var blockValues = U.skinAndConvertToInts(tmp[1]);

	THIS.raster = [];
	THIS.height = dimensions[0];
	THIS.width = dimensions[1];
	for(var row = 0; row < THIS.height; row++) {
		THIS.raster[row] = [];
		for(var col = 0; col < THIS.width; col++) {
			var blockNum = (row*THIS.width + col);
			var blockValue;
			if (blockNum < blockValues.length)
				blockValue = blockValues[blockNum]
			else {
				console.error("Values given for blocks do not meet predefined dimensions.  Defaulting to empty block.");
				blockValue = 0;
			}

			var block = THIS.raster[row][col] = new MazeDecoder.class.Block(blockValue, row, col);


			//error check that only one of all single use values (START and END) type blocks exist
			//also record each for later use.
			Block.oneUseValues.forEach(function(value){
				if(block.has(Block[value])) {
					var attributeName = value.toLowerCase()+"Block"
					if(THIS[attributeName] == undefined)
						THIS[attributeName] = block;

					else console.error("Multiple "+value+" blocks found.  Maze out of spec (for now)");
				}
			});		
		}
	}
}



/************************************************************
*  class - Maze - Draw Functions
*  (for making gui)
************************************************************/

var BLOCK_PX_SIZE = 24;
var textOffsetX = (BLOCK_PX_SIZE/2)-4;
var textOffsetY = (BLOCK_PX_SIZE/2)+4;

//returns a drawing of the maze
MazeDecoder.class.Maze.prototype.getCanvas = function() {
	if(this.canvas == undefined) {
		var canvas = this.canvas = document.createElement("canvas");
		canvas.width = this.width * BLOCK_PX_SIZE;
		canvas.height = this.height * BLOCK_PX_SIZE;

		for(var row = 0; row < this.height; row++) {
			for(var col = 0; col < this.width; col++) {
				this.raster[row][col].drawSelf(canvas);
			}	
		}
	}
	return this.canvas;
};


//draws the lines connecting branch points
function drawPath(path, canvas, color) {
	var painter = canvas.getContext("2d");
	painter.beginPath();
	painter.strokeStyle =  color || '#FAFAFA';

	var offset = BLOCK_PX_SIZE/2;

	var start = path.ends[0];
	var startX = (start.col*BLOCK_PX_SIZE) + offset;
	var startY = (start.row*BLOCK_PX_SIZE) + offset;
	
	var end = path.ends[1];
	var endX = (end.col*BLOCK_PX_SIZE) + offset;
	var endY = (end.row*BLOCK_PX_SIZE) + offset;

	
	painter.moveTo(startX, startY);
	painter.lineTo(endX, endY);

	painter.stroke();
}


//draws the boxes at branch points
var boxSize = ~~(0.25 * BLOCK_PX_SIZE)
function drawNode(node, canvas, color) {
	var painter = canvas.getContext("2d");
	painter.beginPath();
	painter.strokeStyle =  color || '#FAFAFA';


	var offset = BLOCK_PX_SIZE/2 - boxSize/2;
	var startX = (node.col*BLOCK_PX_SIZE) + offset;
	var startY = (node.row*BLOCK_PX_SIZE) + offset;

	painter.strokeRect(startX, startY, boxSize, boxSize);
}














/************************************************************
*  class - Maze - Path Finding
*  (following functions are in order)
************************************************************/



MazeDecoder.class.Maze.prototype.analyzePaths = function() {
	var THIS = this;
	THIS.exploreFromNode(THIS.startBlock);
	var routeGraph = THIS.findRoutes(THIS.startBlock, THIS.endBlock);

	return routeGraph.promise.then(function(){
		var fastestRoute = routeGraph.findFastestRoute();

		//hack to get around forced async nature of Promises and call stack queuing issues
		window.setTimeout(function(){
			routeGraph.paths.forEach(function(path) {
				drawPath(path, THIS.canvas, "#F03");
			});

			routeGraph.nodes.forEach(function(node) {
				if(node.has(Block.START) == false && node.has(Block.END) == false)
					drawNode(node, THIS.canvas, "#F039");
			});

			fastestRoute.paths.forEach(function(path) {
				drawPath(path, THIS.canvas, "#3F3");
			});
		}, 0);

		return MazeDecoder.stepByStep(fastestRoute);
	})
}


//first, for every exit from a node (starting at start), find all the paths to the
//next branching point
MazeDecoder.class.Maze.prototype.exploreFromNode = function(node) {
	var THIS = this;
	node.getExits().forEach(function(dirEnum) {
		if(node.paths[dirEnum] == undefined) { 
			var path = THIS.getPathInDirection(node, dirEnum);
			node.paths[dirEnum] = path
			drawPath(path, THIS.canvas);
			var nextNode = path.ends[1];
			THIS.exploreFromNode(nextNode);
		}
	});

}



//when getting a path in a direction from a block, iterate through
//each step until you reach the next branch node
MazeDecoder.class.Maze.prototype.getPathInDirection = function(fromBlock, dirEnum) {
	if(fromBlock.paths[dirEnum] != undefined)
		return fromBlock.paths[dirEnum];

	var lastDir = dirEnum, 
		ptr = fromBlock;
	
	var path = new MazeDecoder.class.Path(fromBlock);
	fromBlock.paths[dirEnum] = path;

	while(ptr) {
		ptr = this.getBlockInDirection(ptr, lastDir);
		exits = ptr.getExitsExcept(Block.reverse(lastDir));

		if(exits.length != 1 || ptr.has(Block.START) || ptr.has(Block.END)) {
			path.ends.push(ptr);
			ptr.paths[Block.reverse(lastDir)] = path;
			if(exits.length == 0)
				ptr.isDeadEnd = true;
			ptr = undefined;
		}
		else {
			path.steps.push(ptr);
			if(ptr.has(Block.MINE))
				path.mines++;

			lastDir = exits[0];
		}
	}

	return path;
}


//getting a block in a direction from another block is used
//by the path finder above
MazeDecoder.class.Maze.prototype.getBlockInDirection = function(fromBlock, dirEnum) {
	if(Block.directions.indexOf(dirEnum) == -1)
		console.error("Must use a direction type Block enum")

	else {
		var targetRow = fromBlock.row;
		var targetCol = fromBlock.col;

		switch (dirEnum) {
			case Block.UP:
				targetRow--; break;
			case Block.RIGHT:
				targetCol++; break;
			case Block.DOWN:
				targetRow++; break;
			case Block.LEFT:
				targetCol--; break;
		}

		if(targetRow < 0 || targetRow >= this.height
		|| targetCol[1] < 0 || targetCol >= this.width)
			console.error("Block has path leading out of maze")

		else return this.raster[targetRow][targetCol];
	}
};



//find routes initiates a route graph, which uses the function below
MazeDecoder.class.Maze.prototype.findRoutes = function(start, end) {
	return new MazeDecoder.class.RouteGraph(this, start, end);
}




//has useful path goes through all known paths, checking if
//they lead to dead ends or potentially the maze end.
//recursive, iterates through all paths checking for any leads to end
//operates on promises in order to work around maze looping issues
MazeDecoder.class.Maze.prototype.hasUsefulPath = function(checkMe, end, routeGraph, lastNode) {
	var THIS = this;

	var ID = routeGraph.ID;
	var nextNodePromises = [];
	if(checkMe.routes[ID] == undefined) {
		var nodeIsUseful;
		
		checkMe.routes[ID] = new MazeDecoder.class.RouteToken(ID);


		if(checkMe == end)
			nodeIsUseful = true;

		else if(checkMe.isDeadEnd)
			nodeIsUseful = false;

		else {
			checkMe.paths.forEach(function(path){
		
				if(path.ends.indexOf(lastNode) != -1)
					return;

				if(path.routes[ID] == undefined) {
					let route = path.routes[ID] = new MazeDecoder.class.RouteToken(ID);
					var nextNode = path.ends.find(function(anEnd){
						return anEnd != checkMe;
					});

					var promiseNode;
					if(nextNode.routes[ID] == undefined) 
						promiseNode = THIS.hasUsefulPath(nextNode, end, routeGraph, checkMe);
				
					else
						promiseNode = nextNode.routes[ID].getIsUseful();

					nextNodePromises.push(promiseNode);
					promiseNode.then(function(isUseful) {
						route.setIsUseful(isUseful);

						nodeIsUseful = nodeIsUseful || isUseful;
						if(isUseful)
							routeGraph.paths.push(path);

						//a path is useful as soon as it is proven to connect to any
						//other useful path
						if(nodeIsUseful == true)
							checkMe.routes[ID].setIsUseful(nodeIsUseful);
					})	
				}
			});
		}

		//in the case of non useful, all paths must first return false
		Promise.all(nextNodePromises).then(function(){
			checkMe.routes[ID].setIsUseful(nodeIsUseful);
		});


		checkMe.routes[ID].getIsUseful().then(function(){
			if(nodeIsUseful)
				routeGraph.nodes.push(checkMe);
		})
	}

	
	return checkMe.routes[ID].getIsUseful();
}




//simple function which turns a route into a series of steps for output
MazeDecoder.stepByStep = function(route) {
	var out = [];
	var nodes = route.nodes.slice().reverse();
	var paths = route.paths.slice();

	var lastBlock = nodes.pop();

	route.paths.forEach(function(path) {
		var steps = path.steps.slice();
		if(path.ends[1] == lastBlock)
			steps.reverse();

		steps.forEach(function(block){
			var dirEnum = lastBlock.getDirEnum(block);
			out.push(Block.decode(dirEnum));
			lastBlock = block;
		});

		var block = nodes.pop();
		var dirEnum = lastBlock.getDirEnum(block);
		out.push(Block.decode(dirEnum));
		lastBlock = block;
	})
	return out;
}








/************************************************************
*  class - Path
*  (a basic connection set)
************************************************************/

MazeDecoder.class.Path = function(start) {
	this.ends = []
	this.ends.push(start);
	this.steps = [];
	this.mines = 0;
	this.routes = {};
}








/************************************************************
*  class - Route Graph
*  (an collect all for info gathered while finding routes)
************************************************************/


var ROUTE_ID_ITERATOR = -1;
MazeDecoder.class.RouteGraph = function(maze, start, end) {
	var THIS = this;
	THIS.maze = maze;
	THIS.start = start;
	THIS.end = end;
	THIS.nodes = [];
	THIS.paths = [];
	THIS.tentativePaths = [];
	THIS.ID = ROUTE_ID_ITERATOR++;

	THIS.promise = maze.hasUsefulPath(start, end, THIS);
}




//find fastest route branches out along the known potentials
//if it loops back on itself, the path is no good
//if it reaches the end, it returns an option
//all options are compared and reduced until the best possible option is output
//technically, this function could be used alone to solve this problem, although
//this function is much heavier than "hasUsefulPath", which narrows down the amount of options
var NOPE = "nope";
MazeDecoder.class.RouteGraph.prototype.findFastestRoute = function(ptr, fullRoute) {

	var THIS = this;
	ptr = ptr || THIS.start;
	fullRoute = fullRoute || [];

	if(fullRoute.indexOf(ptr) != -1)
		return NOPE;

	if(ptr == THIS.end) {
		fullRoute.push(ptr);
		return {
			length : 0,
			mines : 0,
			paths : [],
			nodes : fullRoute,
		}
	}

	var options = ptr.paths.filter(function(path){
		var notBackwards = path.ends.indexOf(U.getLast(fullRoute)) == -1;
		return path.routes[THIS.ID].isUseful && notBackwards;
	})
	.map(function(path){
		var nextNode = path.ends.find(function(anEnd){
			return anEnd != ptr;
		});

		var nextRoute = fullRoute.slice();
		nextRoute.push(ptr);

		// drawPath(path, THIS.maze.canvas, "#323");

		var option = THIS.findFastestRoute(nextNode, nextRoute);
		if(option != NOPE) {
			option.mines += path.mines;
			option.length += path.steps.length + 1;
			option.paths.unshift(path);

			if(option.mines > NUM_LIVES)
				option = NOPE;
		}
		return option;
	})

	// console.log(options);
	if(options.length) {
		return options.reduce(function(optionA, optionB) {
			if(optionA == NOPE) return optionB;
			else if(optionB == NOPE) return optionA;

			return optionA.length < optionB.length ? optionA : optionB;
		});	
	}
	else return NOPE;
	


}






/************************************************************
*  class - Route Token
*  (used as a "finger" to keep track of whether or not a 
*	spot has been touched)
************************************************************/


MazeDecoder.class.RouteToken = function(ID, isUseful) {
	this.ID = ID;
	this.resolves = [];
	this.setIsUseful(isUseful);
}

MazeDecoder.class.RouteToken.prototype.setIsUseful = function(value) {
	this.isUseful = value;

	this.resolves.forEach(function(fn) {
		fn(value);
	});
}

MazeDecoder.class.RouteToken.prototype.getIsUseful = function() {
	var THIS = this;
	if(THIS.isUseful !== undefined)
		return Promise.resolve(THIS.isUseful)
	 
	return new Promise(function(resolve){
		THIS.resolves.push(resolve);
	})
}









/**********************
*  Enum - Block
*  (used for all the basic values a block can have)
**********************/


MazeDecoder.enum = {};
var Block = MazeDecoder.enum.Block = {};
Block.UP = 1;
Block.RIGHT = 2;
Block.DOWN = 4;
Block.LEFT = 8;
Block.START = 16;
Block.END = 32;
Block.MINE = 64;
Block.directions = [Block.UP, Block.RIGHT, Block.DOWN, Block.LEFT];
Block.oneUseValues = ["START", "END"]
Block.reverse = function(dirEnum) {
	switch (dirEnum) {
		case Block.UP:
			return Block.DOWN;

		case Block.RIGHT:
			return Block.LEFT;

		case Block.DOWN:
			return Block.UP;

		case Block.LEFT:
			return Block.RIGHT;
	}
}
Block.decode = function(dirEnum){
	switch (dirEnum) {
		case Block.UP:
			return "up";

		case Block.RIGHT:
			return "left";

		case Block.DOWN:
			return "down";

		case Block.LEFT:
			return "right";
	}
}












/**********************
*  Class - Block
*  (represents a block in the maze)
**********************/


MazeDecoder.class.Block = function(value, row, col) {
	this.value = value;
	this.row = row;
	this.col = col;
	this.paths = [];
	this.routes = [];
	this.routeListeners = [];
}

//this was the bitwise operation asked for
MazeDecoder.class.Block.prototype.has = function(blockEnum) {
	return (this.value & blockEnum) != 0;
};


//returns list of all exit directions
MazeDecoder.class.Block.prototype.getExits = function() {
	var THIS = this;
	return Block.directions.filter(function(dirEnum) {
		return THIS.has(dirEnum);
	});
};


//returns list of all exit directions minus some
MazeDecoder.class.Block.prototype.getExitsExcept = function(dontInclude) {
	if(typeof dontInclude == "number")
		dontInclude = [dontInclude]

	return this.getExits().filter(function(dirEnum) {
		return dontInclude.indexOf(dirEnum) == -1;
	});
}


//finds the direction to another block (no error checking)
MazeDecoder.class.Block.prototype.getDirEnum = function(toMe) {
	if(this.row > toMe.row)
		return Block.UP;

	else if(this.col > toMe.col)
		return Block.RIGHT;

	else if(this.row < toMe.row)
		return Block.DOWN;

	else if(this.col < toMe.col)
		return Block.LEFT;
}



//basic funtcion for drawing maze and attributes
MazeDecoder.class.Block.prototype.drawSelf = function(canvas) {
	var x = this.col*BLOCK_PX_SIZE;
	var y = this.row*BLOCK_PX_SIZE;

	var painter = canvas.getContext('2d');
	painter.beginPath();
	painter.strokeStyle = '#0B8';
	painter.moveTo(x, y);

	if(this.has(Block.UP))
		painter.moveTo(x+BLOCK_PX_SIZE, y);
	else
		painter.lineTo(x+BLOCK_PX_SIZE, y);


	if(this.has(Block.RIGHT))
		painter.moveTo(x+BLOCK_PX_SIZE, y+BLOCK_PX_SIZE);
	else
		painter.lineTo(x+BLOCK_PX_SIZE, y+BLOCK_PX_SIZE);


	if(this.has(Block.DOWN))
		painter.moveTo(x, y+BLOCK_PX_SIZE);
	else
		painter.lineTo(x, y+BLOCK_PX_SIZE);


	if(this.has(Block.LEFT))
		painter.moveTo(x, y);
	else
		painter.lineTo(x, y);

	painter.stroke();


	var textX = x + textOffsetX;
	var textY = y + textOffsetY;

	painter.fillStyle = "#3ca106";
	if(this.has(Block.START))
		painter.fillText('S', textX, textY);

	if(this.has(Block.END))
		painter.fillText('E', textX, textY);

	painter.fillStyle = "#a10633";
	if(this.has(Block.MINE))
		painter.fillText('*', textX, textY);
}










/**********************
*  Utilities
*  (basic useful functions)
**********************/


U = {};
U.getLast = function(array){
	return array[array.length-1];
}


U.skinAndConvertToInts = function(bracketedNumberString) {
	return bracketedNumberString.substr(1, bracketedNumberString.length-2)
	.split(',')
	.map(function(num){  return parseInt(num); });
}





