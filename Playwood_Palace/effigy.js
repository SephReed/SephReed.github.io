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


		components["build"] = {
			block8_12 : 3,
			block12_12 : 3,
			block8_8 : 2,
			block4_8 : 6,
			tower : 6,
			plywood : 24,
			wire : 8 + 8 + 28 + 4 + 8 + 20 + 12 + 8 + 28 + 8 + 28 + 100,
			ledwire : 28*4 + 2*(8*4) + (28+8+8+8+ (3*12)),
			contingency : 1
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
			plywood : 8.00,
			lightSocket : 1.39,
			switch: 0.69,
			colorLight : 10.00, 
			ledBundle : 40.00,
			contingency : 1847.58
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
			}
		}



		var totals = {};
		var tax = 1.0825;
		totals.all = 0;
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
			totals.all += totals[name];	
		}

		console.log(build);
		// console.log(totals);

		var totalsOut = '';
		for(var mat in totals) {
			totalsOut += mat + " : \t"
			if(mat.length <= 11)
				totalsOut += '\t'
			if(mat.length <= 4)
				totalsOut += '\t'
			totalsOut += "$" + totals[mat] +"\n";
		}

		console.log(totalsOut)


		var units = {
			wire : " ft",
			ledwire : " ft",
		}

		var itemsOut = ''
		for(var mat in build) {
			itemsOut += mat + " : \t"
			if(mat.length <= 11)
				itemsOut += '\t'
			if(mat.length <= 4)
				itemsOut += '\t'
			itemsOut += build[mat];
			
			itemsOut += units[mat] || '';

			itemsOut += "\n";
		}
