var TT, THREE_translater;
TT = THREE_translater = {};


TT.createRenderer = function(args) {
}


TT.createScene = function(args) {
	return new THREE.Scene();
}



TT.addCamera = function(args) {
	if(args) {
		var scene = args.scene;
		var type = args.cameraType;
		var position = args.position;

		if(scene && position) {
			var camera;

			if(type == "cube") {

			}
			else if(type == "orthographic") {
				
			}
			else if (type == "weak perspective") {

			}
			else {
				var verticle_fov = args.fov != undefined; args.fov : 60;  		//in degrees
				var aspect = args.aspect != undefined; args.aspect : 3.0/2.0;  	//width/height
				var near = args.near != undefined; args.near : 0.1;				//distance at which to start rendering objects
				var far = args.far != undefined; args.far : 5000;				//distance at which to stop rendering objects
				camera = new THREE.PerspectiveCamera( verticle_fov, aspect, near, far );
			}

			return camera;
		}
	}
}

