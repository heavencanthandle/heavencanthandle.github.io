        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);

        // Create a simple house
        const houseGeometry = new THREE.BoxGeometry(2, 2, 2);
        const houseMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        scene.add(house);

        // Add roof
        const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
        const roofMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.5;
        scene.add(roof);

        // Create a door
        const doorGeometry = new THREE.BoxGeometry(0.5, 1, 0.1);
        const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x4a3c2b });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, -0.5, 1); // Position it on the front of the house
        house.add(door); // Add it as a child of the house

        // Position camera (adjust these values)
        camera.position.set(0, 5, 5); // Move camera up and back a bit
        camera.lookAt(0, 0, 0);
        
        // Add OrbitControls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI/2.5;
        controls.minPolarAngle = 0;
        controls.update();

        // Raycaster for clicking
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Handle click events
        function onMouseClick(event) {
            // Get container bounds
            const container = document.getElementById('container');
            const rect = container.getBoundingClientRect();
            
            // Calculate mouse position relative to container
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([house, roof, door]);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                
                if (clickedObject === roof) {
                    window.location.href = "Remodels.html";
                } else if (clickedObject === house) {
                    window.location.href = "another-page.html";
                } else if (clickedObject === door) {
                    window.location.href = "entrance-page.html";
                }
            }
        }

        // Update mousemove handler as well
        function onMouseMove(event) {
            // Get container bounds
            const container = document.getElementById('container');
            const rect = container.getBoundingClientRect();
            
            // Calculate mouse position relative to container
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([house, roof, door]);

            // Reset materials
            house.material.color.setHex(0x808080);
            roof.material.color.setHex(0x8b4513);
            door.material.color.setHex(0x4a3c2b);

            if (intersects.length > 0) {
                const hoveredObject = intersects[0].object;
                hoveredObject.material.color.setHex(0xaaaaaa);
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }
        }

        window.addEventListener('click', onMouseClick);
        window.addEventListener('mousemove', onMouseMove);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            // Comment out or slow down rotation
            // house.rotation.y += 0.01;
            // roof.rotation.y += 0.01;
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Handle window resizing
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }