var o = SYNE.opps = {};
o.APP = "App";
o.CLI = "Client";
o.ACT = "Action";


o.GREEN = "Green";
o.PURPLE = "Purple";
o.BLUE = "Blue"
o.ORANGE = "Orange"

SYNE.opps.data = [
	[o.APP, "Seph Reed", o.GREEN, 60,
		3, 3, 2, 0,
		"Can not be played if critical mass, unless green",
		function(player){ return SYNE.critical == o.GREEN || SYNE.critical == undefined; }],

	[o.APP, "Some Jerk", o.GREEN, 80,
		4, 1, 0, 2,
		"Lowers synnergy by 2 when played",
		function(player){ SYNE.synergy -= 2; return true; }],

	[o.APP, "Business Monkey", o.BLUE, 70,
		0, 0, 3, 4,
		"\"All I want out of life is to be a monkey of moderate intelligence who wears a suit\"",],
		// function(player){ SYNE.synergy -= 2; return true; }],	

	[o.APP, "Nobody", o.PURPLE, 60,
		3, 3, 2, 0,
		"Not much to say"],

	[o.APP, "Nobody", o.ORANGE, 60,
		3, 3, 2, 0,
		"Not much to say"],

	[o.APP, "Tricky", o.GREEN, 60,
		3, 3, 2, 0,
		"Bluff - When hiring roll a dice.  If it lands on 5 or 6, pay 20k more."],


	[o.CLI, "Military Job", 500,
		25, 8, 4, 15,
		"Lowers synnergy by 1 for each purple",
		function(player){ SYNE.synergy -= SYNE.getCount(o.PURPLE); return true; }]		
];

// for(var i = 0; i < 30; i++) {
// 	var culture;
// 	var num = Math.random();
// 	if(num < .25)
// 		culture = o.ORANGE;
// 	else if(num < .5)	
// 		culture = o.GREEN;
// 	else if(num < .75)	
// 		culture = o.PURPLE;
// 	else
// 		culture = o.BLUE;

// 	SYNE.opps.data.push([o.APP, "Anon", culture, 60,
// 		3, 3, 2, 0,
// 		// "Bluff - When hiring roll a dice.  If it lands on 5 or 6, pay double."
// 		"Is a faggot with an extra long description about how to play this particular one"]);
// }

SYNE.opps.byID = []
SYNE.opps.pile = [];
SYNE.opps.disc = [];
SYNE.opps.currentlyChosen;

SYNE.opps.selectCard = function(selectMe) {
	if(SYNE.opps.currentlyChosen)
		SYNE.opps.currentlyChosen.classList.remove("chosen_card");

	if(selectMe && selectMe != SYNE.opps.currentlyChosen) {
		SYNE.opps.currentlyChosen = selectMe;
		SYNE.opps.currentlyChosen.classList.add("chosen_card");
	}
	else
		SYNE.opps.currentlyChosen = undefined;
}



ELATE.create("OpportunityCard", function() {
	this.isAbstract();
	this.evolvesFrom("Card");
	this.parseArgs = function(){ return {};};
});

var ApplicantCard = ELATE.create("ApplicantCard", function(){
	this.evolvesFrom("OpportunityCard");
	this.parseArgs = function(args){ return {ApplicantCard: args};};

	this.evolveThis = function(name, culture, cost, log, art, ppl, sin, desc, fn) {
		// var imgSrc = "public/images/unknown_person.png";
		var THIS = this;
		THIS.name = name;
		THIS.culture = culture;
		THIS.cost = cost;
		THIS.log = log;
		THIS.art = art;
		THIS.ppl = ppl;
		THIS.sin = sin;
		THIS.desc = desc;
		THIS.fn = fn;
	}

	this.getGUI = function() {
		var THIS = this;
		if(THIS.domNode == undefined) {
			THIS.domNode = document.createElement("card");
			El.attr(THIS.domNode, "cardType", "OpportunityCard");
			El.attr(THIS.domNode, "cardID", THIS.ID);
			PINE.updateAt(THIS.domNode);
		}
		return THIS.domNode;
	}
});





for(var i = 0; i < SYNE.opps.data.length; i++) {
	var args = SYNE.opps.data[i];
	var type = args.shift();
	console.log(type);
	var card;
	if(type == o.APP) {
		card = new ApplicantCard(args);
		card.ID = i;
		SYNE.opps.byID[i] = card;
		SYNE.opps.pile.push(card);
	}

	// else if(type == o.CLI)
	// 	card = new ApplicantCard(args);
	
	// else if(type == o.ACT)
	// 	card = new ApplicantCard(args);
	
	
}



var ApplicantGUI;
document.addEventListener("DOMContentLoaded", function() {
	ApplicantGUI = El.byID("ApplicantGUI");

	for(var i = 0; i < 8 && SYNE.opps.pile.length > 0; i++) {
		var target = ~~(Math.random() * SYNE.opps.pile.length);
		var card = SYNE.opps.pile.splice(target, 1)[0];

		console.log(card);
		document.body.appendChild(card.getGUI());
		console.log("adding", card);
	}

	
});




SYNE.opps.fonts = {
	header : '33px arial',
	appStat : '50px arial',
	appDesc : '30px arial',
}
SYNE.opps.colors = {}
SYNE.opps.colors[o.GREEN] = "green";
SYNE.opps.colors[o.ORANGE] = "orange";
SYNE.opps.colors[o.BLUE] = "blue";
SYNE.opps.colors[o.PURPLE] = "purple";

SYNE.opps.unknownPerson = document.createElement("img");
SYNE.opps.unknownPerson.src = "public/images/unknown_person.png";


PINE.createNeedle("card", function(card) {
	card.addAttArg("type", ["cardType"], "string");
	card.addAttArg("id", ["cardID"], "number");

	card.addOp(function() {
		var THIS = this;

		var canvas = THIS.canvas = document.createElement("canvas");
		canvas.height = 500;
		canvas.width = 300;
		var painter = THIS.painter = canvas.getContext("2d");
		
		if(THIS.attArg.type == "OpportunityCard") {
			THIS.domNode.PVARS.object = THIS.object = SYNE.opps.byID[THIS.attArg.id];

			var img = document.createElement("img");
			img.src = "public/images/unknown_person.png";

			var img_stats = document.createElement("img");
			img_stats.src = "public/images/stats.png";

			img.addEventListener("load", function() {
				painter.beginPath();
				roundedRect(painter, 4, 50, 200, 250, 8);
				var gradient = painter.createRadialGradient(50, 80, 0, 50, 50, 250);
				gradient.addColorStop(0, '#c1c599');
				gradient.addColorStop(1, SYNE.opps.colors[THIS.object.culture]);
				painter.fillStyle = gradient;
				painter.fill();
				roundedRect(painter, 4, 50, 200, 250, 8);
				// painter.clip();
				var width = 200;
				var height = (width/img.naturalWidth) * img.naturalHeight;
				painter.drawImage(img,10,100, width, height);


				// width = 100;
				// height = (width/img_stats.naturalWidth) * img_stats.naturalHeight;
				// painter.drawImage(img_stats,210,50, width, height);


				painter.font = SYNE.opps.fonts.header;
				painter.fillStyle = "white";
				painter.fillText(THIS.object.name , 10, 42);

				painter.font = SYNE.opps.fonts.appDesc;
				painter.textAlign = 'right';
				painter.fillText(THIS.object.cost+"k" , 290, 88);

				painter.font = SYNE.opps.fonts.appStat;
				var stats = THIS.object.log+" "
					+THIS.object.art+" "
					+THIS.object.ppl+" "
					+THIS.object.sin;
				wrapText(painter, stats, 300, 87, 25, 53);
				// painter.fillText(THIS.object.log , 250, 100);
				// painter.fillText(THIS.object.art , 250, 150);
				// painter.fillText(THIS.object.ppl , 250, 200);
				// painter.fillText(THIS.object.sin , 250, 250);


				painter.textAlign = 'left';
				painter.font = SYNE.opps.fonts.appDesc;
				wrapText(painter, THIS.object.desc, 10, 330, 300, 40);
			})

			

			// 
			// var content = ApplicantGUI.cloneNode(true);
			THIS.domNode.appendChild(canvas);

			// THIS.domNode.classList.add("applicant");
			

		}

		
		THIS.domNode.addEventListener("mousedown", function() {
			SYNE.opps.selectCard(THIS.domNode);
		});
		
	});
})







