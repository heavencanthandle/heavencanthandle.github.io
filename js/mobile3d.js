const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8c4);
scene.fog = new THREE.Fog(0x9eb5c9, 24, 64);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(12, 7, 13);
camera.lookAt(0, 2.3, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("container").appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2.2, 0);
controls.maxPolarAngle = Math.PI / 2.02;
controls.minDistance = 7;
controls.maxDistance = 26;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.18;

const cedarMat = new THREE.MeshStandardMaterial({ color: 0xb58f63, roughness: 0.82 });
const purpleMat = cedarMat; // upper storey is finished in cedar now
const corrMat = new THREE.MeshStandardMaterial({ color: 0x34393f, roughness: 0.55, metalness: 0.35 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.35, metalness: 0.55 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.55 });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6840, roughness: 0.78 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0xa8bdd0, transparent: true, opacity: 0.55, emissive: 0x223040, emissiveIntensity: 0.18 });

scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x3d4a32, 0.65));
scene.add(new THREE.DirectionalLight(0xfff6e8, 1.0).translateX(12).translateY(16).translateZ(8));

const hill = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x8a7f6e, roughness: 0.96 }));
hill.rotation.x = -Math.PI / 2;
hill.rotation.z = 0.1;
scene.add(hill);

const house = new THREE.Group();
scene.add(house);

const W = 7.4;
const D = 4.85;
const HALF_W = W / 2;
const HALF_D = D / 2;
const FLOOR_H = 1.38;
const BASE_H = 0.52;

function box(w, h, d, mat, x, y, z, parent = house) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
}

box(W + 0.2, BASE_H, D + 0.2, corrMat, 0, BASE_H / 2, 0);
box(0.16, FLOOR_H * 2, D, purpleMat, HALF_W, BASE_H + FLOOR_H, 0);
box(W, FLOOR_H * 2, 0.16, cedarMat, 0, BASE_H + FLOOR_H, -HALF_D);
box(W * 0.42, FLOOR_H, 0.16, cedarMat, -HALF_W + W * 0.21, BASE_H + FLOOR_H / 2, HALF_D);
box(W * 0.22, FLOOR_H, 0.16, cedarMat, HALF_W - W * 0.11, BASE_H + FLOOR_H / 2, HALF_D);
box(W * 0.46, FLOOR_H, 0.16, cedarMat, -HALF_W + W * 0.23, BASE_H + FLOOR_H * 1.5, HALF_D);
box(W * 0.48, FLOOR_H, 0.16, purpleMat, HALF_W - W * 0.24, BASE_H + FLOOR_H * 1.5, HALF_D);

const garageGroup = new THREE.Group();
garageGroup.position.set(0, BASE_H + FLOOR_H / 2, HALF_D);
house.add(garageGroup);
box(3.15, 2.05, 0.14, new THREE.MeshStandardMaterial({ color: 0x2a2520 }), 0, 0, 0, garageGroup);

const serviceDoorGroup = new THREE.Group();
serviceDoorGroup.position.set(HALF_W - 0.55, BASE_H + 0.62, HALF_D + 0.02);
house.add(serviceDoorGroup);
box(0.82, 1.72, 0.1, new THREE.MeshStandardMaterial({ color: 0x4a4038 }), 0, 0.86, 0, serviceDoorGroup);

const slidingDoorGroup = new THREE.Group();
slidingDoorGroup.position.set(1.55, BASE_H + FLOOR_H * 1.5, HALF_D + 0.05);
house.add(slidingDoorGroup);
box(1.35, 1.05, 0.08, trimMat, 0, 0, 0, slidingDoorGroup);
box(1.18, 0.92, 0.05, glassMat, 0, 0, 0.04, slidingDoorGroup);

const remodelWindowGroup = new THREE.Group();
remodelWindowGroup.position.set(0.35, BASE_H + FLOOR_H * 1.5, HALF_D + 0.05);
house.add(remodelWindowGroup);
box(0.84, 0.84, 0.08, trimMat, 0, 0, 0, remodelWindowGroup);

const roofRise = 1.05;
const eaveHigh = BASE_H + FLOOR_H * 2 + 0.15;
const eaveLow = eaveHigh - roofRise;
const roof = new THREE.Mesh(new THREE.BoxGeometry(W + 1.1, 0.11, D + 1.05), roofMat);
roof.rotation.z = -Math.atan2(roofRise, W);
roof.position.set(0, (eaveHigh + eaveLow) / 2 + 0.08, 0);
house.add(roof);

const deckGroup = new THREE.Group();
deckGroup.position.set(HALF_W + 0.05, BASE_H + FLOOR_H + 0.08, 0.15);
house.add(deckGroup);
box(3.05, 0.14, 2.35, woodMat, 1.38, 0, 0, deckGroup);
box(0.14, 2.55, 0.14, woodMat, 2.85, -1.25, 0.9, deckGroup);
box(0.32, 0.55, 0.32, corrMat, 2.85, -2.55, 0.9, deckGroup);

const treeGroup = new THREE.Group();
treeGroup.position.set(-6.5, 0, 4);
scene.add(treeGroup);
const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.2, 10), woodMat);
trunk.position.y = 1.1;
treeGroup.add(trunk);
const top = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0x2f5c38 }));
top.position.y = 2.65;
treeGroup.add(top);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredRegion = null;
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

registerClickRegion(garageGroup, "New-Construction.html");
registerClickRegion(deckGroup, "deck-building.html");
registerClickRegion(treeGroup, "tree-trimming.html");
registerClickRegion(slidingDoorGroup, "interior-design.html");
registerClickRegion(serviceDoorGroup, "handyman.html");
registerClickRegion(remodelWindowGroup, "Remodels.html");

const pickables = clickRegions.flatMap((r) => r.meshes);

function setPointerFromEvent(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onTouchStart(event) {
    const touch = event.touches[0];
    if (!touch) return;
    setPointerFromEvent(touch);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables);
    if (hits.length && hits[0].object.userData.link) {
        window.location.href = hits[0].object.userData.link;
    }
}

renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
