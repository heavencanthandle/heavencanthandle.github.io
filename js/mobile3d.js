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
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 }); // Light gray
const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3c2b }); // Dark brown
const couchMaterial = new THREE.MeshPhongMaterial({ color: 0x2e4756 }); // Navy blue
const lightFixtureMaterial = new THREE.MeshPhongMaterial({ color: 0xb87333 }); // Copper color
const lightBulbMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffa5,
    emissive: 0xffffa5,
    emissiveIntensity: 0.5
});

// Add deck materials
const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 }); // Wood brown
const railingMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3c2b }); // Dark brown

// Room dimensions (based on door size)
const doorWidth = 0.5;
const doorHeight = 1;
const roomSize = doorWidth * 9;
const wallHeight = doorHeight * 2;
const wallThickness = 0.1;

// Adjust deck dimensions
const deckWidth = roomSize * 0.4; // Make deck narrower for side of house
const deckDepth = roomSize * 0.8; // Make deck deeper
const deckHeight = wallHeight * 0.6;
const railingHeight = 0.5;
const postThickness = 0.1;
const railingThickness = 0.02; // Much thinner railings

// Create walls
const walls = [];
const wallPositions = [
    { x: 0, z: (-roomSize/2)+(wallThickness/2), rotation: 0 }, // Back wall
    { x: 0, z: roomSize/2-(wallThickness/2), rotation: 0 },  // Front wall
    { x: -roomSize/2+(wallThickness/2), z: 0, rotation: Math.PI/2 }, // Left wall
    { x: roomSize/2-(wallThickness/2), z: 0, rotation: Math.PI/2 }  // Right wall
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
    new THREE.BoxGeometry(doorWidth, doorHeight, wallThickness+0.01),
    doorMaterial
);
door.position.set(0, doorHeight/2, roomSize/2);
scene.add(door);

// Adjusted couch dimensions (smaller)
const couchHeight = doorHeight/2;
const couchWidth = doorHeight * 0.8; // Made narrower
const couchDepth = doorHeight * 0.6; // Made less deep

// Create couch base (seat) - positioned against back wall
const couchBase = new THREE.Mesh(
    new THREE.BoxGeometry(couchWidth, couchHeight/2, couchDepth),
    couchMaterial
);
couchBase.position.set(
    -roomSize/4,           // Centered on left side
    couchHeight/4,         // Half the base height
    -roomSize/2 + couchDepth/2  // Against back wall
);
scene.add(couchBase);

// Couch backrest
const couchBack = new THREE.Mesh(
    new THREE.BoxGeometry(couchWidth, couchHeight/2, couchDepth/4),
    couchMaterial
);
couchBack.position.set(
    -roomSize/4,                    // Same X as base
    couchHeight * 0.75,            // Above the base
    -roomSize/2 + couchDepth/8     // Against back wall
);
scene.add(couchBack);

// Adjusted armrests
const armrestWidth = couchDepth/4;
const armrestHeight = couchHeight/2;

// Left armrest
const leftArmrest = new THREE.Mesh(
    new THREE.BoxGeometry(armrestWidth, armrestHeight, couchDepth),
    couchMaterial
);
leftArmrest.position.set(
    -roomSize/4 - couchWidth/2 + armrestWidth/2,
    couchHeight/2,
    -roomSize/2 + couchDepth/2
);
scene.add(leftArmrest);

// Right armrest
const rightArmrest = new THREE.Mesh(
    new THREE.BoxGeometry(armrestWidth, armrestHeight, couchDepth),
    couchMaterial
);
rightArmrest.position.set(
    -roomSize/4 + couchWidth/2 - armrestWidth/2,
    couchHeight/2,
    -roomSize/2 + couchDepth/2
);
scene.add(rightArmrest);

// Add interior walls
const interiorWallHeight = wallHeight * 0.75; // 3/4 height of exterior walls
const interiorWallThickness = wallThickness/2; // Thinner than exterior walls

// Function to create interior walls
const createInteriorWall = (length, x, z, rotation = 0) => {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(length, interiorWallHeight, interiorWallThickness),
        new THREE.MeshPhongMaterial({ color: 0xf5f5f5 }) // Slightly off-white
    );
    wall.position.set(x, interiorWallHeight/2, z);
    wall.rotation.y = rotation;
    scene.add(wall);
    return wall;
};

// Create interior walls to form rooms
// Hallway wall
createInteriorWall(
    roomSize * 0.6, // Length
    0,              // X position
    -roomSize/6,    // Z position
    0               // No rotation
);

// Kitchen divider
createInteriorWall(
    roomSize * 0.4,    // Length
    roomSize/4,        // X position
    0,                 // Z position
    Math.PI/2          // 90 degrees rotation
);

// Living room divider
createInteriorWall(
    roomSize * 0.4,    // Length
    -roomSize/4,       // X position
    0,                 // Z position
    Math.PI/2          // 90 degrees rotation
);

// Add doorways in interior walls
const createDoorway = (width, height, x, z, rotation = 0) => {
    // Create door frame
    const frameThickness = interiorWallThickness;
    const frameWidth = 0.1;
    
    // Top frame
    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width + frameWidth*2, frameWidth, frameThickness),
        new THREE.MeshPhongMaterial({ color: 0x8b4513 })
    );
    topFrame.position.set(x, height, z);
    topFrame.rotation.y = rotation;
    scene.add(topFrame);

    // Side frames
    const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameWidth, height, frameThickness),
        new THREE.MeshPhongMaterial({ color: 0x8b4513 })
    );
    leftFrame.position.set(x - width/2 - frameWidth/2, height/2, z);
    leftFrame.rotation.y = rotation;
    scene.add(leftFrame);

    const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameWidth, height, frameThickness),
        new THREE.MeshPhongMaterial({ color: 0x8b4513 })
    );
    rightFrame.position.set(x + width/2 + frameWidth/2, height/2, z);
    rightFrame.rotation.y = rotation;
    scene.add(rightFrame);
};

// Add doorways
createDoorway(doorWidth * 1.2, doorHeight * 0.9, 0, -roomSize/6, 0);  // Hallway
createDoorway(doorWidth * 1.2, doorHeight * 0.9, roomSize/4, 0, Math.PI/2);  // Kitchen
createDoorway(doorWidth * 1.2, doorHeight * 0.9, -roomSize/4, 0, Math.PI/2); // Living room

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
createSconce(-roomSize/2 + wallThickness, 0, -Math.PI/2);
createSconce(roomSize/2 - wallThickness, 0, Math.PI/2);

// Add floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomSize, roomSize),
    new THREE.MeshPhongMaterial({ color: 0x8b4513 })
);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// Create deck platform - now on right side
const deckPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(deckWidth, postThickness, deckDepth),
    deckMaterial
);
deckPlatform.position.set(roomSize/2 + deckWidth/2, deckHeight, 0);
scene.add(deckPlatform);

// Create support posts
const createSupportPost = (x, z) => {
    const post = new THREE.Mesh(
        new THREE.BoxGeometry(postThickness, deckHeight, postThickness),
        deckMaterial
    );
    post.position.set(x, deckHeight/2, z);
    scene.add(post);
};

// Add corner support posts for right side deck
createSupportPost(roomSize/2 + deckWidth-(postThickness/2), deckDepth/2-(postThickness/2));
createSupportPost(roomSize/2 + deckWidth-(postThickness/2), -deckDepth/2+(postThickness/2));


// Add middle support posts
createSupportPost(roomSize/2 + deckWidth/2, deckDepth/2-(postThickness/2));
createSupportPost(roomSize/2 + deckWidth/2, -deckDepth/2+(postThickness/2));
createSupportPost(roomSize/2 + deckWidth-(postThickness/2), 0);
createSupportPost(roomSize/2+ deckWidth/2, 0);

// Modified stairs position and orientation
const stairCount = 6;
const stairWidth = deckWidth/3.3;
const stairDepth = 0.2;
const stairHeight = deckHeight/stairCount;
const stairStartX = roomSize/2 -0.1+ deckWidth/4; // Position stairs to the right front
const stairStartZ = (roomSize/2)+0.75; // Start at front of house

// Create stairs going from front to deck
for(let i = 0; i < stairCount; i++) {
    const stair = new THREE.Mesh(
        new THREE.BoxGeometry(stairWidth, stairHeight/2, stairDepth),
        deckMaterial
    );
    stair.position.set(
        stairStartX,
        (i + 0.5) * stairHeight,
        stairStartZ - (i + 0.5) * stairDepth
    );
    scene.add(stair);
}

// Modified railing function with adjustable start point for rails
const createRailing = (width, depth, position, skipSection = null, railingStartOffset = 0) => {
    // Calculate actual rail width/depth accounting for offset
    const actualWidth = width - railingStartOffset;
    const actualDepth = depth;

    // Top rail
    const topRail = new THREE.Mesh(
        new THREE.BoxGeometry(actualWidth, railingThickness, actualDepth),
        railingMaterial
    );
    // Adjust position to account for offset
    topRail.position.copy(position);
    if (width > depth) { // Side railings
        topRail.position.x += railingStartOffset/2;
    }
    topRail.position.y += railingHeight;
    scene.add(topRail);

    // Bottom rail
    const bottomRail = new THREE.Mesh(
        new THREE.BoxGeometry(actualWidth, railingThickness, actualDepth),
        railingMaterial
    );
    // Adjust position to account for offset
    bottomRail.position.copy(position);
    if (width > depth) { // Side railings
        bottomRail.position.x += railingStartOffset/2;
    }
    bottomRail.position.y += railingHeight/2;
    scene.add(bottomRail);

    // Vertical posts
    const postSpacing = 0.3;
    const length = Math.max(width, depth);
    const count = Math.floor(length/postSpacing);
    
    for(let i = 0; i <= count; i++) {
        // Calculate position for this post
        const pos = i * postSpacing / length;
        
        // Skip posts in the specified section and before the start offset
        if (skipSection && pos >= skipSection.start && pos <= skipSection.end) continue;
        if (pos * length < railingStartOffset) continue;

        const verticalPost = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        
        if(width > depth) { // Side railings
            verticalPost.position.set(
                position.x - width/2 + i * postSpacing,
                position.y + railingHeight/2,
                position.z
            );
        } else { // Front/back railing
            verticalPost.position.set(
                position.x,
                position.y + railingHeight/2,
                position.z - depth/2 + i * postSpacing
            );
        }
        scene.add(verticalPost);
    }
};

// Add deck railings
// Front railing
createRailing(
    railingThickness, 
    deckDepth, 
    new THREE.Vector3(roomSize/2 + deckWidth, deckHeight, 0)
);

// Back railing
createRailing(
    deckWidth, 
    railingThickness, 
    new THREE.Vector3(roomSize/2 + deckWidth/2, deckHeight, -deckDepth/2)
);

// Side railing with gap for stairs and adjusted start point
const postSpacing = 0.3;
const railingStartOffset = stairWidth/2 + postSpacing; // Added one post spaces before sta
createRailing(
    deckWidth, 
    railingThickness, 
    new THREE.Vector3(roomSize/2 + deckWidth/2, deckHeight, deckDepth/2),
    { start: 0, end: 0.3 }, // Gap where stairs meet
    railingStartOffset // Offset where railing starts
);

// Add stair railings
const createStairRailing = (isLeft) => {
    const offset = isLeft ? -stairWidth/2 : stairWidth/2;
    
    // Angled top rail
    const railLength = Math.sqrt(Math.pow(stairCount * stairDepth, 2) + Math.pow(deckHeight, 2));
    const angle = Math.atan2(deckHeight, stairCount * stairDepth);
    
    const topRail = new THREE.Mesh(
        new THREE.BoxGeometry(railingThickness, railingThickness, railLength),
        railingMaterial
    );
    
    topRail.position.set(
        stairStartX + offset,
        deckHeight/1.25,
        stairStartZ -( stairDepth*3)
    );
    topRail.rotation.x = angle;
    scene.add(topRail);

    // Vertical posts
    const postCount = stairCount + 1;
    for(let i = 0; i < postCount; i++) {
        const post = new THREE.Mesh(
            new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness),
            railingMaterial
        );
        post.position.set(
            stairStartX + offset,
            i * stairHeight + stairHeight/2,
            stairStartZ - i * stairDepth
        );
        scene.add(post);
    }
};

// Add railings to both sides of stairs
createStairRailing(true);  // Left side
createStairRailing(false); // Right side

// Position camera for mobile view
camera.position.set(0, roomSize * 3, roomSize * 3);
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
    
    const deckParts = [deckPlatform]; // Add all deck meshes to this array
    const intersects = raycaster.intersectObjects([door, ...walls, ...deckParts]);
    
    if (intersects.length > 0) {
        if (intersects[0].object === door) {
            window.location.href = "handyman.html";
        } else if (deckParts.includes(intersects[0].object)) {
            window.location.href = "deck-building.html";
        }
    }
}

renderer.domElement.addEventListener('touchstart', onTouch, false); 