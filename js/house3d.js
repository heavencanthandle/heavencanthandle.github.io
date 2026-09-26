const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e141c);
scene.fog = new THREE.Fog(0x0e141c, 14, 32);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(7.2, 4.4, 8.8);
camera.lookAt(0, 1.15, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById("container").appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 1.25, 0);
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 5;
controls.maxDistance = 16;

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

const hemi = new THREE.HemisphereLight(0xdce8f5, 0x2a2418, 0.55);
scene.add(hemi);

const ambient = new THREE.AmbientLight(0xefe6d8, 0.35);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xfff0d4, 1.05);
keyLight.position.set(8, 11, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.near = 2;
keyLight.shadow.camera.far = 28;
keyLight.shadow.camera.left = -10;
keyLight.shadow.camera.right = 10;
keyLight.shadow.camera.top = 10;
keyLight.shadow.camera.bottom = -10;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8eb4d8, 0.35);
fillLight.position.set(-6, 4, -5);
scene.add(fillLight);

const lawn = new THREE.Mesh(
    new THREE.CircleGeometry(22, 48),
    new THREE.MeshStandardMaterial({ color: 0x2d4a32, roughness: 0.92, metalness: 0.02 })
);
lawn.rotation.x = -Math.PI / 2;
lawn.position.y = -0.02;
lawn.receiveShadow = true;
scene.add(lawn);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.04;
scene.add(ground);

const sidingMat = new THREE.MeshStandardMaterial({
    color: 0xa39d94,
    roughness: 0.78,
    metalness: 0.04
});
const roofMat = new THREE.MeshStandardMaterial({
    color: 0x2a2826,
    roughness: 0.88,
    metalness: 0.12
});
const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xe8e4dc,
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
});
const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4528, roughness: 0.72, metalness: 0.05 });
const deckWoodMat = woodMat.clone();
deckWoodMat.color.setHex(0x7a5230);
const metalMat = new THREE.MeshStandardMaterial({ color: 0x8a7d6a, roughness: 0.45, metalness: 0.55 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.65, metalness: 0.08 });
const interiorMat = new THREE.MeshStandardMaterial({ color: 0xd7d3cc, roughness: 0.85, metalness: 0 });
const counterMat = new THREE.MeshStandardMaterial({ color: 0x6d787f, roughness: 0.55, metalness: 0.15 });
const tileMat = new THREE.MeshStandardMaterial({ color: 0xb8c5cf, roughness: 0.4, metalness: 0.1 });
const sofaMat = new THREE.MeshStandardMaterial({ color: 0x445264, roughness: 0.82, metalness: 0.02 });
const foundationMat = new THREE.MeshStandardMaterial({ color: 0x5c5a56, roughness: 0.95, metalness: 0.02 });
const glassMat = new THREE.MeshStandardMaterial({
    color: 0x9eb4c8,
    roughness: 0.08,
    metalness: 0.35,
    transparent: true,
    opacity: 0.72,
    emissive: 0x1a2838,
    emissiveIntensity: 0.25
});

const house = new THREE.Group();
scene.add(house);
house.scale.setScalar(1.14);

const foundation = new THREE.Mesh(new THREE.BoxGeometry(5.35, 0.28, 4.85), foundationMat);
foundation.position.y = 0.14;
foundation.castShadow = true;
foundation.receiveShadow = true;
house.add(foundation);

const floor = new THREE.Mesh(
    new THREE.BoxGeometry(5.05, 0.1, 4.45),
    new THREE.MeshStandardMaterial({ color: 0x5c4332, roughness: 0.65, metalness: 0.02 })
);
floor.position.y = 0.32;
floor.receiveShadow = true;
house.add(floor);

// Left exterior wall omitted so the interior stays visible from the side.

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.85, 4.55), sidingMat);
rightWall.position.set(2.58, 1.72, 0);
rightWall.castShadow = true;
rightWall.receiveShadow = true;
house.add(rightWall);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.15, 2.85, 0.16), sidingMat);
backWall.position.set(0, 1.72, -2.28);
backWall.castShadow = true;
backWall.receiveShadow = true;
house.add(backWall);

const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.85, 0.16), sidingMat);
frontWallLeft.position.set(-1.62, 1.72, 2.28);
frontWallLeft.castShadow = true;
frontWallLeft.receiveShadow = true;
house.add(frontWallLeft);

const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.85, 0.16), sidingMat);
frontWallRight.position.set(1.62, 1.72, 2.28);
frontWallRight.castShadow = true;
frontWallRight.receiveShadow = true;
house.add(frontWallRight);

const trimBand = new THREE.Mesh(new THREE.BoxGeometry(5.38, 0.14, 4.78), trimMat);
trimBand.position.y = 3.12;
trimBand.castShadow = true;
house.add(trimBand);

const ceiling = new THREE.Mesh(new THREE.BoxGeometry(5.08, 0.08, 4.48), ceilingMat);
ceiling.position.y = 3.02;
house.add(ceiling);

const roof = new THREE.Mesh(new THREE.ConeGeometry(4.35, 1.65, 4), roofMat);
roof.position.y = 3.95;
roof.rotation.y = Math.PI / 4;
roof.castShadow = true;
house.add(roof);

const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, 0.45), new THREE.MeshStandardMaterial({ color: 0x6a6560, roughness: 0.9 }));
chimney.position.set(-1.85, 4.35, -1.2);
chimney.castShadow = true;
house.add(chimney);

const porch = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.55), woodMat);
porch.position.set(0, 0.38, 2.52);
porch.castShadow = true;
house.add(porch);

const step = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.1, 0.28), foundationMat);
step.position.set(0, 0.24, 2.68);
house.add(step);

const doorGroup = new THREE.Group();
doorGroup.position.set(0, 0, 0);
house.add(doorGroup);

const door = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.75, 0.1), woodMat.clone());
door.position.set(0, 1.18, 2.34);
door.castShadow = true;
doorGroup.add(door);

const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.35, 0.04), new THREE.MeshStandardMaterial({ color: 0x52341f, roughness: 0.8 }));
doorPanel.position.set(0, 1.15, 2.4);
doorGroup.add(doorPanel);

const doorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), metalMat);
doorKnob.position.set(0.32, 1.05, 2.42);
doorGroup.add(doorKnob);

const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.95, 0.06), trimMat);
doorFrame.position.set(0, 1.22, 2.26);
house.add(doorFrame);

function buildFrontWindow(x, link) {
    const group = new THREE.Group();
    group.position.set(x, 1.85, 2.28);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.02, 0.1), trimMat);
    frame.castShadow = true;
    group.add(frame);

    const sill = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.08, 0.14), trimMat);
    sill.position.set(0, -0.52, 0.02);
    group.add(sill);

    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.78, 0.05), glassMat.clone());
    glass.position.set(0, 0, 0.04);
    group.add(glass);

    const shutterL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.82, 0.04), woodMat.clone());
    shutterL.position.set(-0.52, 0, 0.06);
    group.add(shutterL);

    const shutterR = shutterL.clone();
    shutterR.position.x = 0.52;
    group.add(shutterR);

    house.add(group);
    return group;
}

const interiorWindowGroup = buildFrontWindow(-1.68, "interior-design.html");
const remodelWindowGroup = buildFrontWindow(1.68, "Remodels.html");

const deckGroup = new THREE.Group();
deckGroup.position.set(3.65, 0, 0.2);
house.add(deckGroup);

const deck = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.16, 3.5), deckWoodMat);
deck.position.set(0, 1.02, 0);
deck.castShadow = true;
deck.receiveShadow = true;
deckGroup.add(deck);

for (let row = 0; row < 8; row += 1) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.02, 0.38), deckWoodMat.clone());
    plank.position.set(0, 1.11, -1.4 + row * 0.4);
    plank.material.color.offsetHSL(0, 0, (row % 2) * 0.03 - 0.015);
    deckGroup.add(plank);
}

const deckRail = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.48, 0.08), metalMat);
deckRail.position.set(0, 1.32, -1.58);
deckGroup.add(deckRail);

for (let i = 0; i < 6; i += 1) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), metalMat);
    slat.position.set(-0.9 + i * 0.36, 1.28, -1.56);
    deckGroup.add(slat);
}

function addDeckPost(z) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), deckWoodMat);
    post.position.set(1.02, 0.57, z);
    post.castShadow = true;
    deckGroup.add(post);
}

addDeckPost(-1.35);
addDeckPost(0.15);
addDeckPost(1.65);

const deckStairs = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.55), deckWoodMat);
deckStairs.position.set(0.55, 0.62, 1.55);
deckStairs.rotation.x = -0.35;
deckGroup.add(deckStairs);

const treeGroup = new THREE.Group();
treeGroup.position.set(-4.85, 0, -1.35);
house.add(treeGroup);

const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 2.05, 12), woodMat);
treeTrunk.position.y = 1.02;
treeTrunk.castShadow = true;
treeGroup.add(treeTrunk);

const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2f6b38, roughness: 0.88, metalness: 0 });
function addFoliage(x, y, z, r) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), foliageMat.clone());
    blob.position.set(x, y, z);
    blob.castShadow = true;
    treeGroup.add(blob);
    return blob;
}

addFoliage(0, 2.75, 0, 1.05);
addFoliage(-0.55, 2.45, 0.35, 0.72);
addFoliage(0.5, 2.5, -0.25, 0.78);
addFoliage(0.15, 3.15, 0.2, 0.65);

function addBackgroundTree(x, z, scale = 1) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16 * scale, 0.22 * scale, 1.75 * scale, 10),
        woodMat
    );
    trunk.position.set(x, 0.88 * scale, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const top = new THREE.Mesh(
        new THREE.SphereGeometry(1.05 * scale, 14, 14),
        foliageMat.clone()
    );
    top.position.set(x, 2.15 * scale, z);
    top.castShadow = true;
    scene.add(top);
}

addBackgroundTree(-2.4, -6.2, 1.05);
addBackgroundTree(0.6, -6.8, 0.96);
addBackgroundTree(3.6, -6.1, 1.1);

function addShrub(x, z, size = 0.42) {
    const shrub = new THREE.Mesh(
        new THREE.SphereGeometry(size, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x3b5f32, roughness: 0.9 })
    );
    shrub.position.set(x, size * 0.62, z);
    shrub.castShadow = true;
    scene.add(shrub);
}

addShrub(-2.35, 5.85, 0.36);
addShrub(-1.85, 5.75, 0.43);
addShrub(-1.15, 5.88, 0.35);
addShrub(1.05, 5.82, 0.37);
addShrub(2.05, 5.9, 0.46);

const walkPath = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x6a645c, roughness: 0.95 })
);
walkPath.rotation.x = -Math.PI / 2;
walkPath.position.set(0, 0.02, 3.35);
scene.add(walkPath);

const stream = new THREE.Mesh(
    new THREE.PlaneGeometry(4.9, 1.2, 1, 1),
    new THREE.MeshStandardMaterial({
        color: 0x3d7a96,
        transparent: true,
        opacity: 0.7,
        roughness: 0.15,
        metalness: 0.2
    })
);
stream.rotation.x = -Math.PI / 2;
stream.rotation.z = -0.14;
stream.position.set(-3.2, 0.015, 5.6);
scene.add(stream);

function addBoulder(x, z, sx, sy, sz) {
    const boulder = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.46, 0),
        new THREE.MeshStandardMaterial({ color: 0x70747a, roughness: 0.95 })
    );
    boulder.scale.set(sx, sy, sz);
    boulder.position.set(x, 0.24 * sy, z);
    boulder.castShadow = true;
    scene.add(boulder);
}

addBoulder(-4.9, 5.05, 1.2, 0.9, 1.35);
addBoulder(-4.15, 5.35, 0.9, 0.8, 1.05);
addBoulder(-2.6, 5.55, 1.15, 0.75, 1);

const roomDivider = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.05, 2.25), interiorMat);
roomDivider.position.set(0.55, 1.65, -0.75);
house.add(roomDivider);

const bathroomDivider = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.05, 0.1), interiorMat);
bathroomDivider.position.set(1.55, 1.65, 0.3);
house.add(bathroomDivider);

const kitchenCounter = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.82, 0.68), counterMat);
kitchenCounter.position.set(1.78, 1.05, -1.32);
house.add(kitchenCounter);

const kitchenIsland = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.78, 0.52), counterMat);
kitchenIsland.position.set(1.18, 1.02, -0.42);
house.add(kitchenIsland);

const bathtub = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.42, 0.62), tileMat);
bathtub.position.set(1.88, 0.78, 1.32);
house.add(bathtub);

const vanity = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.76, 0.38), tileMat);
vanity.position.set(1.08, 0.96, 1.72);
house.add(vanity);

const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.48, 0.72), sofaMat);
sofaBase.position.set(-1.18, 0.84, -1.32);
house.add(sofaBase);

const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.52, 0.18), sofaMat);
sofaBack.position.set(-1.18, 1.14, -1.58);
house.add(sofaBack);

const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.48), woodMat);
coffeeTable.position.set(-1.18, 0.68, -0.42);
house.add(coffeeTable);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredRegion = null;

function makeLabel(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return null;
    }

    ctx.fillStyle = "rgba(8, 10, 16, 0.82)";
    ctx.strokeStyle = "rgba(215, 177, 111, 0.92)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(6, 6, 500, 116, 22);
    ctx.fill();
    ctx.stroke();
    ctx.font = "600 40px Segoe UI";
    ctx.fillStyle = "#efe3d0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: true
    });
    material.renderOrder = 10;
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.75, 0.42, 1);
    return sprite;
}

/** @type {{ root: THREE.Object3D, meshes: THREE.Mesh[], link: string, label: THREE.Sprite | null }[]} */
const clickRegions = [];

function registerClickRegion(root, link, labelText, labelLocalPos) {
    const meshes = [];
    root.traverse((child) => {
        if (child.isMesh) {
            child.userData.link = link;
            child.userData.regionRoot = root;
            meshes.push(child);
        }
    });

    let label = null;
    if (labelText) {
        label = makeLabel(labelText);
        if (label) {
            label.position.copy(labelLocalPos);
            root.add(label);
        }
    }

    clickRegions.push({ root, meshes, link, label });
    return root;
}

registerClickRegion(doorGroup, "handyman.html", "Handyman", new THREE.Vector3(0, 1.35, 0.35));
registerClickRegion(deckGroup, "deck-building.html", "Deck Building", new THREE.Vector3(0, 1.55, 0));
registerClickRegion(treeGroup, "tree-trimming.html", "Tree Service", new THREE.Vector3(0, 3.35, 0));
registerClickRegion(interiorWindowGroup, "interior-design.html", "Interior Design", new THREE.Vector3(0, 0.75, 0.35));
registerClickRegion(remodelWindowGroup, "Remodels.html", "Remodels", new THREE.Vector3(0, 0.75, 0.35));

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
            mat.emissiveIntensity = 0.22;
        } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = mat.userData.baseEmissiveIntensity ?? 0;
        }
    });
    if (region.label && region.label.material) {
        region.label.material.opacity = active ? 1 : 0.55;
    }
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

function findHit() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    if (!hits.length) {
        return null;
    }
    return hits[0].object;
}

function regionFromObject(obj) {
    if (!obj || !obj.userData.regionRoot) {
        return null;
    }
    return clickRegions.find((r) => r.root === obj.userData.regionRoot) || null;
}

function onPointerMove(event) {
    setPointerFromEvent(event);
    const hitObj = findHit();
    const nextRegion = regionFromObject(hitObj);
    if (nextRegion !== hoveredRegion) {
        setRegionHighlight(hoveredRegion, false);
        hoveredRegion = nextRegion;
        setRegionHighlight(hoveredRegion, true);
    }
    document.body.style.cursor = hitObj && hitObj.userData.link ? "pointer" : "default";
}

function onPointerDown(event) {
    if (event.target && event.target.closest && event.target.closest(".header a")) {
        return;
    }
    setPointerFromEvent(event);
    const hitObj = findHit();
    if (hitObj && hitObj.userData && hitObj.userData.link) {
        window.location.href = hitObj.userData.link;
    }
}

renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("pointerdown", onPointerDown);

function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    clickRegions.forEach((region, idx) => {
        if (region.label) {
            region.label.lookAt(camera.position);
            const pulse = hoveredRegion === region ? 1 : 0.55 + Math.sin(t * 2 + idx) * 0.08;
            region.label.material.opacity = hoveredRegion === region ? 1 : pulse;
        }
    });

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
