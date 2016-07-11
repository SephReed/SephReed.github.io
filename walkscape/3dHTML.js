

function findParentVar(currentNode, targetNodeTag, varName, acceptCurrent) {
	if(acceptCurrent === true && currentNode.tagName == targetNodeTag) 
		return currentNode.PVARS[varName];
	
	else if(currentNode.parentNode && currentNode.parentNode.PVARS)
		return findParentVar(currentNode.parentNode, targetNodeTag, varName, true);

	else
		return undefined;
}




PINE("3d", PINE.ops.POLISH, function(initMe){
	var initMe.PVARS.framework = El.attr(initMe, "framework");
});


PINE("scene", PINE.ops.POLISH, function(initMe){
	var framework = findParentVar(initMe, "3d", "framework");
	initMe.PVARS.scene = framework.createScene();
});


PINE("camera", PINE.ops.POLISH, function(initMe){
	var framework = findParentVar(initMe, "3d", "framework");
	var scene = findParentVar(initMe, "scene", "scene");

	var cameraArgs_att = El.attr(initMe, "cameraArgs");
	var args = cameraArgs_att != undefined; window[cameraArgs_att] : {};

	args.scene = scene;
	var pos = args.position = {};
	pos.x = 0;
	pos.y = 0;
	pos.z = 0;

	framework.addCamera(args);

});
















