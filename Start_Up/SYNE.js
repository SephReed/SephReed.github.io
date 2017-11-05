SYNE = {};
var S = SYNE.static = {};
S.PROJ = "Project";
S.MGMT = "Manager";
S.EMPL = "Employee";

S.SML = "small";
S.MED = "medium";
S.LRG = "large";


SYNE.seats = {}
SYNE.seats.inPlay = [];

SYNE.seats.width = 7;
SYNE.seats.height = 18;
SYNE.seats.groups = [];
SYNE.seats.groups[0] = {
	board: S.SML,
	x : 4,
	y : 7,
	spots : [
		[0, 0, S.PROJ],
		[1, 0],
		[2, 0],
		[3, 0],
		[4, 0],
		[0, 1, S.MGMT],
	]
}

SYNE.seats.groups[1] = {
	board: S.SML,
	x : 4,
	y : 76,
	spots : [
		[0, 0, S.PROJ],
		[1, 0, S.MGMT],
		[2, 0],
		[3, 0],
		[4, 0],
		[5, 0],
	]
}

SYNE.seats.groups[2] = {
	board: S.SML,
	x : 20,
	y : 33,
	spots : [
		[0, 0, S.PROJ],
		[1, 0],
		[2, 0],
		[0, 1, S.MGMT],
		[1, 1],
		[2, 1],
	]
}

SYNE.seats[S.SML] = [];
SYNE.seats[S.MED] = [];
SYNE.seats[S.LRG] = [];


for(var i = 0; i < SYNE.seats.groups.length; i++) {
	var group = SYNE.seats.groups[i];

	for(var s = 0; s < group.spots.length; s++) {
		var spot = group.spots[s];
		var x = group.x + (spot[0] * SYNE.seats.width);
		var y = group.y + (spot[1] * SYNE.seats.height);
		var type = spot[2];
		var rotation = spot[3] || 0;

		SYNE.seats[group.board].push({
			x: x, 
			y: y, 
			rotation: rotation, 
			type: type
		});
	}
}

// SYNE.seats.small = [
// 	{	x: SYNE.seats.groups[1].x, 
// 		y:8, 
// 		rotation: 0},
// 	{	x: SYNE.seats.groups[1].x + SYNE.seats.width, 
// 		y:8, 
// 		rotation: 0},
// 	{	x: SYNE.seats.groups[1].x + 2 * SYNE.seats.width, 
// 		y:8, 
// 		rotation: 0},
// 	{	x: SYNE.seats.groups[1].x + 3 * SYNE.seats.width, 
// 		y:8, 
// 		rotation: 0},
// 	{	x: SYNE.seats.groups[1].x + 4 * SYNE.seats.width, 
// 		y:8, 
// 		rotation: 0},
// 	{	x: 6, 
// 		y:26, 
// 		rotation: 0},

// 	{x: 6, y:73, rotation: 0},
// 	{x: 13, y:73, rotation: 0},
// 	{x: 20, y:73, rotation: 0},
// 	{x: 27, y:73, rotation: 0},
// 	{x: 34, y:73, rotation: 0},

// 	{x: 20, y:44, rotation: 0},
// 	{x: 27, y:53, rotation: 0},
// 	{x: 34, y:53, rotation: 0},
// 	{x: 27, y:35, rotation: 0},
// 	{x: 34, y:35, rotation: 0},

	


// ]

SYNE.seats.medium = [
	{x: 65, y:10, rotation: 0},
	{x: 58, y:10, rotation: 0},
	{x: 51, y:10, rotation: 0},
	{x: 65, y:28, rotation: 0},
	{x: 58, y:28, rotation: 0},

	{x: 51, y:53, rotation: 0},	
	{x: 51, y:71, rotation: 0},	
	{x: 58, y:53, rotation: 0},	
	{x: 58, y:71, rotation: 0},	
	{x: 65, y:62, rotation: 0},	
]

SYNE.seats.large = [
	{x: 77, y:53, rotation: 0},	
	{x: 77, y:71, rotation: 0},	
	{x: 84, y:53, rotation: 0},	
	{x: 84, y:71, rotation: 0},	
	{x: 91, y:53, rotation: 0},	
	{x: 91, y:71, rotation: 0},	
]

SYNE.expand = function(size) {
	var addUs = SYNE.seats[size];

	while(addMe = addUs.pop()) {
		var domNode = document.createElement("seat");
		domNode.style.left = addMe.x+"%";
		domNode.style.top = addMe.y+"%";
		domNode.style.translate = "rotate("+addMe.rotation+"deg)";

		if(addMe.type == S.MGMT)
			domNode.classList.add("Project_Manager");
		else if(addMe.type == S.PROJ)
			domNode.classList.add("Current_Project");

		SYNE.board.appendChild(domNode);

		(function(domNode){
			domNode.addEventListener("mousedown", function(){
				var selected = SYNE.opps.currentlyChosen;
				if(selected && domNode.PVARS.currentCard == undefined) {
					
					domNode.PVARS.currentCard = selected;
					domNode.appendChild(selected);

					if(selected.PVARS.seat)
						selected.PVARS.seat.PVARS.currentCard = undefined;
					selected.PVARS.seat = domNode;

					SYNE.opps.selectCard();
				}
				else {
					SYNE.opps.selectCard(domNode.PVARS.currentCard);
				}
				
			});

			domNode.addEventListener("mouseenter", function(){
				if(domNode.PVARS.currentCard !== undefined)
					domNode.classList.add("in_focus");
			});			

			domNode.addEventListener("mouseleave", function(){
				domNode.classList.remove("in_focus");
			});
		})(domNode)
	}
}


document.addEventListener("DOMContentLoaded", function() {
	SYNE.board = El.firstOfTag("board");
	SYNE.expand("small");
	// SYNE.expand("medium");
	// SYNE.expand("large");
});



// PINE.waitForNeed("")


ELATE.create("Card", function() {
	this.isAbstract();
});












function roundedRect(ctx, x, y, width, height, radius) {
  // ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height-radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  // ctx.stroke();
}


// http: //www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
 function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var cars = text.split("\n");

    for (var ii = 0; ii < cars.length; ii++) {

        var line = "";
        var words = cars[ii].split(" ");

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;

            if (testWidth > maxWidth) {
                context.fillText(line, x, y);
                line = words[n] + " ";
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        context.fillText(line, x, y);
        y += lineHeight;
    }
 }