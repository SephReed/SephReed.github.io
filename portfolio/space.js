if (!Detector.webgl) Detector.addGetWebGLMessage();

document.addEventListener("DOMContentLoaded", function(event) {

    var container, stats;
    var camera, scene, renderer, particles, geometry, materials = [],
        parameters, i, h, color, size;
    var mouseX = 0,
        mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var domBox;

    init();
    animate();

    function init() {

        domBox = document.getElementById("space_box");

        if(domBox == null) {  
            console.log("No div element with the ID of 'space_box' exists.  Proceeding to fail.")
            return;  
        }

        var width = domBox.offsetWidth;
        var height = domBox.offsetHeight;

        console.log("Space container dimensions: "+width +"x"+height);

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setSize( width, height );
        domBox.appendChild( renderer.domElement );

        camera = new THREE.PerspectiveCamera(100, width / height, 1, 2000);
        camera.position.z = 1000;



        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.0007);

        geometry = new THREE.Geometry();
        

        for (i = 0; i < 200; i++) {

            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000;

            geometry.vertices.push(vertex);

        }

     parameters = [
            [
                [1, 1, 0.5], 5
            ],
            [
                [0.95, 1, 0.5], 4
            ],
            [
                [0.90, 1, 0.5], 3
            ],
            [
                [0.85, 1, 0.5], 2
            ],
            [
                [0.80, 1, 0.5], 1
            ]
        ];


        for (i = 0; i < parameters.length; i++) {

            color = parameters[i][0];
            size = parameters[i][1];

            materials[i] = new THREE.PointsMaterial({
                size: size,
                opacity: 0.5
            });

            particles = new THREE.Points(geometry, materials[i]);

            particles.rotation.x = Math.random() * 6;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;

            scene.add(particles);

        }


        domBox.addEventListener('mousemove', onDocumentMouseMove, false);
        // domBox.addEventListener('touchstart', onDocumentTouchStart, false);
        // domBox.addEventListener('touchmove', onDocumentTouchMove, false);

        //

        window.addEventListener('resize', onWindowResize, false);

    }

    function onWindowResize() {

        var width = domBox.offsetWidth;
        var height = domBox.offsetHeight;

        windowHalfX = width / 2;
        windowHalfY = height / 2;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

    }

    function onDocumentMouseMove(event) {

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;

    }

    function onDocumentTouchStart(event) {

        if (event.touches.length === 1) {

            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;

        }

    }

    function onDocumentTouchMove(event) {

        if (event.touches.length === 1) {

            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;

        }

    }

    //

    function animate() {

        requestAnimationFrame(animate);

        render();
        // stats.update();

    }

    function render() {

        var time = Date.now() * 0.00005;

        camera.position.x += (-mouseX - camera.position.x) * 0.05;
        camera.position.y += (mouseY - camera.position.y) * 0.05;

        camera.lookAt(scene.position);

        for (i = 0; i < scene.children.length; i++) {

            var object = scene.children[i];

            if (object instanceof THREE.Points) {

                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));

            }

        }

        renderer.render(scene, camera);

    }
});

