// "use strict"


var ELATE = {};

ELATE.Abstract = function() {
	console.error("can not call abstract fn", this);
}

ELATE.Elations = {};
ELATE.get = function(name) {
	return ELATE.Elations[name]
}



ELATE.noCopy = {};
ELATE.noCopy.fromSuper = ["super", "__elate__", "className"]
ELATE.noCopy.fromBuilder = 
	["build", "super", "parseArgs", "__elate__", "extend", "isAbstract", 
	"canEvolve", "evolveThis", "evolvesFrom", "implements"];




ELATE.create = function(outsClassName, planFn) {
	var buildMe = new ELATE.class.ClassPlanner();

	var constructorBefore = buildMe.constructor;
	planFn.call(buildMe);

	if(buildMe.constructor !== constructorBefore)
		console.error("Do not use constructor!  Use build instead for class: ", outsClassName)

	


	ELATE.process.updateEvolveOnly(buildMe, outsClassName);

	if(buildMe.__elate__.evolutionOnly && buildMe.parseArgs == undefined)
		console.error("Must use this.parseArgs if a forced evolve: ", outsClassName)
	
	ELATE.process.compileSupersList(buildMe, outsClassName);



	var out = ELATE.process.buildClassConstructor(buildMe, outsClassName);

	out.prototype.__elate__ = {}
	out.prototype.__elate__.isAbstract = buildMe.__elate__.isAbstract;
	out.prototype.__elate__.className = outsClassName;
	out.prototype.__elate__.canEvolves = buildMe.__elate__.canEvolves;
	out.prototype.__elate__.supers = buildMe.__elate__.supers;
	out.prototype.__elate__.extendedSupers = buildMe.__elate__.extendedSupers;
	out.prototype.isElated = true;

	

	ELATE.process.addSuperFunctions(out, buildMe, outsClassName);



	
	for(var i = 0; i < buildMe.__elate__.implements.length; i++) {
		var implementName = buildMe.__elate__.implements[i];
		var implementMe = ELATE.get(implementName);

		if(implementMe == undefined) 
			console.error("Can not find ", implementName, "to be implemented for", out);

		else {

			var canEvolves = implementMe.prototype.__elate__.canEvolves;
			var canBeImplemented = false;

			if(canEvolves.indexOf("*") != -1)
				canBeImplemented = true;

			else if (canEvolves.indexOf(outsClassName) != -1)
				canBeImplemented = true;

			else {
				var supers = buildMe.__elate__.supers;

				for(var i = 0; i < supers.length; i++) {
					var superName = supers[i];

					if(canEvolves.indexOf(superName) != -1) {
						canBeImplemented = true;
						break;
					}
				}
			}


			if(canBeImplemented) {

				// out.prototype.super[implementName] = implementMe;

				//add every function of this implementation
				for(var proto in implementMe.prototype) {
					if(ELATE.noCopy.fromSuper.includes(proto) == false){
						out.prototype[proto] = implementMe.prototype[proto];
					}
				}
			}
			else console.error("Can not implement", implementName ,"Class does not allow evolving of", outsClassName);
		}

	}



	//Copy all functions from planner as protos, unless special
	for(var proto in buildMe) {
		if(ELATE.noCopy.fromBuilder.includes(proto) == false) {
				//
		  	var addMe = buildMe[proto];
			if(addMe == "abstract")
				addMe = ELATE.Abstract;

			out.prototype[proto] = addMe;
		}
	}



	//Assert no abstract functions, unless abstract class
	if(buildMe.__elate__.isAbstract == false) {
		var badFns = [];
		for(var proto in out.prototype) {
			if(out.prototype[proto] == ELATE.Abstract)
				badFns.push(proto);
		}

		if(badFns.length)
			return console.error("non abstract class '"+outsClassName+"' has abstract functions:", badFns, out);
	}

	ELATE.Elations[outsClassName] = out;

	return out;
}




ELATE.evolve = ELATE.implement = function(evolveMe, evolveTo, constructionArgs) {
	var interface = ELATE.get(evolveTo);

	if(interface == undefined)
		return console.error("can not find interface ", evolveTo);
	
	else if(evolveMe.isElated !== true)
		return console.error("can not extend non elated object", evolveMe);

	else {
		var canEvolves = interface.prototype.__elate__.canEvolves;
		var evolveAllowed = canEvolves.indexOf("*") != -1
			//
		for(var i = 0; !evolveAllowed && i < canEvolves.length; i++) 
			evolveAllowed = evolveMe.__buildLog.indexOf(canEvolves[i]) != -1;

		if(evolveAllowed) {
			for(var proto in interface.prototype) {
				evolveMe[proto] = interface.prototype[proto];
			}

			interface.apply(evolveMe, constructionArgs);
		}
		else console.error("Can not evolve object, because target to evolve to does not allow it", evolveTo, evolveMe)
	}
}





ELATE.process = {};



ELATE.process.updateEvolveOnly = function(planner, outsClassName) {
	var supers = planner.__elate__.supers;
	var canEvolves = planner.__elate__.canEvolves;


	if(canEvolves.length) {
		var allSupersEvolvable = true;
		var hasSuperToEvolve = false;

		//if can evolves contains an "all", all supers are evolvable
		if(canEvolves.indexOf("*") != -1) {
			planner.__elate__.canEvolves = ["*"];
			hasSuperToEvolve = supers.length > 0;
		}

		//else if any evolves are super, all supers must evolve
		else {
			for(var i = 0; i < supers.length && (hasSuperToEvolve == false || allSupersEvolvable); i++) {
				var canEvolveSuper = canEvolves.indexOf(supers[i]) != -1;
				allSupersEvolvable = allSupersEvolvable && canEvolveSuper;  //remains false once set
				hasSuperToEvolve = hasSuperToEvolve || canEvolveSuper; //remains true once set
			}
		}
		

		if(hasSuperToEvolve) {
			if(allSupersEvolvable)
		    	planner.__elate__.evolutionOnly = planner.__elate__.supers.slice(0);

		    else
		    	console.error(outsClassName, "has extensions it evolves, and extensions it does not.  must be all or none")	
		}
	}
}









ELATE.process.compileSupersList = function(buildMe, outsClassName) {
	var supers = buildMe.__elate__.supers;
	var implements = buildMe.__elate__.implements;
	var extended = buildMe.__elate__.extendedSupers = []

	if(supers.length == 0 && outsClassName !== "Elated")
		supers.push("Elated");

	ELATE.easyConcat(extended, supers);

	for(var i = 0; i < supers.length; i++) {
		var superName = supers[i];
			//
		let superClass = ELATE.get(superName);

		if(superClass) 
			ELATE.easyConcat(extended, superClass.prototype.__elate__.extendedSupers);
		
		else console.error(outsClassName+" can not extend not yet defined class: "+superName);
	}

	ELATE.easyConcat(extended, implements);

	for(var i = 0; i < implements.length; i++) {
		var implementsName = implements[i];
			//
		let interfaceClass = ELATE.get(implementsName);

		if(interfaceClass) 
			ELATE.easyConcat(extended, interfaceClass.prototype.__elate__.extendedSupers);
		
		else console.error(outsClassName+" can not implement not yet defined class: "+implementsName);
	}
}









ELATE.process.buildClassConstructor = function(buildMe, outsClassName) {

	


	return function() {
		if(buildMe.__elate__.isAbstract && this.__buildLog == undefined)
			console.error("can not construct abstract class", outsClassName);


		// Create "this" injectors for all calls to super
		if(this.super == undefined) 
			this.super = {};

		ELATE.process.buildOut.supers.call(this, buildMe.__elate__.extendedSupers, outsClassName);
		

		if(this.__buildLog == undefined) 
			this.__buildLog = [];

		this.__buildLog.push(outsClassName);



		//Call constructors for all classes that must be evolved to create this one
		var allArgs;
		var mustEvolves = buildMe.__elate__.evolutionOnly;

		if(mustEvolves) {
			allArgs = buildMe.parseArgs ? buildMe.parseArgs.apply(this, arguments) : {};

			for(var i in mustEvolves) {

				if(this.__buildLog.indexOf(mustEvolves[i]) == -1) {
					var evolveMe = ELATE.get(mustEvolves[i]);
					if(evolveMe) {
						var args = allArgs[mustEvolves[i]] || [];
						
						if(ELATE.isArray(args) == false)
							console.error("all parsed args must be as an argument array ", args, outsClassName, mustEvolves[i]);

						evolveMe.apply(this, args);
						
					}

					else
						console.error("forced evolve has no class ", mustEvolves[i]);
				}
			}

			//if a case of evolution, args are included in arg parser
			if(buildMe.evolveThis){
				var args = allArgs[outsClassName] || [];

				if(ELATE.isArray(args) == false)
					console.error("all parsed args must be as an argument array ", args, outsClassName);

				buildMe.evolveThis.apply(this, args);
			}
		}

		//if no evolution, use evolve as build
		else if(buildMe.evolveThis)
			allArgs = buildMe.evolveThis.apply(this, arguments);


		
		

		//If this is not an evolution case, and has no evolution functions check for a constructor
		if(buildMe.build) {
			if(buildMe.parseArgs)
				console.error("can not have a build for a class which has an arg parser ", outsClassName, buildMe);

			else if (mustEvolves || buildMe.evolveThis)
				console.error("can not have a build for a class which extends evolvables ", outsClassName, buildMe);

			else 
				allArgs = buildMe.build.apply(this, arguments);
		}
		



		//implement all interfaces
		var implements = buildMe.__elate__.implements;

		
		for(var i = 0; i < implements.length; i++) {
				//

			if(this.__buildLog.indexOf(implements[i]) == -1) {
				var args;
				if(allArgs)
					args = allArgs[implements[i]];
				args = args || [];

				if(ELATE.isArray(args) == false)
					console.error("all parsed args must be as an argument array ", args, outsClassName, implements[i]);

				var interface = ELATE.get(implements[i]);

				if(interface)
					interface.apply(this, args);

				else
					console.error("args given for non existant interfaces", outsClassName, interface[i]);
			}
		}
		// }
		// else if(implements.length){
		// 	if(mustEvolves)
		// 		console.error("class ["+outsClassName+"] has no parseArgs for interfaces");
		// 	else
		// 		console.error("class ["+outsClassName+"] constructor returns no variables for interfaces");
		// }
	}
}




ELATE.process.buildOut = {};
ELATE.process.buildOut.supers = function(supers, outsClassName) {
	var thisFn = this;
	
	for(var i = 0; i < supers.length; i++) {
		(function(superName) {
			if(this.super[superName] == undefined) {
				var superClass = ELATE.get(superName);

				this.super[superName] = new Proxy(function(){}, {
					apply: function(target, thisArg, argumentsList) {
				      	return superClass.apply(thisFn, argumentsList);
				    },
					get: function(target, att) {
						if(typeof superClass.prototype[att] == "function") {
							return function () {
								return superClass.prototype[att].apply(thisFn, arguments);
							}
						}
						else return superClass[att];
					}
				});
			}
		}).call(this, supers[i])
	}
}




ELATE.process.addSuperFunctions = function(out, buildMe, outsClassName) {
	for(var i = 0; i < buildMe.__elate__.supers.length; i++) {
			//
		var superClass = ELATE.get(buildMe.__elate__.supers[i]);

		//add every function of this super (includes inherited) to output
		for(var proto in superClass.prototype) {
			if(ELATE.noCopy.fromSuper.includes(proto) == false){
				out.prototype[proto] = superClass.prototype[proto];
			}
		}
		
	}
}













ELATE.class = {};
ELATE.class.ClassPlanner = function() {
	var private = this.__elate__ = {}
	private.isAbstract = false;
	private.canEvolves = [];
	private.implements = [];
	private.supers = [];
}

ELATE.class.ClassPlanner.prototype.isAbstract = function() {
	this.__elate__.isAbstract = true;
};


ELATE.class.ClassPlanner.prototype.extend = function() {
	ELATE.easyConcat(this.__elate__.supers, arguments);
};


ELATE.class.ClassPlanner.prototype.evolvesFrom = function(parent) {
	this.extend(parent);
	this.canEvolve(parent);
};


ELATE.class.ClassPlanner.prototype.implements = function() {
	ELATE.easyConcat(this.__elate__.implements, arguments);
};


ELATE.class.ClassPlanner.prototype.canEvolve = function() {
	ELATE.easyConcat(this.__elate__.canEvolves, arguments);
}












ELATE.isArray = function(checkMe) {
	return typeof checkMe == "object" && checkMe.length !== undefined;
}


ELATE.easyConcat = function(addToMe, addMe) {

	if(ELATE.isArray(addMe)) {
		if(addMe.length == 1 && ELATE.isArray(addMe[0]))
			addMe = addMe[0];

	    var hash = {}, i;
	    for (i=0; i<addToMe.length; i++) {
	        hash[addToMe[i]]=true;
	    } 
	    for (i=0; i<addMe.length; i++) {
	    	if(hash[addMe[i]] != true) {
	    		addToMe.push(addMe[i].__elate__ ? addMe[i].__elate__.className : addMe[i]);
	    	}

	        hash[addMe[i]]=true;
	    } 
	}

	else if (addToMe.indexOf(addMe) == -1)
		addToMe.push(addMe.__elate__ ? addMe.__elate__.className : addMe);
}









ELATE.create("Elated", function() {
	this.inheritsFrom = function(target) {
		if(target == this || target == this.__elate__.className)
			return true;

		if(typeof target == "object") {
			if(target.__elate__ !== undefined)
				target = target.getClassName();

			else return console.error("target is not an Elated Object", target);
		}

		if(typeof target == "string")
			return this.__buildLog.indexOf(target) != -1;

		else return console.error("target must be either an Elated Object or a String ", target);
	}

	this.getClassName = function() {
		return this.__elate__.className;
	}
});










