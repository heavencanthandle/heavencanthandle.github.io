const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e141c);
scene.fog = new THREE.Fog(0x0e141c, 12, 28);

const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(8, 6.2, 9.2);
camera.lookAt(0, 1.35, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("container").appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.target.set(0, 1.3, 0);
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 5.2;
controls.maxDistance = 16.5;

controls.autoRotate = true;
controls.autoRotateSpeed = 0.22;
const baseTargetY = controls.target.y;
let isUserInteracting = false;
controls.addEventListener("start", () => {
    isUserInteracting = true;
    controls.autoRotate = false;
});
controls.addEventListener("end", () => {
    isUserInteracting = false;
    controls.autoRotate = true;
});

scene.add(new THREE.HemisphereLight(0xdce8f5, 0x2a2418, 0.55));
scene.add(new THREE.AmbientLight(0xefe6d8, 0.38));

const keyLight = new THREE.DirectionalLight(0xfff0d4, 1.0);
keyLight.position.set(8, 10, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(512, 512);
scene.add(keyLight);

const lawn = new THREE.Mesh(
    new THREE.CircleGeometry(20, 32),
    new THREE.MeshStandardMaterial({ color: 0x2d4a32, roughness: 0.92 })
);
lawn.rotation.x = -Math.PI / 2;
lawn.receiveShadow = true;
scene.add(lawn);

const sidingMat = new THREE.MeshStandardMaterial({ color: 0xa39d94, roughness: 0.78 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.88, metalness: 0.1 });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4528, roughness: 0.72 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.65 });
const glassMat = new THREE.MeshStandardMaterial({
    color: 0x9eb4c8,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.75,
    emissive: 0x1a2838,
    emissiveIntensity: 0.2
});

const house = new THREE.Group();
scene.add(house);

const foundation = new THREE.Mesh(new THREE.BoxGeometry(5.35, 0.28, 4.85), new THREE.MeshStandardMaterial({ color: 0x5c5a56, roughness: 0.95 }));
foundation.position.y = 0.14;
foundation.castShadow = true;
house.add(foundation);

// Left exterior wall omitted (matches desktop) for interior visibility.
const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.85, 4.55), sidingMat);
rightWall.position.set(2.58, 1.72, 0);
rightWall.castShadow = true;
house.add(rightWall);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.15, 2.85, 0.16), sidingMat);
backWall.position.set(0, 1.72, -2.28);
backWall.castShadow = true;
house.add(backWall);

const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.85, 0.16), sidingMat);
frontWallLeft.position.set(-1.62, 1.72, 2.28);
frontWallLeft.castShadow = true;
house.add(frontWallLeft);

const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.85, 0.16), sidingMat);
frontWallRight.position.set(1.62, 1.72, 2.28);
frontWallRight.castShadow = true;
house.add(frontWallRight);

const trimBand = new THREE.Mesh(new THREE.BoxGeometry(5.38, 0.14, 4.78), trimMat);
trimBand.position.y = 3.12;
house.add(trimBand);

const roof = new THREE.Mesh(new THREE.ConeGeometry(4.35, 1.65, 4), roofMat);
roof.position.y = 3.95;
roof.rotation.y = Math.PI / 4;
roof.castShadow = true;
house.add(roof);

const doorGroup = new THREE.Group();
house.add(doorGroup);
const door = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.75, 0.12), woodMat);
door.position.set(0, 1.18, 2.34);
door.castShadow = true;
doorGroup.add(door);

const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.95, 0.06), trimMat);
doorFrame.position.set(0, 1.22, 2.26);
house.add(doorFrame);

function buildWindow(x, link) {
    const group = new THREE.Group();
    group.position.set(x, 1.85, 2.28);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.02, 0.1), trimMat);
    group.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.78, 0.05), glassMat.clone());
    glass.position.z = 0.04;
    group.add(glass);
    house.add(group);
    return group;
}

const interiorWindowGroup = buildWindow(-1.68, "interior-design.html");
const remodelWindowGroup = buildWindow(1.68, "Remodels.html");

const deckGroup = new THREE.Group();
deckGroup.position.set(3.65, 0, 0.2);
house.add(deckGroup);

const deck = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.16, 3.5), woodMat);
deck.position.set(0, 1.02, 0);
deck.castShadow = true;
deckGroup.add(deck);

const deckRail = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.48, 0.08), new THREE.MeshStandardMaterial({ color: 0x8a7d6a, metalness: 0.5, roughness: 0.45 }));
deckRail.position.set(0, 1.32, -1.58);
deckGroup.add(deckRail);

const treeGroup = new THREE.Group();
treeGroup.position.set(-4.85, 0, -1.35);
scene.add(treeGroup);

const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 2.05, 10), woodMat);
treeTrunk.position.y = 1.02;
treeTrunk.castShadow = true;
treeGroup.add(treeTrunk);

const treeTop = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0x2f6b38, roughness: 0.88 })
);
treeTop.position.y = 2.65;
treeTop.castShadow = true;
treeGroup.add(treeTop);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredRegion = null;

/** @type {{ root: THREE.Object3D, meshes: THREE.Mesh[], link: string }[]} */
const clickRegions = [];

function registerClickRegion(root, link) {
    const meshes = [];
    root.traverse((child) => {
        if (child.isMesh) {
            child.userData.link = link;
            child.userData.regionRoot = root;
            meshes.push(child);
        }
    });
    clickRegions.push({ root, meshes, link });
}

registerClickRegion(doorGroup, "handyman.html");
registerClickRegion(deckGroup, "deck-building.html");
registerClickRegion(treeGroup, "tree-trimming.html");
registerClickRegion(interiorWindowGroup, "interior-design.html");
registerClickRegion(remodelWindowGroup, "Remodels.html");

const pickables = clickRegions.flatMap((region) => region.meshes);

function setRegionHighlight(region, active) {
    if (!region) {
        return;
    }
    region.meshes.forEach((mesh) => {
        const mat = mesh.material;
        if (!mat || !mat.emissive) {
            return;
        }
        if (active) {
            mat.emissive.setHex(0xc9a066);
            mat.emissiveIntensity = 0.25;
        } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = mat.userData.baseEmissiveIntensity ?? 0;
        }
    });
}

clickRegions.forEach((region) => {
    region.meshes.forEach((mesh) => {
        if (mesh.material && mesh.material.emissive) {
            mesh.material.userData.baseEmissiveIntensity = mesh.material.emissiveIntensity || 0;
        }
    });
});

function setPointerFromEvent(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function regionFromObject(obj) {
    if (!obj || !obj.userData.regionRoot) {
        return null;
    }
    return clickRegions.find((r) => r.root === obj.userData.regionRoot) || null;
}

function onTouchStart(event) {
    const touch = event.touches[0];
    if (!touch) {
        return;
    }
    setPointerFromEvent(touch);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables);
    if (hits.length && hits[0].object.userData && hits[0].object.userData.link) {
        window.location.href = hits[0].object.userData.link;
    }
}

function onTouchMove(event) {
    const touch = event.touches[0];
    if (!touch) {
        return;
    }
    setPointerFromEvent(touch);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables);
    const hitObj = hits.length ? hits[0].object : null;
    const nextRegion = regionFromObject(hitObj);
    if (nextRegion !== hoveredRegion) {
        setRegionHighlight(hoveredRegion, false);
        hoveredRegion = nextRegion;
        setRegionHighlight(hoveredRegion, true);
    }
}

renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });

function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    controls.target.y = baseTargetY + (isUserInteracting ? 0 : Math.sin(t * 0.6) * 0.04);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
});
