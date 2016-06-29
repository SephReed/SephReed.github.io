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
***************/





var spawner = PINE.createNeedle("[spawner]");

spawner.addFunction( PINE.ops.COMMON, function(initMe) {

	var indexer = El.attr(initMe, "indexer") || "i";

	U.assertKey(initMe, "_pine_.spawner");
	initMe._pine_.spawner.indexer = indexer;

	//
	var emptyHolders = initMe._pine_.spawner.empty_placeholders = El.byTag(initMe, "spawnerEmpty") || [];
	while (emptyHolders.length > 0)
		emptyHolders[0].remove();
	
	
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
		var setpvar = El.attr(initMe, "setpvar");
		var i_pvars = {};

		if(setpvar) {
			setpvar = setpvar.split(/[;=]/g);
			for(var i_s = 0; i_s < setpvar.length; i_s+=2) {
				i_pvars[setpvar[i_s]] = setpvar[i_s+1];
			}
		}

		if(count <= 0) {
			var addUs = initMe._pine_.spawner.empty_placeholders;
			for(var i = 0; i < addUs.length; i++) {
				initMe.appendChild(addUs[i]);
			}
		}

		for(var i = 0; i < count; i++)  {
			var i = i;

			// var addMe = PINE.deepCloneNode(spawn);
			var addMe = spawn.cloneNode(true);
			U.getnit(addMe, "PVARS."+indexer, i);
			
			addMe.setAttribute("scopeVarDoesNothing", indexer+'='+i);

			initMe.appendChild(addMe);

			for(var i_p in i_pvars) {
				// console.log("searching for ", i_pvars[i_p], addMe);
				addMe.PVARS[i_p] = pnv.getVarFrom(i_pvars[i_p], addMe);
				// PINE.var(i_pvars[i_p], addMe, function(result) {
				// 	console.log("result ", result);
				// 	addMe.PVARS[i_p] = result;
				// });
			}
		}


		PINE.updateAt(initMe);
	}
}









