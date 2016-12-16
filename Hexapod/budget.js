var components = {};

components.hexagon = {
	alSheet : 2,
	tube: 3
}

components.square = {
	alSheet : 0.5,
	tube: 1.5
}

components.centerPiece = {
	epoxysheet: 2
}

components.build = {
 	hexagon : 7,
 	square : 6
}



// components.lightStick = {
// 	pipe: 0.5,
// 	light: 1,
// 	flange: 1,
// 	battery: 2
// }

// components.post = {
// 	fourFour8: 2,
// 	ply: 2,
// 	staple: 4,
// 	lightStick: 1,
// 	twoFour8: 4,
// 	bolt: 4,
// 	lantern: 2
// }


// components.benchFrame = {
// 	twoFour8: 2.5,
// 	screw: 15
// }

// components.bench = {
// 	benchFrame : 4,
// 	twoFour8: 8 + 1,
// 	screw: 6 * 8,
// 	staple: 2,
// 	lantern: 1
// }


// components.build = {
// 	bench: 4,
// 	post: 4,
// 	postShovel: 1,
// 	glue: 1,
// 	truckRental: 2,
// 	// contingency: 1,
// 	sticker: 300,
// 	token: 4000,
// 	generator: 2
// }




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
	alSheet: 59.00,
	tube: 8.00,
	epoxysheet: 80.00

}


var bundeled = {
}







var translations = {
	alSheet: "0.040 Aluminum 4x10 Sheets",
	tube: "3x4 12' Aluminum Square Tube",
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


