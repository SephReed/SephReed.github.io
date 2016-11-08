/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*                 4.8       /\
*          by: Seph Reed   X  X
*                           \/
*
********************************************/

"use strict"


/****************
*    trigger
***************/


// PINE.createNeedle("[trigger]").addFunction( function(initMe) {

// 	var triggerType = El.attr(initMe, "trigger");

// 	initMe.addEventListener(triggerType, function(event) {
// 		var target = El.attr(initMe, "target");
// 		var fn = El.attr(initMe, "fn");
// 		var args = El.attr(initMe, "args");

// 		El.byId(target).FNS[fn]();
// 	}, false);
	
// });






/****************
*    spawner
*
*	Spawner is the ultimate multi tool for arrays and repeatable html elements
***************/





PINE.createNeedle("[spawner]", function() {
	var needle = this;

	needle.addAttArg("source", "spawner", "pvar");
	needle.addAttArg("indexer", ["spawnerIndexer", "indexer"], "string", "i");
	needle.addAttArg("autorun", ["spawnerAutorun", "autorun"], "boolean", true);
	needle.addAttArg("count", ["spawnerCount", "count"], "number");
	needle.addAttArg("limit", ["spawnerLimit", "limit"], "number", -1);


	needle.FNS.spawnerUpdate = function() {
		var instance = this;
		var domNode = instance.domNode;
		var spawn = instance.spawn;

		if(spawn){

			for(var i = 0; i < domNode.childNodes.length;) {
				var child = domNode.childNodes[i];
				console.log(child);
				
				if(El.attr(child, "spawn") !== undefined)
			    	domNode.removeChild(child);

			    else i++;
			}

			
			var spawnerSource = this.attArg.source;
			var count = this.attArg.count;

			if(spawnerSource == undefined && count == undefined)
				PINE.err("unset spawner source");

			else if(count == undefined)
				count = spawnerSource.length;


			var indexer = this.attArg.indexer;
			var limit = this.attArg.limit;	
			if(limit != -1)
				count = Math.min(limit, count);

			for(var i = 0; i < count; i++)  {
					//
				var addMe = spawn.cloneNode(true);
				U.getnit(addMe, "PVARS."+indexer, i);

				domNode.appendChild(addMe);
			}


			return PINE.updateAt(domNode);
		}
	}

	needle.addInitFn(function() {
		var initMe = this.domNode;
		
		var branches = initMe.childNodes;
		var spawn = null;
		for(var i = 0; i < initMe.childNodes.length && !spawn; i++)  {
			var branch = initMe.childNodes[i];
			if(El.attr(branch, "spawn") !== undefined)
				spawn = branch;
		}

		if(spawn)  {
			this.spawn = spawn;
			initMe.removeChild(spawn);
		}
	});


	needle.addInitFn(function() {
		if(this.attArg.autorun == true)
			this.FNS.spawnerUpdate();
	});

});






























PINE.createNeedle("[treeSpawner]", function(tree) {

	tree.addAttArg("source", "treeSpawner", "pvar");
	tree.addAttArg("depthLimit", ["treeSpawnerDepthLimit", "depthLimit"], "number", -1);
	tree.addAttArg("branchRoute", ["treeSpawnBranchRoute", "branchRoute"], "string");

	tree.FNS.treeSpawnerUpdate = function() {
		var instance = this;

		for(var i = 0; i < initMe.childNodes; i++) {
			var child = initMe.childNodes[i];
			if(El.attr(child, "treeSpawn") !== undefined) {
				child.remove();
				i--;
			}
		}

	
		var spawnFrom = instance.PVARS.spawnFrom || instance.attArg.source;
		var branchRoute = instance.attArg.branchRoute;

		if(spawnFrom && branchRoute && branchRoute.length)
			spawnFrom = U.get(spawnFrom, branchRoute);

		var depthLimit = instance.PVARS.spawnFrom || instance.attArg.depthLimit;

		// if(depthLimit == -1 || depthLimit > 0) {
		var type = typeof spawnFrom;
		var correctType = type == "object";
		var correctDepthing = depthLimit == -1 || depthLimit > 0;

		if(correctDepthing && correctType) {	
			depthLimit > 0 ? depthLimit-- : null;

			for(var key in spawnFrom) {
				var addMe = El.cloneAndInit(treeSpawn, true);
				addMe.PVARS.spawnFrom = spawnFrom[key];
				addMe.PVARS.depthLimit = depthLimit;

				El.attr(addMe, "treeSpawner", "");
				El.attr(addMe, "treeSpawn", "");


				if(args.childNodesKey)
					addMe.PVARS[args.childNodesKey] = spawnFrom;

				// addMe.PVARS.spawnFrom = spawnFrom[key];
				// addMe.PVARS[key] = spawnFrom[key];	
				addMe.PVARS.key = key;
				addMe.PVARS.treeDepth = initMe.PVARS.treeDepth+1;

				initMe.insertBefore(addMe, spawnInsertLocation);
			}
		}
		

		return PINE.updateAt(initMe);
	}


	tree.addInitFn( PINE.ops.INIT, function() {
		var initMe = this.domNode;

		if(initMe.PVARS.key == undefined) 
			initMe.PVARS.key = El.attr(initMe, "treeSpawner");	

		if(initMe.PVARS.treeDepth == undefined)
			initMe.PVARS.treeDepth = 0;
	});


	tree.addInitFn(function() {
		var instance = this;
		var initMe = instance.domNode;

		var treeSpawn = initMe.cloneNode(true);
		instance.insertAt = El.firstOfTag(initMe, "treeSpawns");



		if(!instance.insertAt) 
			return PINE.err("tree spawner has no treeSpawns sub element '<treeSpawns></treeSpawns>'", initMe);

		instance.FNS.treeSpawnerUpdate();
	});

});

// treeSpawner.getArgs = function(initMe) {
// 	var out = {};

// 	//spawn source
// 	var spawnFrom_att = El.attr(initMe, "treeSpawner");
// 	out.spawnFrom = PINE.nodeScopedVar(initMe, spawnFrom_att);
// 		//
// 	if(out.spawnFrom === undefined) 
// 		return PINE.err("tree spawner has no root object to spawn from", initMe, spawnFrom_att);

// 	var type = typeof out.spawnFrom;
// 	if(type != "object" && type != "function") 	
// 		return null;

// 	//depth limit
// 	var spawnDepthLimit_att = El.attr(initMe, "tSpawnDepthLimit");
// 	if(spawnDepthLimit_att === undefined)
// 		out.spawnDepthLimit = -1;
// 	else 
// 		out.spawnDepthLimit = parseInt(spawnDepthLimit_att);
// 			//
// 	out.spawnDepthLimit = Math.max(-1, out.spawnDepthLimit);


// 	//childNodes rule
// 	out.childNodesKey = El.attr(initMe, "tSpawnChildNodesKey");


// 	return out;
// }


// var countQuit = 0;


// treeSpawner.addFunction( PINE.ops.COMMON, function(initMe) {

// 	var treeSpawn = initMe.cloneNode(true);
// 	var spawnInsertLocation;
// 	for(var i = 0; !spawnInsertLocation && i < initMe.childNodes.length; i++) {
// 		var child = initMe.childNodes[i];
// 		if(child.tagName == "TREESPAWNS")
// 			spawnInsertLocation = child;
// 	}

// 	if(!spawnInsertLocation) 
// 		return PINE.err("tree spawner has no treeSpawns sub element '<treeSpawns></treeSpawns>'", initMe);

	
// 	PINE.addNodeFunction(initMe, "tSpawnUpdate", function() {
// 		// countQuit++;

// 		// if(countQuit > 1000)
// 		// 	return;
// 			//
// 		for(var i = 0; i < initMe.childNodes; i++) {
// 			var child = initMe.childNodes[i];
// 			if(El.attr(child, "treeSpawn") !== undefined) {
// 				child.remove();
// 				i--;
// 			}
// 		}

// 		var args = treeSpawner.getArgs(initMe);

// 		if(args) {
// 			var spawnFrom = args.spawnFrom;

// 			if(spawnFrom && args.childNodesKey)
// 				spawnFrom = spawnFrom[args.childNodesKey];

// 			var depthLimit = args.spawnDepthLimit;

// 			// if(depthLimit == -1 || depthLimit > 0) {
// 			var type = typeof spawnFrom;
// 			var correctType = type == "object" || type == "string";
// 			var correctDepthing = depthLimit == -1 || depthLimit > 0;

// 			if(correctDepthing) {	
// 				depthLimit > 0 ? depthLimit-- : null;

// 				for(var key in spawnFrom) {
// 					var addMe = treeSpawn.cloneNode(true);
// 					// El.attr(addMe, "treeSpawner", key);
// 					El.attr(addMe, "treeSpawner", "spawnFrom");
// 					El.attr(addMe, "treeSpawn", '');
// 					El.attr(addMe, "tSpawnDepthLimit", depthLimit);

// 					// if(arg.childNodesKey)
// 						// El.attr(addMe, "tSpawnChildNodesKey", arg.childNodesKey);

// 					if(addMe.PVARS === undefined)
// 						addMe.PVARS = {};

// 					if(args.childNodesKey)
// 						addMe.PVARS[args.childNodesKey] = spawnFrom;

// 					addMe.PVARS.spawnFrom = spawnFrom[key];
// 					// addMe.PVARS[key] = spawnFrom[key];	
// 					addMe.PVARS.key = key;
// 					addMe.PVARS.t_depth = initMe.PVARS.t_depth+1;

// 					initMe.insertBefore(addMe, spawnInsertLocation);
// 				}
// 			}
// 		}

// 		PINE.updateAt(initMe);
// 	});

// 	initMe.FNS.tSpawnUpdate();
	
// });

















