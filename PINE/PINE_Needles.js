/******************************************
*          ____   _   _   _   ____
*         |    \ | | | \ | | |  __|
*         |  = | | | |  \| | | |__
*         |  __/ | | | \   | |  __|
*         | |    | | | |\  | | |__ 
*         |_|    |_| |_| \_| |____|
*
*                 4.0       /\
*          by: Seph Reed   X  X
*                           \/
*
********************************************/

"use strict"


/****************
*    trigger
***************/


PINE.createNeedle("[trigger]").addFunction({
	step_type: PINE.ops.FINALIZER,
	fn: function(initMe, needle) {

		var triggerType = initMe.attributes.trigger.value;


		initMe.addEventListener(triggerType, function(event) {
			var target = initMe.attributes.target.value;
			var fn = initMe.attributes.fn.value;
			var args = El.attr(initMe, "args");

			El.byId(target).each(function() {
				this.FNS[fn]();
			});
		}, false);
		
	}
});






/****************
*    spawner
***************/





var spawner = PINE.createNeedle("[spawner]");

spawner.addFunction({
	step_type : PINE.ops.INITIALIZER,
	fn : function(initMe, needle) {

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



		PINE.addFunctionToNode(initMe, "update", function() {
			console.log("calling needle update")
			needle.update(initMe);
		});

	}
});


spawner.addFunction({
	step_type : PINE.ops.POPULATER,
	fn : function(initMe, needle) {
		if( El.attr(initMe, "autoRun") !== "false")
			needle.update(initMe);
	}
});


spawner.update = function(initMe) {
	// var keyString = initMe.attributes.spawner.value;
	// var spawnerSource = pnv.getVarFrom(keyString, initMe);



	// console.log(array)
	// console.log(initMe);
	// alert("pause needle ~100");

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









