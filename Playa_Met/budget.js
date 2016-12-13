var components = {};

components.lightStick = {
	pipe: 0.5,
	light: 1,
	flange: 1,
	battery: 2
}

components.post = {
	fourFour8: 2,
	ply: 2,
	staple: 4,
	lightStick: 1,
	twoFour8: 4,
	bolt: 4,
	lantern: 2
}


components.benchFrame = {
	twoFour8: 2.5,
	screw: 15
}

components.bench = {
	benchFrame : 4,
	twoFour8: 8 + 1,
	screw: 6 * 8,
	staple: 2,
	lantern: 1
}


components.build = {
	bench: 4,
	post: 4,
	postShovel: 1,
	glue: 1,
	truckRental: 2,
	// contingency: 1,
	sticker: 300,
	token: 4000,
	generator: 2
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
	twoFour8: 2.63,
	fourFour8: 8.81,
	bolt: 2.50,
	ply: 31.98,
	pipe: 12.34,
	flange: 4.73,
	light: 15.00,
	screwbox25:  98.5,
	screwbox5:  29.98,
	staplePack: 30.00,
	sticker: 0.43,
	postShovel: 35.00,
	glue: 18.86,
	truckRental: 50.00,
	contingency: 100.00,
	token: 0.02,
	battery: 22.00,
	lantern: 11.15,
	generator: 204.00
}


var bundeled = {
	screw : {
		// name : "screwbox25",
		// count: 1950
		name : "screwbox5",
		count: 393
	},
	staple : {
		name : "staplePack",
		count: 4
	}
}







var translations = {
	battery: "5v Rechargable Battery Packs",
	bolt : "1/2in x 7in Bolts",
	contingency: "Contingency Plan",
	flange : "1/2in Floor Pipe Connector Flanges",
	fourFour8: "4x4 x 8ft Boards",
	generator: "Genny Rental",
	glue: "1 Gallon Wood Glue Bottles",
	lantern: "Solar Lanterns",
	light: "LEDs and Diffusers",
	ply: "3/4in Plywood",
	pipe: "1/2in Metal Pipes",
	postShovel: "Post Hole Shovel",
	screw: "Screws",
	screwbox5: "5lb 2.5in Deckmate Screws",
	staple: "Playa Staples",
	staplePack: "Playa Staples",
	sticker: "Bus Line Info Stickers for Art Cars",
	token: "Playa Met Laser Cut Tokens",
	truckRental: "Truck Rental",
	twoFour8: "2x4 x 8ft Boards",
	total: "Total"
}


var units = {
	truckRental: " day",
	generator: " week",
	total: " "
}






var build = simples.build;
var tax = 1.0825;


var totalsOut = [];
var total = {};
total.name = "Total";
total.price = '';
total.count = '';
total.total = 0;

totalsOut.push(total);

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
	addMe.price = price * tax;
	addMe.total = addMe.price * count;

	total.total += addMe.total;

	totalsOut.push(addMe);

	
}

totalsOut.sort(function(a, b) {
	if(a.total < b.total)
		return -1;
	if(a.total > b.total)
		return 1;
	return 0;
})


