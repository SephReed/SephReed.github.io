var components = {};
components["stud"] = {
	twoFour8: 2,
	screw: 5
}
components["deck"] = {
	twoFour8 : 7,
	screw: 3 * 10
}

components["wall"] = {
	twoFour8 : 2,
	screw: 4,
	oneFour8 : 10
}

components["side12"] = {
	stud : 4,
	twoSix12: 1
}
components["side8"] = {
	stud : 3,
	twoSix8: 1
}

components["side4"] = {
	stud : 2
}

components["block8_12"] = {
	side12 : 3,
	deck : 6,
	wall : 9
}

components["block12_12"] = {
	side12 : 4,
	deck : 9,
	wall : 12
}

components["block8_8"] = {
	side8 : 3,
	deck : 4,
	wall : 6
}

components["block4_8"] = {
	side8 : 2,
	deck : 2,
	wall : 3
}

components["block4_4"] = {
	side4 : 2,
	wall : 2
}


components["tower"] = {
	plywood : 2,
	colorLight : 1,
	lightSocket : 1,
	switch : 1
}

components["slide"] = {
	twoSix8: 2,
	plywood : 3,
	thickPly : 2,
}

components["lighting"] = {
	ledwire : 28*4 + 2*(8*4) + (28+8+8+8+ (3*12)),
	wire : 8 + 8 + 28 + 4 + 8 + 20 + 12 + 8 + 28 + 8 + 28 + 100,
	miniProjector: 2,
	lightSocket: 1,
	rpi3: 2,
	colorLight: 4,
}

components["sound"] = {
	speaker: 8,
	speakerWire: 500,
}

components["baseboard"] = {
	plywood : 24,
}


components["build"] = {
	block8_12 : 3,
	block12_12 : 3,
	block8_8 : 2,
	block4_8 : 6,
	slide: 2,
	tower : 6,
	baseboard: 1,
	lighting : 1,
	sound: 1,
	contingency : 1,
	// replacementDaftTools: 1,
	paint: 16,
	mylarRoll: 2,
	ballBundle: 2,
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
	oneFour8 : 1.99,
	twoFour8 : 2.81,
	twoSix8 : 4.33,
	twoSix12 : 9.57,
	screwbox : 98.5,
	wireBundle : 30.57,
	speakerWireBundle : 37.57,
	plywood : 8.00,
	thickPly : 20.00,
	lightSocket : 1.39,
	switch: 0.69,
	colorLight : 10.00, 
	ledBundle : 40.00,
	contingency : 1847.58,
	miniProjector: 45.00,
	speakers: 25.00,
	rpi3: 50.00,
	replacementDaftTools: 100.00,
	paint: 20.00,
	mylarRoll: 35.38,
	ballBundle: 220.00,
	ropeBundle: 72.00,
	pulley: 4.00
}

var build = simples["build"];
build["screw"] *= 1.333;
// build["screwbox"] = ~~(build["screw"]/1950)+1;

// build["wire"] = 
build["wire"] *= 1.333;
// build["wireBundle"] = ~~(build["wire"]/100)+1;

// build["ledwire"] = 28*4 + 2*(8*4) + (28+8+8+8+ (3*12));
// build["ledBundle"] = ~~(build["ledwire"]/30)+1;


var bundeled = {
	screw : {
		name : "screwbox",
		count: 1950
	},

	wire : {
		name : "wireBundle",
		count : 100
	},

	ledwire : {
		name : "ledBundle",
		count : 30
	},

	speaker : {
		name : "speakers",
		count : 2
	},

	speakerWire : {
		name : "speakerWireBundle",
		count : 250
	},
}



var totals = {};
var tax = 1.0825;
totals.total = 0;
for(var mat in build) {
	var price, count, name;
	if(bundeled[mat]) {
		count = ~~(build[mat]/bundeled[mat].count)+1;
		name = bundeled[mat].name;
		price = prices[name];
		console.log(count, name, price);
	}
	else {
		price = prices[mat];
		count = build[mat];
		name = mat;
	}

	totals[name] =  price * count * tax;
	totals.total += totals[name];	
}
totals.noContingecy = totals.total - totals.contingency;

console.log(build);
// console.log(totals);

var transaltions = {
	oneFour8: "1x4 x 8'",
	twoFour8: "2x4 x 8'",
	twoSix8: "2x6 x 8'",
	twoSix12: "2x6 x 12'",
	paint: "Paint",
	replacementDaftTools: "Replacement DaFT Tools",
	speakerWireBundle: "Speaker Wire Bundles",
	miniProjector: "Mini Projectors",
	switch: "Switches",
	lightSocket: "Light Sockets",
	mylarRoll: "Mylare Rolls",
	colorLight: "Color LED Lights",
	wireBundle: "Electrician Wire Bundles",
	wire: "Wire",
	ledwire: "LED Wire",
	plywood: "Yucca Board",
	thickPly: "3/4\" Plywood",
	speakerWire: "Speaker Wire",
	speakerWireBundle: "Speaker Wire Bundles",
	screw: "Screws",
	screwbox: "Screwboxes",
	speaker: "Speakers",
	speakers: "Speakers",
	contingency: "Contingency Plan",
	rpi3: "Raspberry Pi 3",
	ledBundle: "LED Strip Bundles",
	total: "Build Total",
	ball: "3.1\" Diameter Balls",
	ballBundle: "1000ct Ballpit Bundles",
	noContingecy: "Total w/o Contingency Plan",
	ropeBundle: "100ft Bundle of 1\" Rope",
	pulley: "1\" Pulleys"
}



var totalsOut = [];
for(var mat in totals) {
	var name = transaltions[mat] || mat;
	var text = name + " :"
	if(text.length < 8)
		text += '\t'
	if(text.length < 16)
		text += '\t'
	if(text.length < 24)
		text += '\t'
	if(text.length < 32)
		text += '\t'

	text += '\t';
	text += "$" + totals[mat];

	var addMe = {};
	addMe.value = totals[mat];
	addMe.text = text;
	totalsOut.push(addMe);
}

totalsOut.sort(function(a, b) {
	if(a.value < b.value)
		return -1;
	if(a.value > b.value)
		return 1;
	return 0;
})

console.log(totalsOut)




var units = {
	wire : " ft",
	ledwire : " ft",
	speakerWire: " ft",
	paint : " gal"
}

var itemsOut = [];
for(var mat in build) {
	var name = transaltions[mat] || mat;
	var text = name + " :"
	if(text.length < 8)
		text += '\t'
	if(text.length < 16)
		text += '\t'
	if(text.length < 24)
		text += '\t'
	if(text.length < 32)
		text += '\t'

	text += '\t';
	text += build[mat];
	
	text += units[mat] || ' ct';

	var addMe = {};
	addMe.value = build[mat];
	addMe.text = text;
	itemsOut.push(addMe);
}

itemsOut.sort(function(a, b) {
	if(a.value < b.value)
		return -1;
	if(a.value > b.value)
		return 1;
	return 0;
})

