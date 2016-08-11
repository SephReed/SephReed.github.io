/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*                 4.2       /\
*          by: Seph Reed   X  X
*                           \/
*
********************************************/

"use strict"


/****************
*    trigger
***************/


PINE.createNeedle("[trigger]").addFunction( function(initMe) {

	var triggerType = El.attr(initMe, "trigger");

	initMe.addEventListener(triggerType, function(event) {
		var target = El.attr(initMe, "target");
		var fn = El.attr(initMe, "fn");
		var args = El.attr(initMe, "args");

		El.byId(target).FNS[fn]();
	}, false);
	
});






/****************
*    spawner
*
*	Spawner is the ultimate multi tool for arrays and repeatable html elements
***************/





var spawner = PINE.createNeedle("[spawner]");

spawner.addFunction( PINE.ops.COMMON, function(initMe) {

	var indexer = El.attr(initMe, "indexer") || "i";
	U.set(initMe, "_pine_.spawner.indexer", indexer);

	//
	var nospawnCollection = El.byTag(initMe, "nospawn");
	var emptyHolders = [];
	if(nospawnCollection.length > 0)
		emptyHolders = [].slice.call(nospawnCollection);
	initMe._pine_.spawner.empty_placeholders = emptyHolders;
	
	
	
	var branches = initMe.childNodes;
	var spawn = null;
	for(var i = 0; i < branches.length && !spawn; i++)  {
		var branch = branches[i];
		var atts = branch.attributes;

		for(var i_att = 0; atts && i_att < atts.length && !spawn; i_att++)  {
			if("spawn" == atts[i_att].name)  {
				spawn = branch;	
			}
		}
	}
	if(spawn)  {
		initMe._pine_.spawner.spawn = spawn;
		initMe.removeChild(spawn);

		for(var i = 0; i < emptyHolders.length; i++)
			emptyHolders[i].remove(); 
			
	}


	var needle = this;
	PINE.addNodeFunction(initMe, "update", function() {
		console.log("calling needle update")
		needle.update(initMe);
	});

});


spawner.addFunction( function(initMe) {
	if( El.attr(initMe, "autoRun") !== "false")
		this.update(initMe);
});


spawner.update = function(initMe) {

	var spawn = initMe._pine_.spawner.spawn;

	if(spawn){

		for(var i = 0; i < initMe.childNodes.length;) {
			var child = initMe.childNodes[i];
			
			if(child.attributes && child.attributes.spawn)
		    	initMe.removeChild(child);

		    else i++;
		}

		var count;
		var countAtt = initMe.attributes.count;
		var spawnerSource;

		if(countAtt) {
			count = parseInt(countAtt.value);
			// if(countAtt)
			// count = pnv.getVarFrom(countAtt.value, initMe);
		}
		else {
			var keyString = initMe.attributes.spawner.value;
			spawnerSource = pnv.getVarFrom(keyString, initMe);

			if(spawnerSource)
				count = spawnerSource.length;

			else return;
		}

		var indexer = initMe._pine_.spawner.indexer;
		var setpvar = El.attr(initMe, "spawnerSetPvar");
		var i_pvars = {};

		//TODO: this should probably be a function of PINE_Var.js
		if(setpvar) {
			PINE.err("spawnerSetPvar is deprecated!!  Use  <... spawn pvars='"+setpvar+"'> instead.", initMe);

			setpvar = setpvar.split(/[;=]/g);
			for(var i_s = 0; i_s < setpvar.length; i_s+=2) {
				i_pvars[setpvar[i_s]] = setpvar[i_s+1];
			}
			// setpvar = setpvar.split(/[;=]/g);
			// var pvarSettings = setpvar.split(';');
			// for(var i_p in pvarSettings) {
			// 	var setMe = 
			// 	for(var i_s = 0; i_s < setpvar.length; i_s+=2) {
			// 		i_pvars[setpvar[i_s]] = setpvar[i_s+1];
			// 	}	
			// }
		}

		if(count <= 0) {
			var addUs = initMe._pine_.spawner.empty_placeholders;
			for(var i = 0; i < addUs.length; i++) {
				initMe.appendChild(addUs[i]);
			}
		}

		for(var i = 0; i < count; i++)  {
			var i = i;

			var addMe = spawn.cloneNode(true);
			U.getnit(addMe, "PVARS."+indexer, i);
			
			addMe.setAttribute("scopeVarDoesNothing", indexer+'='+i);

			initMe.appendChild(addMe);

			//for each of the set vars in spawnerSetPvar attribute, set she pvar to it's value relative to domNode
			for(var i_p in i_pvars) { 
				addMe.PVARS[i_p] = pnv.getVarFrom(i_pvars[i_p], addMe);
			}
		}


		PINE.updateAt(initMe);
	}
}









var treeSpawner = PINE.createNeedle("[treeSpawner]");

treeSpawner.getArgs = function(initMe) {
	var out = {};

	//spawn source
	var spawnFrom_att = El.attr(initMe, "treeSpawner");
	out.spawnFrom = PINE.nodeScopedVar(initMe, spawnFrom_att);
		//
	if(out.spawnFrom === undefined) 
		return PINE.err("tree spawner has no root object to spawn from", initMe, spawnFrom_att);

	var type = typeof out.spawnFrom;
	if(type != "object" && type != "function") 	
		return null;

	//depth limit
	var spawnDepthLimit_att = El.attr(initMe, "tSpawnDepthLimit");
	if(spawnDepthLimit_att === undefined)
		out.spawnDepthLimit = -1;
	else 
		out.spawnDepthLimit = parseInt(spawnDepthLimit_att);
			//
	out.spawnDepthLimit = Math.max(-1, out.spawnDepthLimit);


	//childNodes rule
	out.childNodesKey = El.attr(initMe, "tSpawnChildNodesKey");


	return out;
}


// var countQuit = 0;
treeSpawner.addFunction( PINE.ops.INIT, function(initMe) {
	if(initMe.PVARS.key == undefined) 
		initMe.PVARS.key = El.attr(initMe, "treeSpawner");	

	if(initMe.PVARS.t_depth == undefined)
		initMe.PVARS.t_depth = 0;
});

treeSpawner.addFunction( PINE.ops.COMMON, function(initMe) {

	var treeSpawn = initMe.cloneNode(true);
	var spawnInsertLocation;
	for(var i = 0; !spawnInsertLocation && i < initMe.childNodes.length; i++) {
		var child = initMe.childNodes[i];
		if(child.tagName == "TREESPAWNS")
			spawnInsertLocation = child;
	}

	if(!spawnInsertLocation) 
		return PINE.err("tree spawner has no treeSpawns sub element '<treeSpawns></treeSpawns>'", initMe);

	
	PINE.addNodeFunction(initMe, "tSpawnUpdate", function() {
		// countQuit++;

		// if(countQuit > 1000)
		// 	return;
			//
		for(var i = 0; i < initMe.childNodes; i++) {
			var child = initMe.childNodes[i];
			if(El.attr(child, "treeSpawn") !== undefined) {
				child.remove();
				i--;
			}
		}

		var args = treeSpawner.getArgs(initMe);

		if(args) {
			var spawnFrom = args.spawnFrom;

			if(spawnFrom && args.childNodesKey)
				spawnFrom = spawnFrom[args.childNodesKey];

			var depthLimit = args.spawnDepthLimit;

			// if(depthLimit == -1 || depthLimit > 0) {
			var type = typeof spawnFrom;
			var correctType = type == "object" || type == "string";
			var correctDepthing = depthLimit == -1 || depthLimit > 0;

			if(correctDepthing) {	
				depthLimit > 0 ? depthLimit-- : null;

				for(var key in spawnFrom) {
					var addMe = treeSpawn.cloneNode(true);
					// El.attr(addMe, "treeSpawner", key);
					El.attr(addMe, "treeSpawner", "spawnFrom");
					El.attr(addMe, "treeSpawn", '');
					El.attr(addMe, "tSpawnDepthLimit", depthLimit);

					// if(arg.childNodesKey)
						// El.attr(addMe, "tSpawnChildNodesKey", arg.childNodesKey);

					if(addMe.PVARS === undefined)
						addMe.PVARS = {};

					if(args.childNodesKey)
						addMe.PVARS[args.childNodesKey] = spawnFrom;

					addMe.PVARS.spawnFrom = spawnFrom[key];
					// addMe.PVARS[key] = spawnFrom[key];	
					addMe.PVARS.key = key;
					addMe.PVARS.t_depth = initMe.PVARS.t_depth+1;

					initMe.insertBefore(addMe, spawnInsertLocation);
				}
			}
		}

		PINE.updateAt(initMe);
	});

	initMe.FNS.tSpawnUpdate();
	
});

















