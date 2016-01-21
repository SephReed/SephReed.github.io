

window.onload = init;



var dae;
function init() {

	var domBox = document.getElementById("thumbz_box");
	domBox.style.width = 100;
	domBox.style.height = 100;

	var width = domBox.style.width;
	var height = domBox.style.height;

	console.log(width +" "+height);

	var scene = new THREE.Scene();
	// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000 );
	// var camera = new THREE.OrthographicCamera( 100 / - 2, 100 / 2, 100 / 2, 100 / - 2, - 500, 1000 );



	// var camera = new THREE.PerspectiveCamera( 75, 100/100, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	// renderer.setSize( 100, 100 );
	domBox.appendChild( renderer.domElement );

	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh( geometry, material );
	// scene.add( cube );

	camera.position.z = 5;








	var loader = new  THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load('ThumbzSymbol.dae', function (collada){
		dae = collada.scene;
		// dae.children[0].children[0].material = new THREE.MeshNormalMaterial( {wireframe : true} );
		dae.children[0].children[0].material = new THREE.MeshBasicMaterial( { color: 0xeeffee, wireframe: true } );


		var edges = new THREE.EdgesHelper( dae.children[0].children[0], 0x00ff00 );
		scene.add( edges );
		// dae.children[0].children[0].material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );
		// dae.children[0].children[0].material = new THREE.MeshBasiclMaterial( {wireframe : true} );
		dae.scale.x = dae.scale.y = dae.scale.z = 120;
		dae.updateMatrix();
		// dae.position.y = -411;
		// dae.position.x = 200;
		// dae.position.z = 805;

		// dae.children[0].children[0].castShadow = true;
		// dae.children[0].children[0].receiveShadow = true;

		scene.add(dae);
		// world.solids.push(dae);
	});	



	var counter = 0;
	var render = function () {
		requestAnimationFrame( render );

		cube.rotation.x += 0.1;
		cube.rotation.y += 0.1;

		// dae.rotation.x += 0.01;
		dae.rotation.y += 0.01; 

		if(counter < 100) {  counter++;  }
		else {  
			dae.rotation.y += 0.01; 
			// dae.rotation.y += Math.PI;  
			counter = 0;
		}

		renderer.render(scene, camera);
	};

	render();



}


