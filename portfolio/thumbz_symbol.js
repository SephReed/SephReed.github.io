
var mouseX, mouseY;
var windowHalfX, windowHalfY;


window.onload = init;



var dae, domBox;
function init() {

	domBox = document.getElementById("thumbz_box");

	if(domBox == null) {  return;  }

	// domBox.style.width = 100;
	// domBox.style.height = 100;

	var width = domBox.offsetWidth;
	var height = domBox.offsetHeight;

	windowHalfX = width / 2;
	windowHalfY = height / 2;


	console.log(width +" "+height);

	var scene = new THREE.Scene();
	// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	// var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000 );
	var camera = new THREE.OrthographicCamera( -windowHalfX, windowHalfX, windowHalfY, -windowHalfY, - 500, 1000 );
	// var camera = new THREE.OrthographicCamera( 100 / - 2, 100 / 2, 100 / 2, 100 / - 2, - 500, 1000 );



	// var camera = new THREE.PerspectiveCamera( 75, 100/100, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize( width, height );
	// renderer.setSize( 300, 300 );
	domBox.appendChild( renderer.domElement );

	// var geometry = new THREE.SphereGeometry( 100, 100, 100 );
	var geometry = new THREE.DodecahedronGeometry(100, 3);
	var material = new THREE.MeshNormalMaterial( { wireframe: true } );
	var cube = new THREE.Mesh( geometry, material );
	// scene.add( cube );

	camera.position.z = 5;








	var loader = new  THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load('ThumbzSymbol.dae', function (collada){
		dae = collada.scene;
		// dae.children[0].children[0].material = new THREE.MeshNormalMaterial( {wireframe : true} );
		dae.children[0].children[0].material = new THREE.MeshNormalMaterial( { 
			color: 0xeeffee, 
			wireframe: false, 
			transparent: true, 
			opacity: 0.5, 
			wireframeLinewidth: 3,
			side: THREE.DoubleSide
		} );


		var edges = new THREE.EdgesHelper( dae.children[0].children[0], 0xffffff );
		scene.add( edges );
		// dae.children[0].children[0].material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );
		// dae.children[0].children[0].material = new THREE.MeshBasiclMaterial( {wireframe : true} );
		dae.scale.x = dae.scale.y = dae.scale.z = 50;
		dae.updateMatrix();
		// dae.position.y = -411;
		// dae.position.x = 200;
		// dae.position.z = 805;

		// dae.children[0].children[0].castShadow = true;
		// dae.children[0].children[0].receiveShadow = true;

		scene.add(dae);


		
		// world.solids.push(dae);
	});	




	// var controls = new THREE.OrbitControls( camera, domBox );
	// //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
	// controls.enableDamping = true;
	// controls.dampingFactor = 0.25;
	// controls.enableZoom = false;






	// _x: 2.280000000000001, _y: 0.3700000000000001
	// 1.0199999999999998, _y: 2.400000000000001, _z: -0.009999999999999995
	//-0.39793506945470575, _y: 7.853981633974475
	//_x: 1.2004286453759505e-15, _y: 9.42477796076938
	// _x: 0, _y: 0
	//_x: 0.8587019919812127, _y: 9.80176907920019,
	//_x: -1.5707963267948943, _y: 9.80176907920021

	var good_sides = [
		new THREE.Vector2(0.0, 0.0),
		// new THREE.Vector2(2.28, 0.37),
		new THREE.Vector2(-0.398, 7.854),
		new THREE.Vector2(0.0+Math.PI, 9.425),
		new THREE.Vector2(0.859, 9.802),
		new THREE.Vector2(-1.571, 9.802-Math.PI)
	]


	var lastSide = 0;
	var counter = 0;
	var rotation_count = 0;
	var qpi = Math.PI/2.0;
	var pause = true;
	var choices = ["X", "Y", "Both"];
	var current_choice = choices[1];
	var waitTime = 100;

	var render = function () {
		requestAnimationFrame( render );
		TWEEN.update();

		// cube.rotation.x += 0.1;
		// cube.rotation.y += 0.1;

		// dae.rotation.x += 0.01;
		// dae.rotation.y += 0.01; 


		if(pause == true && state != STATE.ROTATE) {
			counter++;
			if(counter > waitTime) {  
				pause = false;  
				counter = 0;

				var newSide = ~~(Math.random()*good_sides.length);
				while (newSide == lastSide) {
					newSide = ~~(Math.random()*good_sides.length);
				}
				lastSide = newSide;
				var side = good_sides[newSide];

				waitTime = newSide == 0 ? 150 : 50;

				new TWEEN.Tween( dae.rotation ).to( {
				x: side.x,
				y: side.y} , 4000 )
				.easing( TWEEN.Easing.Sinusoidal.InOut).onComplete(
					function() {
						pause = true;
						console.log(lastSide);
					}
				).start(); 
				// current_choice = choices[~~(Math.random() * choices.length)];
				// console.log(current_choice);
			}
		}


		// if(pause) {
		// 	
		// }
		
		// else { 
		// 	if(current_choice == "Y" || current_choice == "Both"){
		// 		dae.rotation.y += 0.01;
		// 	} 
		// 	if(current_choice == "X" || current_choice == "Both"){
		// 		dae.rotation.x += 0.01;
		// 	} 
			
		// 	rotation_count += 0.01; 
		// 	if( qpi - (rotation_count%qpi) < 0.01) {  pause = true;  }
		// 	// dae.rotation.y += Math.PI;  
		// }

		renderer.render(scene, camera);

		// controls.update();
	};

	render();

	domBox.addEventListener( 'mousedown', onMouseDown, false );

	// domBox.addEventListener('mousemove', onDocumentMouseMove, false);
	// domBox.addEventListener('touchstart', onDocumentTouchStart, false);
	// domBox.addEventListener('touchmove', onDocumentTouchMove, false);

	//

	// window.addEventListener('resize', onWindowResize, false);

}

// function onWindowResize() {

//   windowHalfX = window.innerWidth / 2;
//   windowHalfY = window.innerHeight / 2;

//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);

// }


var scope = {
	enabled: true,
	mouseButtons: { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT }
	
}


var STATE = { NONE : - 1, ROTATE : 0 };
var state;

var rotateStart = new THREE.Vector2();
var rotateEnd = new THREE.Vector2();
var rotateDelta = new THREE.Vector2();

function onMouseDown( event ) {

	if ( scope.enabled === false ) return;

	event.preventDefault();

	if ( event.button === scope.mouseButtons.ORBIT ) {

		state = STATE.ROTATE;

		rotateStart.set( event.clientX, event.clientY );
	}

	if ( state !== STATE.NONE ) {

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
		// scope.dispatchEvent( startEvent );

	}

}



function onMouseMove( event ) {

	if ( scope.enabled === false ) return;

	event.preventDefault();

	// var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

	if ( state === STATE.ROTATE ) {

		// if ( scope.enableRotate === false ) return;

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		// rotating across whole screen goes 360 degrees around
		// constraint.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// console.log( 2 * Math.PI * rotateDelta.x / domBox.clientWidth * scope.rotateSpeed );
		var dr_x = 2 * Math.PI * rotateDelta.x / domBox.clientWidth;
		dae.rotation.y += dr_x;

		var dr_y = 2 * Math.PI * rotateDelta.y / domBox.clientHeight;
		dae.rotation.x += dr_y;

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		// constraint.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

	} 

	// if ( state !== STATE.NONE ) scope.update();

}

function onMouseUp( /* event */ ) {

	if ( scope.enabled === false ) return;

	document.removeEventListener( 'mousemove', onMouseMove, false );
	document.removeEventListener( 'mouseup', onMouseUp, false );
	// scope.dispatchEvent( endEvent );
	state = STATE.NONE;

}







// function onDocumentMouseMove(event) {

//   mouseX = event.clientX - windowHalfX;
//   mouseY = event.clientY - windowHalfY;

// }

// function onDocumentTouchStart(event) {

//   if (event.touches.length === 1) {

//     event.preventDefault();

//     mouseX = event.touches[0].pageX - windowHalfX;
//     mouseY = event.touches[0].pageY - windowHalfY;

//   }

// }

// function onDocumentTouchMove(event) {

//   if (event.touches.length === 1) {

//     event.preventDefault();

//     mouseX = event.touches[0].pageX - windowHalfX;
//     mouseY = event.touches[0].pageY - windowHalfY;

//   }

// }








