var TEST_WAYPOINTS = [
	{
		id: 0,
		title: "Sanchez Family Tamales and Oil Changes",
		location: "place",
		offerings: [
			{
				title: "Homemade Authentic Mexican Food",
				category: "Prepared Food",
				tags: ["homemade", "mexican food"],
				offerings : [
					{
						title: "Homemade Tamales",
						category: "Tamales",
						offerings : [
							{
								title : "Pork Tamale",
								status : "available"
							},
							{
								title : "Chicken Tamale",
								status : "available"
							},
							{
								title : "Beef Tamale",
								status : "available"
							},
							{
								title : "Spicy Beef Tamale",
								status : "available"
							}
						]
					},
					{
						title: "Homemade Refried Beans",
						category: "Refried Beans",
						offerings: [
							{
								title: "Refried Beans",
								status: "available"
							},
							{
								title : "Refried Beans with Shredded Pork",
								status : "available"
							}
						]
					}
				]
			},
			{
				title: "Juans Quick Oil Changes",
				category: "Oil Change",
				status: "available"
			}
		]
	},
	{
		title: "Misty and Seph's home decor",
		offerings: [
			{
				title: "Framed Cat Pics",
				category: "Wall Art",
				status: "available"
			},
			{
				title : "Coffee Tables",
				category: "Tables",
				status : "available"
			},
			{
				title: "Framed Cat Pics",
				category: "Wall Art",
				status: "available"
			},
			{
				title : "Coffee Tables",
				category: "Tables",
				status : "available"
			},
			{
				title: "Framed Cat Pics",
				category: "Wall Art",
				status: "available"
			},
			{
				title : "Coffee Tables",
				category: "Tables",
				status : "available"
			}
		]
	}
]











// ABBRV = {
// 	id = 'i',
// 	title = 't'
// }



TEST_WAYPOINTS_RESTFUL_REPLY = [0, 8];



TEST_OFFERS_RESTFUL_REPLY = [

	{ id: 0,
	title: "Sanchez Family Tamales and Oil Changes",
	location: "place" },

		{ id: 1,
		title: "Authentic Mexican Food",
		parentId: 0,
		superRootId: 0},

			{ id: 2,
			title: "Homemade Tamales",
			description: "Muy Buenos Tamales de mi Casa",
			parentId: 1,
			superRootId: 0},

				{ id: 3,
				title: "Chicken Tamale",
				status: 1,
				parentId: 2,
				superRootId: 0},

				{ id: 4,
				title: "Pork Tamale",
				status: 1,
				parentId: 2,
				superRootId: 0},

			{ id: 5,
			title: "Refried Beans",
			parentId: 1,
			superRootId: 0},

				{ id: 6,
				title: "Refried Beans",
				status: 1,
				parentId: 5,
				superRootId: 0},

				{ id: 7,
				title: "Refried Beans with Pork",
				status: 1,
				parentId: 5,
				superRootId: 0},

		{ id: 11,
		title: "Juans Quick Oil Changes",
		status: 1,
		parentId: 0,
		superRootId: 0},


	{ id: 8,
	title: "Misty and Seph Design Agency",
	location: "place" },

		{ id: 9,
		title: "Quality Control Evaluation",
		status: 1,
		parentId: 8,
		superRootId: 8},	

		{ id: 10,
		title: "Branding",
		status: 1,
		parentId: 8,
		superRootId: 8},	

]


Offer = function(args) {
	for(var key in args) 
		this[key] = args[key];

	this.children = [];

	if(this.parentId != undefined) 
		this.parent = OFFERS[this.parentId];	
	
	if(this.parent != undefined) 
		this.parent.children.push(this);

	if(this.superRootId != undefined)
		this.superRoot = OFFERS[this.superRootId];



	// this.id = args.id;
	// this.title = args.title;
	// this.children = [];
	// this.parentId = args.parent;
	// this.superRootId = args.superRoot;

	// if(args.location)
	// 	this.location = args.location;


	// if(args.status)
	// 	this.status = args.location;

	// if(args.description != undefined)
	// 	this.description = args.description;

	// if(args.parent != undefined) {
	// 	this.parent = OFFERS[args.parent];
	// 	this.parent.children.push(this);
	// }

	// if(args.superRoot != undefined)
	// 	this.superRoot = OFFERS[args.superRoot];
}

Offer.prototype.getLocation = function() {
	var superRoot = this.superRoot ? this.superRoot : this;
	return superRoot.location;

}

Offer.prototype.getLineage = function() {
	var me = this;
	var out = [];
	for (var ptr = me; ptr; ptr = ptr.parent) {
		out.unshift(ptr);
	}
	return out;
}

Offer.prototype.getDescription = function() {
	var out;
	for (var ptr = this; ptr && !out; ptr = ptr.parent) {
		out = ptr.description;
	}

	if(!out)
		out = "This offer has no description";

	return out;
}


OFFERS = {};
function assimalateOffers(assUs) {
	for (var i in assUs) {
		var args = assUs[i];

		var addMe = new Offer(args);
		OFFERS[addMe.id] = addMe;
	}
}

assimalateOffers(TEST_OFFERS_RESTFUL_REPLY);




















