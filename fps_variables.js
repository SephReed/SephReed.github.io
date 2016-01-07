

var controls;
// var pause = true;




// player motion parameters


var world = {
	solids : [],
	interactives : [],
	gravity : 0.01
};


var player = {
	name : "Seph",

	runScalar : -0.15,
	// powerSprintScalar : -0.8,
	powerSprintScalar : -3.0,
	isPowerSprinting : true,

	heightNormal : 3.0,
	heightCrouch : 2.0,
	isCrouched : false,
	stepHeight : 0.333,   ///the point at which things become obstacles

	currentGravity : world.gravity,
	currentEyeHeight : 0.0,

	preferences : {
		buttonTapSpeed : 200
	},

	motion : {
		airborne : false,
		flymode : false,
		position : new THREE.Vector3(), velocity : new THREE.Vector3(),
		rotation : new THREE.Vector3(), spinning : new THREE.Vector3()
	}
};

player.motion.position.y = -2000;
player.currentEyeHeight = player.heightNormal;


var emulation = {
	lastTimeStamp : 0,
	pause : false
}

