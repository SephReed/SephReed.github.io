
// init 3D stuff

function makeSkybox( urls, size ) {
	var skyboxCubemap = THREE.ImageUtils.loadTextureCube( urls );
	skyboxCubemap.format = THREE.RGBFormat;

	var skyboxShader = THREE.ShaderLib['cube'];
	skyboxShader.uniforms['tCube'].value = skyboxCubemap;

	return new THREE.Mesh(
		new THREE.BoxGeometry( size, size, size ),
		new THREE.ShaderMaterial({
			fragmentShader : skyboxShader.fragmentShader, vertexShader : skyboxShader.vertexShader,
			uniforms : skyboxShader.uniforms, depthWrite : false, side : THREE.BackSide
		})
	);
}

function makePlatform( jsonUrl, textureUrl, textureQuality ) {
	var placeholder = new THREE.Object3D();

	var texture = THREE.ImageUtils.loadTexture( textureUrl );
	texture.minFilter = THREE.LinearFilter;
	texture.anisotropy = textureQuality;

	var loader = new THREE.JSONLoader();
	loader.load( jsonUrl, function( geometry ) {

		geometry.computeFaceNormals();

		var platform = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ map : texture }) );

		platform.name = "platform";

		placeholder.add( platform );
		world.solids.push(platform);
		platform.castShadow = true;
		platform.receiveShadow = true;
	});

	return placeholder;
}

// var renderer = new THREE.WebGLRenderer({ antialias : true });
// renderer.setPixelRatio( window.devicePixelRatio );

// var camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 9000 );

// controls = new THREE.PointerLockControls( camera );

// var scene = new THREE.Scene();

// scene.add( camera );


var skybox =  makeSkybox( [
	'image_assets/skybox/in_the_clouds/px.jpg', // right
	'image_assets/skybox/in_the_clouds/nx.jpg', // left
	'image_assets/skybox/in_the_clouds/py.jpg', // top
	'image_assets/skybox/in_the_clouds/ny.jpg', // bottom
	'image_assets/skybox/in_the_clouds/pz.jpg', // back
	'image_assets/skybox/in_the_clouds/nz.jpg'  // front
], 8000 );

scene.add(skybox)





// load skybox

// var cubeMap = new THREE.CubeTexture( [] );
// cubeMap.format = THREE.RGBFormat;

// var loader = new THREE.ImageLoader();
// loader.load( 'image_assets/skybox/sunny_day_horizon/cubeflat.png', function ( image ) {

// 	var getSide = function ( x, y ) {

// 		var size = 1024;

// 		var canvas = document.createElement( 'canvas' );
// 		canvas.width = size;
// 		canvas.height = size;

// 		var context = canvas.getContext( '2d' );
// 		context.drawImage( image, - x * size, - y * size );

// 		return canvas;

// 	};

// 	cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
// 	cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
// 	cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
// 	cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
// 	cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
// 	cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
// 	cubeMap.needsUpdate = true;

// } );

// var cubeShader = THREE.ShaderLib[ 'cube' ];
// cubeShader.uniforms[ 'tCube' ].value = cubeMap;

// var skyBoxMaterial = new THREE.ShaderMaterial( {
// 	fragmentShader: cubeShader.fragmentShader,
// 	vertexShader: cubeShader.vertexShader,
// 	uniforms: cubeShader.uniforms,
// 	depthWrite: false,
// 	side: THREE.BackSide
// } );

// var skyBox = new THREE.Mesh(
// 	new THREE.BoxGeometry( 5000, 5000, 5000 ),
// 	skyBoxMaterial
// );

// scene.add( skyBox );






// var lastChild;
// var loader = new  THREE.ColladaLoader();
// loader.options.convertUpAxis = true;
// loader.load('https://cdn.rawgit.com/wpdildine/wpdildine.github.com/master/models/monkey.dae', function (collada){
// 	dae = collada.scene;
// 	dae.scale.x = dae.scale.y = dae.scale.z = 3;
// 	dae.traverse(function (child){
// 		if (child.colladaId == "Suzanne"){
// 			child.traverse(function(e){
// 				e.castShadow = true;
// 				e.receiveShadow = true;
// 				if (e.material instanceof THREE.MeshPhongMaterial){
// 					e.material.needsUpdate = true;
// 				}	
			
// 			});
// 		}
// 		else if (child.colladaId == "Plane"){
// 			child.traverse(function(e){
// 				e.castShadow = true;
// 				e.receiveShadow = true;
// 			});
// 		}	
// 		lastChild = child;
// 	});
// 	dae.updateMatrix();
// 	scene.add(dae);
// });	


var loader = new  THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load('models/SimpleHouse.dae', function (collada){
	dae = collada.scene;
	dae.scale.x = dae.scale.y = dae.scale.z = 3.2;
	dae.traverse(function (child){
		if (child.colladaId == "Suzanne"){
			child.traverse(function(e){
				e.castShadow = true;
				e.receiveShadow = true;
				if (e.material instanceof THREE.MeshPhongMaterial){
					e.material.needsUpdate = true;
				}	
			
			});
		}
		else if (child.colladaId == "Plane"){
			child.traverse(function(e){
				e.castShadow = true;
				e.receiveShadow = true;
			});
		}	
		
	});
	dae.updateMatrix();
	dae.position.y = -414;
	dae.position.x = 200;
	dae.position.z = 805;

	dae.children[0].children[0].castShadow = true;
	dae.children[0].children[0].receiveShadow = true;

	scene.add(dae);
	world.solids.push(dae);
});	

		











// var sound1 = new THREE.Audio( listener );
// sound1.load( 'sounds/tracks/wind_and_chimes.mp3' );
// sound1.setRefDistance( 200 );
// sound1.autoplay = true;
// skybox.add( sound1 );



var plat = makePlatform(
	'models/platform/platform.json',
	'models/platform/platform.jpg',
	renderer.getMaxAnisotropy()
);
scene.add( plat );



var geometry = new THREE.SphereGeometry( 5, 16, 16 );
var material = new THREE.MeshNormalMaterial( );
material.wireframe = true;
var sphere = new THREE.Mesh( geometry, material );
sphere.name = "sphere";
sphere.interaction = function() {
	console.log("yo");
	sphere.rotation.y += 0.1;
}
world.interactives.push(sphere);
scene.add( sphere );








geometry = new THREE.BoxGeometry( 0.3, 6, 3 );
material = new THREE.MeshNormalMaterial(  );
var door = new THREE.Mesh( geometry, material );
door.name = "door";
door.position.x = 215.3;
door.position.y = -410.6;
door.position.z = 801.2;
door.castShadow = true;
door.receiveShadow = true;
scene.add( door );
world.solids.push(door);


door.interaction = function() {
	if(door.rotation.y != 1.5) {
		door.rotation.y = 1.5;
		door.position.x = 216.8;
		door.position.z = 802.6;
	}
	else {
		door.rotation.y = 0.0;
		door.position.x = 215.3;
		door.position.z = 801.2;
	}
}
world.interactives.push(door);





geometry = new THREE.BoxGeometry( 5, 5, 5 );
material =  new THREE.MeshPhongMaterial({ color: 0x999900 });
var box = new THREE.Mesh( geometry, material );
box.name = "box";
// door.position.x = 215.3;
// door.position.y = -410.6;
// door.position.z = 801.2;
box.castShadow = true;
box.receiveShadow = true;
scene.add( box );
world.solids.push(box);


box.interaction = function() {
	box.position.z += 0.1;
}
world.interactives.push(box);



geometry = new THREE.BoxGeometry( 10, 1, 10 );
material =  new THREE.MeshPhongMaterial({ color: 0x990099 });
var box = new THREE.Mesh( geometry, material );
box.name = "box";
// door.position.x = 215.3;
// door.position.y = -410.6;
// door.position.z = 801.2;
box.castShadow = true;
box.receiveShadow = true;
scene.add( box );
world.solids.push(box);






// var door_intr = {
// 	mesh : door,
// 	action : 
// }
// world.interactives.push(door_intr);





// geometry = new THREE.BoxGeometry( 10000, 100, 10000 );
// material = new THREE.MeshPhongMaterial({color: 0x6666FF, refractionRatio: 0.5, opacity: 0.5, transparent: true } );
// // material = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5 } )
// cube = new THREE.Mesh( geometry, material );
// cube.name = "water";
// cube.translateY(-650.5);
// scene.add( cube );
// world.solids.push(cube);

// cube.fog = new THREE.Fog( 0xf2f7ff, 1, 5000 );










var hills = generateTerrain();
hills.name = "hills";
hills.translateY(-800.0);
hills.castShadow = true;
hills.receiveShadow = true;
scene.add( hills );
world.solids.push(hills);












// var treeGroup = new THREE.Group();
// var treeSprite = new THREE.ImageUtils.loadTexture( "image_assets/sprites/pinetree.png" );
// var treeMaterial = new THREE.SpriteMaterial( { map: treeSprite, color: 0xffffff, fog: true } );
// // var treeMaterial = new THREE.MeshLambertMaterial( { map: treeSprite, color: 0xffffff, fog: true } );
// // var treeMaterial = new THREE.SpriteMaterial( { map: treeSprite, color: 0xffffff, fog: true } );

// for ( var a = 0; a < 100; a ++ ) {

// 	var vertex = new THREE.Vector3();
// 	vertex.x = Math.random() * 200 - 100;
// 	vertex.z = Math.random() * 200 - 100;
// 	// vertex.y = 1000;



// 	var t_raycast = new THREE.Raycaster();
// 	t_raycast.ray.direction.set( 0, -1, 0 );
// 	t_raycast.ray.origin.copy(vertex);

// 	// var hits = t_raycast.intersectObject( hills );
// 	// console.log(hits.length);

// 	// if( hits.length != 0 ) {
// 	// 	vertex.y -= hits[0].distance;
// 	// 	console.log(hits[0].distance);
// 	// 	// vertex.y -= 780;
// 	// }


// 	var sprite = new THREE.Sprite( treeMaterial );

// 	sprite.position.copy(vertex);

// 	treeGroup.add( sprite );

// }
// scene.add( treeGroup );





geometry = new THREE.Geometry();
var sprite = THREE.ImageUtils.loadTexture( "image_assets/sprites/pinetree.png"  );
for ( i = 0; i < 100; i ++ ) {

	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 2000 - 1000;
	// vertex.y = Math.random() * 2000 - 1000;
	vertex.z = Math.random() * 2000 - 1000;
	vertex.y = 1000;



	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set( 0, -1, 0 );
	raycaster.ray.origin = vertex;

	var hits = raycaster.intersectObject( hills );

	if( hits.length != 0 && ( hits[0].face.normal.y > 0 ) ) {
		// var actualHeight = top_hit.distance - birdsEye;
		vertex.y -= hits[0].distance;
		vertex.y -= 780;
	}


	geometry.vertices.push( vertex );

}
var parameters = [ [ [0.90, 0.9, 0.5], sprite, 100 ] ];

var color, size = 100, particles, materials = [];
// material = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: true, transparent : true, opacity: 2.0 } );
material = new THREE.PointsMaterial( { size: size, map: sprite, transparent : true } );
particles = new THREE.Points( geometry, material );
scene.add( particles );





















//LIGHTS

var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
// hemiLight.position.set( 0, 500, 0 );
hemiLight.position.set( -10, 6, 10 );
hemiLight.position.multiplyScalar( 100 );
scene.add( hemiLight );

//

var dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
// dirLight.position.set( -1, 1.75, 1 );
dirLight.position.set( -1, 1, 1 );
dirLight.position.multiplyScalar( 3000 );

var width = 5000;


// dirLight.castShadow = true;
dirLight.name = 'Dir. Light';
// dirLight.shadowCameraNear = 1;
// dirLight.shadowCameraFar = 10000;
// dirLight.shadowCameraRight = width;
// dirLight.shadowCameraLeft = -width;
// dirLight.shadowCameraTop	= width;
// dirLight.shadowCameraBottom = -width;
// dirLight.shadowMapWidth = 512;
// dirLight.shadowMapHeight = 512;

// scene.add( dirLight );





width = 50;

var playerShadows = new THREE.DirectionalLight( 0xffffff, 0.5 );
playerShadows.target = camera;
// playerShadows.position.set( -1, 1, 1 );
playerShadows.castShadow = true;
playerShadows.shadowCameraNear = 1;
playerShadows.shadowCameraFar = 100;
playerShadows.shadowCameraRight = width;
playerShadows.shadowCameraLeft = -width;
playerShadows.shadowCameraTop	= width;
playerShadows.shadowCameraBottom = -width;
playerShadows.shadowMapWidth = 1024;
playerShadows.shadowMapHeight = 1024;

scene.add( playerShadows );







// scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );


//  var dirLightHelper = new THREE.DirectionalLightHelper(dirLight);
//     scene.add(dirLightHelper);









// dirLightShadowMapViewer = new THREE.ShadowMapViewer( dirLight );
// dirLightShadowMapViewer.position.x = 10;
// dirLightShadowMapViewer.position.y = 10;
// dirLightShadowMapViewer.size.width = 256;
// dirLightShadowMapViewer.size.height = 256;
// dirLightShadowMapViewer.update(); 





				





var parameters = {
	width: 8000,
	height: 8000,
	widthSegments: 250,
	heightSegments: 250,
	depth: 1500,
	param: 4,
	filterparam: 1
};



var waterNormals = new THREE.ImageUtils.loadTexture( 'image_assets/normalmaps/waternormals.jpg' );
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

water = new THREE.Water( renderer, camera, scene, {
	textureWidth: 512,
	textureHeight: 512,
	waterNormals: waterNormals,
	alpha: 	0.9,
	sunDirection: dirLight.position.clone().normalize(),
	sunColor: 0xffffff,
	waterColor: 0x001e0f,
	distortionScale: 50.0,
} );


mirrorMesh = new THREE.Mesh(
	new THREE.PlaneBufferGeometry( parameters.width, parameters.height),
	water.material
);

mirrorMesh.add( water );
mirrorMesh.rotation.x = - Math.PI * 0.5;
mirrorMesh.position.y = -550.5;
scene.add( mirrorMesh );




