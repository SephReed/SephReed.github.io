
document.addEventListener("DOMContentLoaded", function(event) {

	var mouseX, mouseY;
	var windowHalfX, windowHalfY;

	var currentTween;
	var EASE_TIME = 5500;


	window.onload = init;



	var dae, domBox;
	function init() {

		domBox = document.getElementById("thumbz_box");

		if(domBox == null) {  
			console.log("No div element with the ID of 'thumbz_box' exists.  Proceeding to fail.")
			return;  
		}

		var width = domBox.offsetWidth;
		var height = domBox.offsetHeight;
		// var width = 300;
		// var height = 300;

		windowHalfX = width / 2;
		windowHalfY = height / 2;


		console.log("ThumbzSymbol container dimensions: "+width +"x"+height);

		var scene = new THREE.Scene();
		var camera = new THREE.OrthographicCamera( -windowHalfX, windowHalfX, windowHalfY, -windowHalfY, - 500, 1000 );


		var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		renderer.setSize( width, height );
		domBox.appendChild( renderer.domElement );

		camera.position.z = 6;





		var loader = new  THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load('ThumbzSymbol.dae', function (collada){
			dae = collada.scene;

			//only child of ThumbzSymbol.dae
			dae.children[0].children[0].material = new THREE.MeshNormalMaterial( { 
				wireframe: false, 
				transparent: true, 
				opacity: 0.5, 
				wireframeLinewidth: 3,
				side: THREE.DoubleSide
			} );


			var edges = new THREE.EdgesHelper( dae.children[0].children[0], 0xffffff );
			scene.add( edges );

			// dae.scale.x = dae.scale.y = dae.scale.z = 50;
			dae.scale.x = dae.scale.y = dae.scale.z = 40;
			dae.updateMatrix();

			scene.add(dae);
		});	






		var good_sides = [
			new THREE.Vector2(0.0, 0.0),
			new THREE.Vector2(-0.398, 7.854),
			new THREE.Vector2(0.0+Math.PI, 9.425),
			new THREE.Vector2(0.859, 9.802),
			new THREE.Vector2(-1.571, 9.802-Math.PI)
		]


		var choices = ["X", "Y", "Both"];
		var lastSide = 0;
		var current_choice = choices[1];
		var counter = 0;
		var qpi = Math.PI/2.0;
		var pause = true;
		var waitTime = 100;

		var render = function () {
			requestAnimationFrame( render );
			TWEEN.update();

			if(currentTween == undefined && state != STATE.ROTATE) {
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

					waitTime = newSide == 0 ? 100 : 0;//(Math.random()*150 + 50);

					currentTween = new TWEEN.Tween( dae.rotation ).to( {
					x: side.x,
					y: side.y} , EASE_TIME )
					.easing( TWEEN.Easing.Sinusoidal.Out).onComplete(
						function() {
							currentTween = undefined;
							// console.log("Rotated symbol to rotation #"+lastSide);
						}
					).start(); 

				}
			}

			renderer.render(scene, camera);
		};

		render();

		domBox.addEventListener( 'mousedown', onMouseDown, false );
	}



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
			if(currentTween != undefined) {
				currentTween.stop();
				currentTween = undefined;
			}

			rotateStart.set( event.clientX, event.clientY );
		}

		if ( state !== STATE.NONE ) {
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
		}
	}



	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( state === STATE.ROTATE ) {
			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			var dr_x = 2 * Math.PI * rotateDelta.x / domBox.clientWidth;
			dae.rotation.y += dr_x;

			var dr_y = 2 * Math.PI * rotateDelta.y / domBox.clientHeight;
			dae.rotation.x += dr_y;

			rotateStart.copy( rotateEnd );
		} 
	}




	function onMouseUp( /* event */ ) {
		if ( scope.enabled === false ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		state = STATE.NONE;
	}



});












