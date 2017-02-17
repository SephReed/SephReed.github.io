var components = {};

/********************
*
*	BASIC COMPONENTS
*
********************/

components["spacerHalf"] = {
	plyHalfIn: 1/(13*27)
}

components["leg"] = {
	twoFour8: 2,
	spacerHalf: 5,
	screw: 5
}

components["foot"] = {
	twoFour8: 0.3333,
	plyThreeQuart: 1/32,
	// plyHalfIn: 1/32,
	shortScrew: 4
}

components["joistAttach"] = {
	joistNail: 4,
	shortScrew: 2,
	joistHanger: 1,
}

components["deck"] = {
	// twoFour8 : 7,
	// util_twoFour8: 5,
	twoFour8: 5,
	frameNail: (7*3),
	joistAttach: 6
}

components["triangleStep"] = {
	plyThreeQuart: 0.5,
	twoFour8: 2,
	screw: 12,
	joistNail: 12,
}

components["wall"] = {
	twoFour8 : 2,
	screw: 8,
	oneFour8 : 11,
	frameNail : 3*11, 
}

components["ladder"] = {
	twoFour8: 6,
	screw: (4*8) + (2*3)
}

components["panel"] = {
	twoTwo8: 2*3,
	luan: 1,
	screw: 2 * (4+4),
	mylar: 16
}

components["rail"] = {
	twoFour8: 3,
	oneFour8: 2,
	frameNail: 2 * (4*2),
	screw: 2 * (4*2),
}

components["diagonals"] = {
	// twoFour10: 1,
	twoFour8: 2,
	screw: 8,
}

components["slide"] = {
	twoSix8: 2,
	twoFour8: 3,
	luan : 4,
	plyThreeQuart : 2,
	screw: (5*8) + (4*3)
}

components["boltAttach"] = {
	washer: 2*2,
	boltHalfIn: 2,
	nut: 2
}


// SIDES

components["side12"] = {
	leg : 4,
	// twoFour8: 3,
	twoFour12: 2,
	twoSix12: 1,
	screw: (4*3) + (2*2*4)
}

	components["side12double"] = {
		side12: 1,
		twoSix12: 1,
		screw: (4*3)
	}

components["side8"] = {
	leg : 3,
	twoFour8: 2,
	twoSix8: 1,
	screw: (3*3) + (2*2*3)
}

	components["side8double"] = {
		side8: 1,
		twoSix8: 1,
		screw: (3*3)
	}

components["side4"] = {
	leg : 2,
	twoSix8: 0.5,
	twoFour8: 1,
	screw: (2*3) + (2*2*2)
}

components["side4short"] = {
	leg : 1,
	twoFour8: 1.5,
	screw: (2*3) + (2*2*2)
}






/********************
*
*	   BLOCKS
*
********************/

components["turret"] = {
	side4short : 2,
	diagonals: 4
}

components["block4_4"] = {
	side4 : 2,
	wall : 2
}

components["block4_8"] = {
	side8 : 2,
	diagonals : (2*2) + 3,
}

components["block8_8"] = {
	side8 : 2,
	side8double: 1,
	diagonals: (4*2) + 4
}

components["block8_12"] = {
	side12 : 2,
	side12double : 1,
	diagonals : (2*6) + 5
}

components["block12_12"] = {
	side12 : 2,
	side12double: 2,
	diagonals: (9*2) + 6
}




/********************
*
*	   SECTIONS
*
********************/


//Lower Red Side
var lowerFloor = {};
lowerFloor.A_1_1 = 1;
components["A_1_1"] = { //black board room
	block8_12: 1,
	deck: 6,
	ladder: 5,
	panel: 2,
	rail: 3,
	boltAttach: 4,
	foot: 12,
}

	lowerFloor.A_1_3 = 1;
	components["A_1_3"] = {	//red entry room, curvy stairs
		block8_12: 1,
		deck : 6,
		ladder: 1,
		rail: 3,
		panel: 3,
		triangleStep: 1,
		boltAttach: 7,
		foot: 12,
	}

	lowerFloor.A_1_5 = 1;
	components["A_1_5"] = {	  //back red corner
		block12_12: 1,
		deck: 7,
		rail: 5,
		panel: 4,
		wall : 7,
		boltAttach: 3,
		foot: 16,
		ladder: 1,
	}



//Entry Stairs

lowerFloor.A_4_1 = 1;
components["A_4_1"] = {	//entry stairs
	deck : 1.5,
	twoFour8 : 8,
	screw : 2 * (2*8)
}

	lowerFloor.A_4_2 = 1;
	components["A_4_2"] = {	//entry stairs top
		deck : 1,
		leg: 2,
		diagonals: 2,
	}





//Lower Blue Side
lowerFloor.A_4_4 = 1;
components["A_4_4"] = {	  //ball pit room
	block8_12: 1,
	deck: 6,
	// ladder: 1,
	panel: 3,
	rail: 2,
	wall : 2,
	boltAttach: 4,
	foot: 12,
}

	lowerFloor.A_5_1 = 1;
	components["A_5_1"] = {	  //front blue corner
		block12_12: 1,
		deck: 5,
		ladder: 1,
		rail: 6,
		panel: 2,
		wall : 10,
		slide: 2,
		boltAttach: 4,
		foot: 16,
	}

	lowerFloor.A_6_4 = 1;
	components["A_6_4"] = {	  //back blue corner
		block8_12: 1,
		deck: 6,
		ladder: 1,
		panel: 5,
		rail: 4,
		wall : 4,
		// boltAttach: 4,
		foot: 12,
	}


components["lowerFloor"] = lowerFloor;



//Upper Floor
var upperFloor = {};
upperFloor.B_1_6 = 1;
components["B_1_6"]	= {  //upper stair start
	block8_8: 1,
	triangleStep: 3,
	deck: 4,
	rail: 6,
	boltAttach: 2,
	wall: 4,
}

	upperFloor.B_3_3 = 1;
	components["B_3_3"] = {	  //top center
		block8_12: 1,
		deck: 5 + 2,
		rail: 10,
		wall : 9,
		ladder: 1,
		boltAttach: 4,
	}

	upperFloor.B_3_5 = 1;
	components["B_3_5"] = { //back center
		block8_12: 1,
		deck: 6,
		rail: 5,
		wall: 2,
		boltAttach: 2,
	}

	upperFloor.B_6_6 = 1;
	components["B_6_6"]	= {  //slide start
		block4_8: 1,
		deck: 2,
		rail: 4,
		wall: 1
	}


//Turrets
	upperFloor.B_1_1 = 1;
	components["B_1_1"] = {	//red turret
		turret: 1,
		deck : 2,
		ladder: .5,
		rail: 4,
	}

	upperFloor.B_7_1 = 1;
	components["B_7_1"] = {	//blue turret
		turret: 1,
		deck : 2,
		ladder: .5,
		rail: 4,
	}

components["upperFloor"] = upperFloor;




	

	
/********************
*
*	   MISC
*
********************/
	




components["tower"] = {
	plyHalfIn : 2,
	colorLight : 1,
	lightSocket : 1,
	switch : 1,
	twoFour8: 2,
}

components["towerShort"] = {
	tower: 1,
	leg: 4
}

components["towerTall"] = {
	tower: 1,
	spacerHalf: 4*5,
	twoFour12: 4*2,
}



components["lighting"] = {
	ledwire : 28*4 + 2*(8*4) + (28+8+8+8+ (3*12)),  //lower perimeter + upper + inner halls
	wire : 8 + 8 + 28 + 4 + 8 + 20 + 12 + 8 + 28 + 8 + 28 + 100,
	rpi3: 2,
	christmas: 15,
}

components["sound"] = {
	speaker: 8,
	speakerWire: 500,
}

// components["baseboard"] = {
// 	plywood : 24,
// }

components["ear"] = {
	// plyThreeQuart: 3,
	plyHalfIn: 3,
}

components["eye"] = {
	// plyThreeQuart: 1.5,
	plyHalfIn: 1.5,
}

components["face"] = {
	ear: 2,
	eye: 2,
	// plyThreeQuart: 3, //lips
	plyHalfIn: 3, //lips
	luan: 4, //horn
}

components["spaceRoom"] = {
	miniProjector: 2,
	ballBundle: 2,
	lightSocket: 2,
	colorLight: 2,
	plyThreeQuart: 2,
	luan: 2
}


components["build"] = {
	lowerFloor: 1,
	upperFloor: 1,

	face : 1,
	towerShort : 4,
	towerTall : 2,
	spaceRoom: 1,

	lighting : 1,
	sound: 1,
	contingency : 1,
	paint: 16,
	ropeBundle: 1,
	pulley: 2
}




var simples = {};
for (var compo in components) {
	var subs = components[compo];
	simples[compo] = {};

	for (var sub in subs) {
		var count = subs[sub];
		if(components[sub] !== undefined) {


			for(var mat in simples[sub]) {
				if(simples[compo][mat] === undefined)
					simples[compo][mat] = 0;

				simples[compo][mat] += simples[sub][mat] * count;
			}
		}
		else {
			if(simples[compo][sub] === undefined)
				simples[compo][sub] = 0;

			simples[compo][sub] += count;
		}
	}	
}



var prices = {
	twoTwo8: 1.85,
	oneFour8 : 1.99,
	util_twoFour8 : 2.40,
	twoFour8 : 2.50,
	twoFour10 : 3.98,
	twoFour12 : 4.82, 
	twoSix8 : 4.54,
	twoSix12 : 7.57,
	shortScrewbox : 9.37,
	screwbox : 98.5,
	frameNailBox : 20.98,
	joistNailBox: 22.98,
	wireBundle : 30.57,
	speakerWireBundle : 37.57,
	luan: 9.99,
	plyThreeQuart : 20.00,
	plyHalfIn: 15.85,
	lightSocket : 1.39,
	switch: 0.69,
	colorLight : 10.00, 
	// ledBundle : 40.00,
	ledBundle: 30.00,
	contingency : 1847.58,
	miniProjector: 45.00,
	speakers: 25.00,
	rpi3: 50.00,
	replacementDaftTools: 100.00,
	paint: 20.00,
	mylarRoll: 35.38,
	ballBundle: 115.00,
	ropeBundle: 72.00,
	pulley: 4.00,
	boltHalfIn: 1.82,
	nut: 0.10,
	washer: 0.18,
	joistHanger: 0.67,
	christmas: 6.95,
}

var build = simples["build"];

build["screw"] *= 1.333;
// build["screwbox"] = ~~(build["screw"]/1950)+1;

// build["wire"] = 
build["wire"] *= 1.333;
// build["wireBundle"] = ~~(build["wire"]/100)+1;

// build["ledwire"] = 28*4 + 2*(8*4) + (28+8+8+8+ (3*12));
// build["ledBundle"] = ~~(build["ledwire"]/30)+1;


for (var mat in build) {
	if(build[mat]%1 > 0)
		build[mat] = ~~(build[mat]) + 1;
}


var bundeled = {
	screw : {
		name : "screwbox",
		count: 1950
	},

	shortScrew : {
		name : "shortScrewbox",
		count: 184
	},

	joistNail : {
		name : "joistNailBox",
		count: 625 * 2
	},

	frameNail : {
		name : "frameNailBox",
		count : 1000
	},

	wire : {
		name : "wireBundle",
		count : 100
	},

	ledwire : {
		name : "ledBundle",
		// count : 30
		count: 3,
	},

	speaker : {
		name : "speakers",
		count : 2
	},

	speakerWire : {
		name : "speakerWireBundle",
		count : 250
	},

	mylar : {
		name : "mylarRoll",
		count : 25
	},
}



// var totals = {};
// var tax = 1.0825;
// totals.total = 0;
// for(var mat in build) {
// 	var price, count, name;
// 	if(bundeled[mat]) {
// 		count = ~~(build[mat]/bundeled[mat].count)+1;
// 		name = bundeled[mat].name;
// 		price = prices[name];
// 		console.log(count, name, price);
// 	}
// 	else {
// 		price = prices[mat];
// 		count = build[mat];
// 		name = mat;
// 	}

// 	totals[name] =  price * count * tax;
// 	totals.total += totals[name];	
// }
// totals.noContingecy = totals.total - totals.contingency;

// console.log(build);
// console.log(totals);

var translations = {
	twoTwo8: "2x2 x 8'",
	oneFour8: "1x4 x 8'",
	util_twoFour8: "Utility 2x4 x 8'",
	twoFour8: "2x4 x 8'",
	twoSix8: "2x6 x 8'",
	twoSix12: "2x6 x 12'",
	twoFour12: "2x4 x 12'",
	paint: "Paint",
	replacementDaftTools: "Replacement DaFT Tools",
	speakerWireBundle: "Speaker Wire Bundles",
	miniProjector: "Mini Projectors",
	switch: "Switches",
	lightSocket: "Light Sockets",
	mylarRoll: "Mylare Rolls",
	colorLight: "Color LED Lights",
	wire: "Electrician Wire Bundles",
	// wire: "Wire",
	ledwire: "LED Wire",
	luan: "Luan Board",
	boltHalfIn: "1/2\" x 8\" Bolt",
	washer: "1/2\" Washer",
	nut: "1/2\" Nut",
	plyHalfIn: "1/2\" Plywood",
	plyThreeQuart: "3/4\" Plywood",
	// speakerWire: "Speaker Wire",
	speakerWire: "Speaker Wire Bundles",
	// screw: "Screws",
	shortScrew: "3/4\" Screwboxes",
	screw: "2 1/2\" Screwboxes",
	frameNail: "2\" Framing Nail Box (1000 per)",
	joistNail: "Joist Nail Box (10 lb)",
	joistHanger: "2x4\" Joist Hanger",
	// joistNail: "Joist Nails",
	speaker: "Speakers (Pair)",
	// speakers: "Speakers",
	contingency: "Contingency Plan",
	rpi3: "Raspberry Pi 3",
	ledBundle: "LED Strip Bundles",
	total: "Build Total",
	ball: "3.1\" Diameter Balls",
	ballBundle: "1000ct Ballpit Bundles",
	noContingecy: "Total w/o Contingency Plan",
	ropeBundle: "100ft Bundle of 1\" Rope",
	pulley: "1\" Pulleys",
	mylar: "25ft Mylar Roll",
}



// var totalsOut = [];
// for(var mat in totals) {
// 	var name = transaltions[mat] || mat;
// 	var text = name + " :"
// 	if(text.length < 8)
// 		text += '\t'
// 	if(text.length < 16)
// 		text += '\t'
// 	if(text.length < 24)
// 		text += '\t'
// 	if(text.length < 32)
// 		text += '\t'

// 	text += '\t';
// 	text += "$" + totals[mat];

// 	var addMe = {};
// 	addMe.value = totals[mat];
// 	addMe.text = text;
// 	totalsOut.push(addMe);
// }

// totalsOut.sort(function(a, b) {
// 	if(a.value < b.value)
// 		return -1;
// 	if(a.value > b.value)
// 		return 1;
// 	return 0;
// })

// console.log(totalsOut)




var units = {
	// wire : " ft",
	// ledwire : " ft",
	// speakerWire: " ft",
	paint : " gal",
	// mylar : " ft",
}

// var itemsOut = [];
// for(var mat in build) {
// 	var name = transaltions[mat] || mat;
// 	var text = name + " :"
// 	if(text.length < 8)
// 		text += '\t'
// 	if(text.length < 16)
// 		text += '\t'
// 	if(text.length < 24)
// 		text += '\t'
// 	if(text.length < 32)
// 		text += '\t'

// 	text += '\t';
// 	text += build[mat];
	
// 	text += units[mat] || ' ct';

// 	var addMe = {};
// 	addMe.value = build[mat];
// 	addMe.text = text;
// 	itemsOut.push(addMe);
// }

// itemsOut.sort(function(a, b) {
// 	if(a.value < b.value)
// 		return -1;
// 	if(a.value > b.value)
// 		return 1;
// 	return 0;
// })


var droppable = {
	mylar : -1,
	wire: 2,
	pulley: -1,
	rpi3: -1,
	miniProjector: -1,
	luan: 16,
	speaker: -1,
	ropeBundle: -1,
	switch: -1,
	lightSocket: 5,
	speakerWire: -1,
	colorLight: 5,
	ledwire: 85,
	twoTwo8: -1,
	paint: 8,
	screw: 1,
}




var tax = 0.0825;
var mvp = [];
var totalsOut = [];

var total = {
	name : "Total",
	price : '',
	count : '',
	total : 0,
}
totalsOut.push(total);

var mvpTotal = {
	name : "Total",
	price : '',
	count : '',
	total : 0,
}
mvp.push(mvpTotal);



var canBeDropped = 0;

// totalsOut.push(canBeDropped);

for(var mat in build) {
	var price, count, name;
	if(bundeled[mat]) {
		var bundle = bundeled[mat].count;
		var needed = build[mat];
		count = Math.ceil(needed/bundle);
		if((needed%bundle)/bundle > .75)
			count++;

		name = bundeled[mat].name;
		price = prices[name];
		console.log(count, name, price);
	}
	else {
		price = prices[mat];
		count = build[mat];
		name = mat;
	}

	console.log(name, price, count);

	var addMe = {};
	addMe.name = translations[mat] || mat;
	addMe.count = count + (units[mat] || " ct");
	addMe.price = price;// * tax;

	addMe.total = addMe.price * count;

	total.total += addMe.total;
	totalsOut.push(addMe);


	var dropCount = droppable[mat];
	if(dropCount == -1) {
		canBeDropped += addMe.total;
	}
	else {
		if(dropCount === undefined)
			dropCount = 0;

		var mvpAddMe = {};
		mvpAddMe.name = addMe.name;
		mvpAddMe.count = (count - dropCount) + (units[mat] || " ct");
		mvpAddMe.price = addMe.price

		mvpAddMe.total = mvpAddMe.price * (count - dropCount);

		mvp.push(mvpAddMe);
		mvpTotal.total += mvpAddMe.total;
	}



}



totalsOut.push({
	name : "Total w/o Contingency",
 	price : '',
	count : '',
	total : total.total - 2000,
});

mvp.push({
	name : "Total w/o Contingency",
 	price : '',
	count : '',
	total : mvpTotal.total - 2000,
});

totalsOut.sort(function(a, b) {
	if(a.total < b.total)
		return -1;
	if(a.total > b.total)
		return 1;
	return 0;
})

mvp.sort(function(a, b) {
	if(a.total < b.total)
		return -1;
	if(a.total > b.total)
		return 1;
	return 0;
})



var totalTax = {
	name : "Tax",
 	price : '',
	count : '',
	total : total.total * tax,
};
totalsOut.push(totalTax);

totalsOut.push({
	name : "Total w/ Tax",
 	price : '',
	count : '',
	total : total.total + totalTax.total,
});





var mvpTax = {
	name : "Tax",
 	price : '',
	count : '',
	total : mvpTotal.total * tax,
}
mvp.push(mvpTax);

mvp.push({
	name : "Total w/ Tax",
 	price : '',
	count : '',
	total : mvpTotal.total + mvpTax.total,
});

// totalsOut.noContingecy = totalsOut.total - totalsOut.contingency;

// var bid = {};

// bid.name = "Project Bid";
// bid.price = "";
// bid.count = "";
// bid.total = (~~(total.total/100) + 1)*100;
// totalsOut.push(bid);





