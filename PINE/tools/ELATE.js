var ELATE = {};

ELATE.Abstract = function() {
	console.error("can not call abstract fn", this);
}

ELATE.Elations = {};
ELATE.get = function(name) {
	return ELATE.Elations[name]
}


ELATE.Elated = function() {}
ELATE.Elated.prototype.inheritsFrom = function(target) {
	if(target == this || target == this.__elate__.className)
		return true;

	if(typeof target == "object") {
		if(target.__elate__ !== undefined)
			target = target.getClassName();

		else return PINE.err("target is not an Elated Object", target);
	}

	if(typeof target == "string")
		return this.super[target] !== undefined;

	else return PINE.err("target must be either an Elated Object or a String ", target);
};

ELATE.Elated.prototype.getClassName = function() {
	this.__elate__.className;
};


ELATE.noCopy = {};
ELATE.noCopy.fromSuper = ["super", "__elate__", "className"]
ELATE.noCopy.fromBuilder = ["constructor", "super", "__elate__", "extend", "isAbstract"];


ELATE.create = function(name, planFn) {
	var buildMe = new ELATE.class.ClassPlanner();
	planFn.call(buildMe);

	var out = function() {
		if(this.__elate__ && this.__elate__.isAbstract)
			return console.error("can not construct abstract class", name);

		if(buildMe.constructor)
			buildMe.constructor.apply(this, arguments);
	}

	out.prototype.__elate__ = {}
	out.prototype.__elate__.isAbstract = buildMe.__elate__.isAbstract;
	out.prototype.__elate__.className = name;
	out.prototype.isElated = true;
	// out.prototype.__semiprivate__ = {};

	out.prototype.super = {};

	var hasSupers = false;
	for(var superName in buildMe.__elate__.supers) {
		hasSupers = true;
		break;
	}

	if(hasSupers == false)
		buildMe.__elate__.supers["Elated"] = ELATE.Elated;


	for(var superName in buildMe.__elate__.supers) {
			//
		var superClass = buildMe.__elate__.supers[superName];
		out.prototype.super[superName] = superClass;

		// console.log(superName);

		for(var subClass in superClass.prototype.super) {
			// console.log("sub - ",subClass);
			out.prototype.super[subClass] = superClass.prototype.super[subClass];
		}

		for(var proto in superClass.prototype) {
			if(ELATE.noCopy.fromSuper.includes(proto) == false){
				out.prototype[proto] = superClass.prototype[proto];
			}
		}
	}

	for(var proto in buildMe) {
		if(ELATE.noCopy.fromBuilder.includes(proto) == false) {
				//
		  	var addMe = buildMe[proto];
			if(addMe == "abstract")
				addMe = ELATE.Abstract;

			out.prototype[proto] = addMe;
		}
	}


	if(buildMe.__elate__.isAbstract == false) {
		var badFns = [];
		for(var proto in out.prototype) {
			if(out.prototype[proto] == ELATE.Abstract)
				badFns.push(proto);
		}

		if(badFns.length)
			return console.error("non abstract class '"+name+"' has abstract functions:", badFns, out);
	}

	ELATE.Elations[name] = out;

	return out;
}


ELATE.class = {};
ELATE.class.ClassPlanner = function() {
	var private = this.__elate__ = {}
	// this.__semiprivate__ = {};
	private.isAbstract = false;
	private.supers = {};
}

ELATE.class.ClassPlanner.prototype.isAbstract = function() {
	this.__elate__.isAbstract = true;
};


ELATE.class.ClassPlanner.prototype.extend = function(extend) {
	var build = ELATE.get(extend);
	this.__elate__.supers[extend] = build;
};














