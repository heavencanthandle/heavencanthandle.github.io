// Similar to house3d.js but with mobile-specific modifications
// For example:
// - Simpler geometry for better performance
// - Touch-specific controls
// - Different camera positioning
// - Simplified animations

// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Materials
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 }); // Light gray
const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3c2b }); // Dark brown
const couchMaterial = new THREE.MeshPhongMaterial({ color: 0x2e4756 }); // Navy blue
const lightFixtureMaterial = new THREE.MeshPhongMaterial({ color: 0xb87333 }); // Copper color
const lightBulbMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffa5,
    emissive: 0xffffa5,
    emissiveIntensity: 0.5
});

// Room dimensions (based on door size)
const doorWidth = 0.5;
const doorHeight = 1;
const roomSize = doorWidth * 4;
const wallHeight = doorHeight * 2;
const wallThickness = 0.1;

// Create walls
const walls = [];
const wallPositions = [
    { x: 0, z: -roomSize/2, rotation: 0 }, // Back wall
    { x: 0, z: roomSize/2, rotation: 0 },  // Front wall
    { x: -roomSize/2, z: 0, rotation: Math.PI/2 }, // Left wall
    { x: roomSize/2, z: 0, rotation: Math.PI/2 }  // Right wall
];

wallPositions.forEach(pos => {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(roomSize, wallHeight, wallThickness),
        wallMaterial
    );
    wall.position.set(pos.x, wallHeight/2, pos.z);
    wall.rotation.y = pos.rotation;
    scene.add(wall);
    walls.push(wall);
});

// Create door (on front wall)
const door = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth, doorHeight, wallThickness),
    doorMaterial
);
door.position.set(0, doorHeight/2, roomSize/2);
scene.add(door);

// Create couch
const couchBase = new THREE.Mesh(
    new THREE.BoxGeometry(roomSize/2, doorHeight/2, roomSize/4),
    couchMaterial
);
couchBase.position.set(-roomSize/4, doorHeight/4, -roomSize/4);
scene.add(couchBase);

// Couch backrest
const couchBack = new THREE.Mesh(
    new THREE.BoxGeometry(roomSize/2, doorHeight/1.2, roomSize/8),
    couchMaterial
);
couchBack.position.set(-roomSize/4, doorHeight/1.5, -roomSize/3);
scene.add(couchBack);

// Create wall sconces
const createSconce = (x, z, rotationY) => {
    // Sconce base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.2, 0.1),
        lightFixtureMaterial
    );
    base.position.set(x, wallHeight * 0.7, z);
    base.rotation.y = rotationY;
    scene.add(base);

    // Light bulb
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        lightBulbMaterial
    );
    bulb.position.set(x, wallHeight * 0.7, z);
    if (rotationY !== 0) {
        bulb.position.x += (rotationY > 0 ? -0.1 : 0.1);
    } else {
        bulb.position.z += 0.1;
    }
    scene.add(bulb);

    // Add point light
    const light = new THREE.PointLight(0xffffa5, 0.5, roomSize);
    light.position.copy(bulb.position);
    scene.add(light);
};

// Add sconces to walls
createSconce(-roomSize/3, -roomSize/2 + wallThickness, 0);
createSconce(roomSize/3, -roomSize/2 + wallThickness, 0);
createSconce(-roomSize/2 + wallThickness, 0, Math.PI/2);
createSconce(roomSize/2 - wallThickness, 0, -Math.PI/2);

// Add floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomSize, roomSize),
    new THREE.MeshPhongMaterial({ color: 0x8b4513 })
);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// Position camera for mobile view
camera.position.set(0, roomSize * 1.5, roomSize * 1.5);
camera.lookAt(0, 0, 0);

// Add mobile-friendly controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI/2;
controls.minPolarAngle = 0;
controls.enableZoom = true;
controls.maxDistance = roomSize * 1.5;
controls.minDistance = roomSize/2;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
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

// Add touch interaction for mobile
function onTouch(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const container = document.getElementById('container');
    const rect = container.getBoundingClientRect();
    
    const mouse = {
        x: ((touch.clientX - rect.left) / container.clientWidth) * 2 - 1,
        y: -((touch.clientY - rect.top) / container.clientHeight) * 2 + 1
    };

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects([door, ...walls]);
    
    if (intersects.length > 0) {
        if (intersects[0].object === door) {
            window.location.href = "entrance-page.html";
        }
        // Add more interactions for other objects if needed
    }
}

renderer.domElement.addEventListener('touchstart', onTouch, false); 