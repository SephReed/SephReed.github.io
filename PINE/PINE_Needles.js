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

spawner.addFunction( PINE.ops.STATIC, function(initMe) {

	var indexer = El.attr(initMe, "indexer") || "i";

	U.assertKey(initMe, "_pine_.spawner");
	initMe._pine_.spawner.indexer = indexer;
	
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


		for(var i = 0; i < count; i++)  {
			var i = i;

			// var addMe = PINE.deepCloneNode(spawn);
			var addMe = spawn.cloneNode(true);
			U.getnit(addMe, "PVARS."+indexer, i);
			
			addMe.setAttribute("scopeVarDoesNothing", indexer+'='+i);

			initMe.appendChild(addMe);

		}


		PINE.updateAt(initMe);
	}
}









