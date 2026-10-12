const scene = new THREE.Scene();
const HAZE = 0xe3c3b4; // rosy evening haze at the horizon; sky, fog and backdrop all meet on it
scene.background = new THREE.Color(HAZE);
scene.fog = new THREE.Fog(HAZE, 45, 130);

// Phones / tablets: coarse pointer or small viewport -> cheaper rendering, wider framing
const isMobile = (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches) || Math.min(window.innerWidth, window.innerHeight) < 600;
const MAX_PIXEL_RATIO = isMobile ? 1.25 : 1.5;

function fitCameraFov() {
    const aspect = window.innerWidth / window.innerHeight;
    // Widen the view in portrait so the whole house stays in frame
    return aspect < 1 ? Math.min(75, 50 / Math.sqrt(aspect)) : 50;
}

const camera = new THREE.PerspectiveCamera(fitCameraFov(), window.innerWidth / window.innerHeight, 0.1, 700);
camera.position.set(-14.5, 7.5, 14.5);
camera.lookAt(0, 3.0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.getElementById("container").appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 3.0, 0);
controls.maxPolarAngle = Math.PI / 2.02;
controls.minDistance = 9;
controls.maxDistance = 36;
controls.enablePan = !isMobile;

controls.autoRotate = true;
controls.autoRotateSpeed = 0.18;
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

// --- Lighting ---
// Evening light: warm, low sun from the view (+Z) side, cool lavender fill from behind
scene.add(new THREE.HemisphereLight(0xf3d7c6, 0x3d4a32, 0.62));
scene.add(new THREE.AmbientLight(0xf2e2d4, 0.3));

const keyLight = new THREE.DirectionalLight(0xffd3ac, 1.15);
keyLight.position.set(-10, 13, 24);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(isMobile ? 768 : 1024, isMobile ? 768 : 1024);
keyLight.shadow.camera.near = 6;
keyLight.shadow.camera.far = 60;
keyLight.shadow.camera.left = -16;
keyLight.shadow.camera.right = 16;
keyLight.shadow.camera.top = 16;
keyLight.shadow.camera.bottom = -16;
keyLight.shadow.bias = -0.0006;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xb9b4e0, 0.3);
fillLight.position.set(12, 6, -8);
scene.add(fillLight);

// --- Sky dome + distant mountain backdrop (both ignore fog) ---
function makeSkyTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0.0, "#6b7faa");
    g.addColorStop(0.28, "#9d94b8");
    g.addColorStop(0.40, "#d7a9a4");
    g.addColorStop(0.47, "#f0b893");
    g.addColorStop(0.50, "#e9c6b2");
    g.addColorStop(0.52, "#e3c3b4");
    g.addColorStop(1.0, "#d7bdae");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    // Soft sunset clouds in the band above the horizon
    const clouds = [
        [120, 150, 180, 26, "#e3b9c0"], [330, 120, 230, 30, "#d9aab8"], [520, 170, 260, 34, "#f1b89a"],
        [740, 135, 200, 26, "#e7b3b4"], [900, 185, 220, 30, "#f3c1a4"], [60, 215, 160, 18, "#f4c9ad"],
        [420, 215, 320, 22, "#f6c7a5"], [660, 230, 240, 18, "#f2bf9f"], [980, 110, 150, 22, "#d5a9bb"]
    ];
    ctx.shadowBlur = 40;
    clouds.forEach(([x, y, rx, ry, col]) => {
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
}

const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(520, 24, 14),
    new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false, depthWrite: false })
);
skyDome.position.y = -6;
scene.add(skyDome);

// Rams Horn and the foothills in front of it, painted on a billboard far out on the +Z side
function makeMountainTexture() {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 512;
    const ctx = c.getContext("2d");
    const H = c.height;

    // Main range ridgeline (x, y from top). Rams Horn is the blocky summit right of centre.
    const ridge = [
        [0, 330], [120, 318], [230, 300], [330, 308], [420, 290], [500, 296], [590, 278], [660, 262],
        [730, 270], [800, 250], [860, 238], [905, 246], [940, 222], [975, 206], [1000, 212], [1020, 190],
        [1048, 176], [1062, 196], [1082, 172], [1110, 164], [1130, 182], [1160, 200], [1215, 220],
        [1270, 236], [1330, 250], [1400, 244], [1470, 262], [1550, 278], [1640, 290], [1730, 304],
        [1830, 296], [1920, 312], [2048, 326]
    ];
    function ridgePath() {
        ctx.beginPath();
        ctx.moveTo(0, H);
        ridge.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(c.width, H);
        ctx.closePath();
    }
    // Rock in alpenglow: pink-lit tops fading to dusky purple at the base
    let g = ctx.createLinearGradient(0, 160, 0, 400);
    g.addColorStop(0, "#a07f8f");
    g.addColorStop(0.45, "#726680");
    g.addColorStop(1, "#5f5670");
    ridgePath();
    ctx.fillStyle = g;
    ctx.fill();
    // Snow fields on the upper faces
    ctx.save();
    ridgePath();
    ctx.clip();
    ctx.fillStyle = "rgba(236, 214, 216, 0.6)";
    ridge.forEach(([x, y], i) => {
        if (i === 0 || y > 262) {
            return;
        }
        const [px, py] = ridge[i - 1];
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 14, y + 46 + (i % 3) * 12);
        ctx.lineTo(px - 10, py + 60);
        ctx.closePath();
        ctx.fill();
    });
    // Shadowed couloirs
    ctx.fillStyle = "rgba(60, 45, 80, 0.45)";
    for (let i = 2; i < ridge.length - 2; i += 3) {
        const [x, y] = ridge[i];
        ctx.beginPath();
        ctx.moveTo(x, y + 6);
        ctx.lineTo(x - 18, y + 120);
        ctx.lineTo(x + 6, y + 130);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Distance haze over the whole range, heavier low down and toward the ends (clipped to the rock)
    ctx.save();
    ridgePath();
    ctx.clip();
    ctx.fillStyle = "rgba(227, 195, 180, 0.1)";
    ctx.fillRect(0, 0, c.width, c.height);
    g = ctx.createLinearGradient(0, 320, 0, 420);
    g.addColorStop(0, "rgba(227, 195, 180, 0)");
    g.addColorStop(1, "rgba(227, 195, 180, 0.8)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 300, c.width, 120);
    g = ctx.createLinearGradient(0, 0, c.width, 0);
    g.addColorStop(0, "rgba(227, 195, 180, 0.8)");
    g.addColorStop(0.2, "rgba(227, 195, 180, 0)");
    g.addColorStop(0.8, "rgba(227, 195, 180, 0)");
    g.addColorStop(1, "rgba(227, 195, 180, 0.8)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();

    // Rolling timbered foothills, closer and darker
    const hills = [
        [0, 400], [150, 388], [320, 396], [480, 378], [640, 390], [820, 372], [980, 386], [1140, 368],
        [1300, 384], [1480, 374], [1660, 392], [1840, 380], [2048, 398]
    ];
    ctx.beginPath();
    ctx.moveTo(0, H);
    hills.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(c.width, H);
    ctx.closePath();
    g = ctx.createLinearGradient(0, 360, 0, 512);
    g.addColorStop(0, "#4f5a60");
    g.addColorStop(0.5, "#6e6d74");
    g.addColorStop(1, "#e3c3b4");
    ctx.fillStyle = g;
    ctx.fill();

    // Fade the whole base into the haze colour so it meets the ground fog seamlessly
    g = ctx.createLinearGradient(0, 430, 0, H);
    g.addColorStop(0, "rgba(227, 195, 180, 0)");
    g.addColorStop(1, "rgba(227, 195, 180, 1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 430, c.width, H - 430);
    return new THREE.CanvasTexture(c);
}

const mountainW = 300;
const mountainH = mountainW * 512 / 2048;
const mountains = new THREE.Mesh(
    new THREE.PlaneGeometry(mountainW, mountainH),
    new THREE.MeshBasicMaterial({ map: makeMountainTexture(), transparent: true, fog: false, depthWrite: false })
);
mountains.rotation.y = Math.PI;             // face back toward the house
mountains.position.set(0, -30 + mountainH / 2, 240);
scene.add(mountains);

// --- Geometry builder: merges many boxes / quads into one mesh (fewer draw calls) ---
class GeoBuilder {
    constructor() {
        this.pos = [];
        this.nor = [];
        this.uv = [];
        this.idx = [];
        this._m = new THREE.Matrix4();
        this._q = new THREE.Quaternion();
        this._e = new THREE.Euler();
        this._v = new THREE.Vector3();
        this._n = new THREE.Vector3();
    }

    quad(a, b, c, d, n, uvs) {
        const base = this.pos.length / 3;
        [a, b, c, d].forEach((p, i) => {
            this.pos.push(p.x, p.y, p.z);
            this.nor.push(n.x, n.y, n.z);
            this.uv.push(uvs[i][0], uvs[i][1]);
        });
        this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    box(w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, tile = 1) {
        const hw = w / 2;
        const hh = h / 2;
        const hd = d / 2;
        this._e.set(rx, ry, rz, "XYZ");
        this._q.setFromEuler(this._e);
        this._m.compose(this._v.set(x, y, z), this._q, new THREE.Vector3(1, 1, 1));
        const m = this._m;
        const faces = [
            [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd], [1, 0, 0], d, h],
            [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd], [-1, 0, 0], d, h],
            [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd], [0, 1, 0], w, d],
            [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd], [0, -1, 0], w, d],
            [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd], [0, 0, 1], w, h],
            [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd], [0, 0, -1], w, h]
        ];
        faces.forEach(([p0, p1, p2, p3, n, fw, fh]) => {
            const pts = [p0, p1, p2, p3].map((p) => new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(m));
            const nn = this._n.set(n[0], n[1], n[2]).applyQuaternion(this._q).clone();
            const u = fw / tile;
            const v = fh / tile;
            this.quad(pts[0], pts[1], pts[2], pts[3], nn, [[0, 0], [u, 0], [u, v], [0, v]]);
        });
    }

    build() {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
        g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
        g.setIndex(this.idx);
        return g;
    }

    mesh(material, parent, castShadow = true) {
        if (!this.idx.length) {
            return null;
        }
        const m = new THREE.Mesh(this.build(), material);
        m.castShadow = castShadow;
        m.receiveShadow = true;
        parent.add(m);
        return m;
    }
}

// --- Procedural textures ---
function repeatTex(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
}

function makeLapTexture() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    const lap = 16;
    for (let y = 0; y < c.height; y += lap) {
        const g = ctx.createLinearGradient(0, y, 0, y + lap);
        g.addColorStop(0, "#caa57c");
        g.addColorStop(0.75, "#b58f63");
        g.addColorStop(0.93, "#9c7750");
        g.addColorStop(1, "#6e5236");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, c.width, lap);
    }
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    for (let i = 0; i < 6; i += 1) {
        ctx.fillRect(Math.floor(Math.random() * 128), 0, 1, 128);
    }
    return repeatTex(c);
}

function makeCorrugatedTexture() {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 16;
    const ctx = c.getContext("2d");
    const rib = 8;
    for (let x = 0; x < c.width; x += rib) {
        const g = ctx.createLinearGradient(x, 0, x + rib, 0);
        g.addColorStop(0, "#272b30");
        g.addColorStop(0.45, "#4b525a");
        g.addColorStop(1, "#272b30");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, rib, c.height);
    }
    return repeatTex(c);
}

function makeRoofTexture() {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 16;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#1d1f23";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#34373d";
    ctx.fillRect(0, 0, 3, c.height);
    return repeatTex(c);
}

function makeSolarTexture() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 192;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 128, 192);
    g.addColorStop(0, "#1b2d55");
    g.addColorStop(1, "#0f1a33");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 192);
    ctx.strokeStyle = "rgba(205, 215, 235, 0.55)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 192);
        ctx.stroke();
    }
    for (let y = 0; y <= 192; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(128, y);
        ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
}

function makeGarageDoorTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");
    ctx.fillStyle = TREX_HEX;
    ctx.fillRect(0, 0, 256, 256);
    const rowH = 64;
    const colW = 64;
    for (let r = 0; r < 4; r += 1) {
        const y0 = r * rowH;
        if (r > 0) {
            ctx.fillStyle = "#1f150e";
            ctx.fillRect(0, y0 - 2, 256, 4);
        }
        for (let col = 0; col < 4; col += 1) {
            const x0 = col * colW;
            ctx.fillStyle = "#24170f";
            ctx.fillRect(x0 + 9, y0 + 11, 46, 42);
            ctx.fillStyle = "#4a3222";
            ctx.fillRect(x0 + 8, y0 + 10, 46, 42);
        }
    }
    return new THREE.CanvasTexture(c);
}

// Composite deck boards: dark brown with faint grain streaks. Boards run along v (texture y).
function makeDeckTexture() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    const boardW = 32;
    for (let x = 0; x < c.width; x += boardW) {
        ctx.fillStyle = (x / boardW) % 2 ? "#412b1d" : "#3b2719";
        ctx.fillRect(x, 0, boardW, c.height);
        ctx.fillStyle = "rgba(255, 220, 180, 0.07)";
        for (let i = 0; i < 4; i += 1) {
            ctx.fillRect(x + 4 + i * 7, 0, 1, c.height);
        }
        ctx.fillStyle = "#1a110b";
        ctx.fillRect(x + boardW - 3, 0, 3, c.height);
    }
    return repeatTex(c);
}

// "Windy Forest Builds" sign. Draws immediately with fallback fonts, then redraws once web fonts land.
function makeSignTexture() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 416;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;

    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.fillStyle = "#2a1b12";
        ctx.strokeStyle = "#2a1b12";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        // Script line: big loopy W and F, smaller for the rest of each word
        const script = "'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive";
        const parts = [
            { t: "W", s: 215 },
            { t: "indy ", s: 132 },
            { t: "F", s: 215 },
            { t: "orest", s: 132 }
        ];
        let total = 0;
        parts.forEach((p) => {
            ctx.font = `${p.s}px ${script}`;
            p.w = ctx.measureText(p.t).width;
            total += p.w;
        });
        let x = (c.width - total) / 2;
        const baseline = 215;
        parts.forEach((p) => {
            ctx.font = `${p.s}px ${script}`;
            ctx.fillText(p.t, x, baseline);
            ctx.strokeText(p.t, x, baseline);
            x += p.w;
        });

        // Block line underneath
        const block = "'Bebas Neue', 'Oswald', 'Arial Narrow', Impact, sans-serif";
        ctx.font = `150px ${block}`;
        ctx.textAlign = "center";
        const word = "BUILDS";
        const spacing = 22;
        let w = 0;
        for (const ch of word) {
            w += ctx.measureText(ch).width + spacing;
        }
        w -= spacing;
        let bx = (c.width - w) / 2;
        ctx.textAlign = "left";
        for (const ch of word) {
            ctx.fillText(ch, bx, 385);
            bx += ctx.measureText(ch).width + spacing;
        }
        tex.needsUpdate = true;
    }

    draw();
    if (document.fonts && document.fonts.load) {
        Promise.all([
            document.fonts.load("132px 'Great Vibes'"),
            document.fonts.load("150px 'Bebas Neue'")
        ]).then(draw).catch(() => {});
    }
    return tex;
}

// Hog-wire mesh: transparent tile with a 2x2 wire grid
function makeHogWireTexture() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = "#c3c8cf";
    [[0, 0, 5, 128], [123, 0, 5, 128], [59, 0, 10, 128], [0, 0, 128, 5], [0, 123, 128, 5], [0, 59, 128, 10]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
    const tex = repeatTex(c);
    return tex;
}

const TREX_HEX = "#3f2a1c";
const lapTex = makeLapTexture();
const corrTex = makeCorrugatedTexture();
const roofTex = makeRoofTexture();
const deckTex = makeDeckTexture();

// Decking material; boards run along world Z when alongZ is true, otherwise along X
function deckBoardMat(sizeX, sizeZ, alongZ) {
    const tex = deckTex.clone();
    tex.needsUpdate = true;
    const boardW = 0.14;
    if (alongZ) {
        tex.repeat.set(sizeX / (boardW * 4), 1);
    } else {
        // rotated 90deg: texture x now follows box z (repeat.x counts boards along z)
        tex.center.set(0.5, 0.5);
        tex.rotation = Math.PI / 2;
        tex.repeat.set(sizeZ / (boardW * 4), 1);
    }
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82, metalness: 0.02 });
}

function cedarMat(horiz, vert) {
    const tex = lapTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(Math.max(1, horiz), Math.max(0.5, vert));
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.86, metalness: 0.02 });
}

function corrMat(horiz) {
    const tex = corrTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(Math.max(1, horiz / 0.5), 1);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.45 });
}

const roofMetal = (() => {
    const tex = roofTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(16, 1);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.55 });
})();

const trimMat = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.55, metalness: 0.05 });
const timberMat = new THREE.MeshStandardMaterial({ color: 0xd9c398, roughness: 0.8, metalness: 0.02 });
const trussMat = new THREE.MeshStandardMaterial({ color: 0xb8945e, roughness: 0.82, metalness: 0.02 });
const signMat = new THREE.MeshStandardMaterial({
    map: makeSignTexture(),
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.7,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
});
const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6840, roughness: 0.78, metalness: 0.03 });
const sonoMat = new THREE.MeshStandardMaterial({ color: 0x1f2226, roughness: 0.6, metalness: 0.2 });
const railMetalMat = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.45, metalness: 0.7 });
const treadMat = new THREE.MeshStandardMaterial({ color: 0x4a4f56, roughness: 0.55, metalness: 0.65 });
const hogWireMat = new THREE.MeshStandardMaterial({
    map: makeHogWireTexture(),
    alphaTest: 0.4,
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0.6
});
const garageDoorMat = new THREE.MeshStandardMaterial({ map: makeGarageDoorTexture(), roughness: 0.6, metalness: 0.08 });
const entryDoorMat = new THREE.MeshStandardMaterial({ color: 0x3f3a35, roughness: 0.8 });
const concreteMat = new THREE.MeshStandardMaterial({ color: 0x6e6861, roughness: 0.98 });
const solarMat = new THREE.MeshStandardMaterial({ map: makeSolarTexture(), roughness: 0.22, metalness: 0.55 });
const solarFrameMat = new THREE.MeshStandardMaterial({ color: 0xb9bcc2, roughness: 0.4, metalness: 0.7 });
const glassMat = new THREE.MeshStandardMaterial({
    color: 0xa8bdd0,
    roughness: 0.06,
    metalness: 0.4,
    transparent: true,
    opacity: 0.55,
    emissive: 0x223040,
    emissiveIntensity: 0.18
});

// --- House dimensions ---
const W = 7.4;            // along X (front / back wall length)
const D = 5.6;            // along Z (garage / deck wall length)
const HALF_W = W / 2;
const HALF_D = D / 2;
const BASE_H = 0.3;       // exposed stem wall
const FLOOR_H = 2.75;     // storey height
const WAINSCOT = 0.55;    // corrugated skirt height
const WALL_T = 0.16;

const lowerTop = BASE_H + FLOOR_H;            // second-floor line / deck level
const topFront = BASE_H + FLOOR_H * 2 + 0.95; // high eave (+Z, entry side)
const roofRise = 1.2;
const topBack = topFront - roofRise;          // low eave (-Z, hill side)
const slope = roofRise / D;
const roofAngle = Math.atan2(roofRise, D);

// Deck: full +X side, wrapping around the back (-Z)
const deckOut = 3.0;
const backDeckOut = deckOut;
const deckX0 = HALF_W + WALL_T / 2;
const deckX1 = deckX0 + deckOut;
const deckZ0 = -HALF_D - WALL_T / 2;
const deckZ1 = deckZ0 - backDeckOut;

// --- Site: flat pad, steep drive dropping off to -X, hill rising behind (-Z) ---
const dirtMat = new THREE.MeshStandardMaterial({ color: 0x766a5a, roughness: 0.97, metalness: 0 });

const padEdgeX = -HALF_W - 3.4;
const dropSlope = 0.42;
const dropAngle = Math.atan(dropSlope);
const lowerGroundY = -9;
const dropRun = -lowerGroundY / dropSlope;
const dropLen = -lowerGroundY / Math.sin(dropAngle);

// Front (+Z): flat gravel driveway pad, then the ground falls away into timber
const padEdgeZ = HALF_D + 7;
const frontSlope = 1.05;
const frontAngle = Math.atan(frontSlope);
const frontRun = -lowerGroundY / frontSlope;
const frontLen = -lowerGroundY / Math.sin(frontAngle);

const lowerGround = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), dirtMat);
lowerGround.rotation.x = -Math.PI / 2;
lowerGround.position.y = lowerGroundY - 0.02;
scene.add(lowerGround);

const pad = new THREE.Mesh(new THREE.BoxGeometry(90, 12, padEdgeZ + 70), dirtMat);
pad.position.set(padEdgeX + 45, -6, (padEdgeZ - 70) / 2);
pad.receiveShadow = true;
scene.add(pad);

const bankT = 12;
const bankMat = new THREE.MeshStandardMaterial({ color: 0x6a5f50, roughness: 0.98 });
// West bank stops at the front pad edge so it does not meet the front slope in a raised spur
const westBankZ0 = -70;
const westBankLen = padEdgeZ - westBankZ0;
const bank = new THREE.Mesh(new THREE.BoxGeometry(dropLen, bankT, westBankLen), bankMat);
bank.rotation.z = dropAngle;
bank.position.set(
    padEdgeX - dropRun / 2 + (bankT / 2) * Math.sin(dropAngle),
    lowerGroundY / 2 - (bankT / 2) * Math.cos(dropAngle),
    (padEdgeZ + westBankZ0) / 2
);
scene.add(bank);

// Front bank starts at the west pad edge so the two drops stay independent
const frontBankX1 = 70;
const frontBankLenX = frontBankX1 - padEdgeX;
const frontBank = new THREE.Mesh(new THREE.BoxGeometry(frontBankLenX, bankT, frontLen), bankMat);
frontBank.rotation.x = -frontAngle;
frontBank.position.set(
    (padEdgeX + frontBankX1) / 2,
    lowerGroundY / 2 - (bankT / 2) * Math.cos(frontAngle),
    padEdgeZ + frontRun / 2 - (bankT / 2) * Math.sin(frontAngle)
);
frontBank.receiveShadow = true;
scene.add(frontBank);

function makeGravelTexture() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#9a8f80";
    ctx.fillRect(0, 0, 128, 128);
    const tones = ["#857a6c", "#aca18f", "#776d60", "#b8ad9b", "#8f8577"];
    for (let i = 0; i < 900; i += 1) {
        ctx.fillStyle = tones[i % tones.length];
        const r = 1 + (i % 3);
        ctx.fillRect((i * 37) % 128, (i * 59 + (i >> 3)) % 128, r, r);
    }
    return repeatTex(c);
}
const gravelMat = new THREE.MeshStandardMaterial({ map: makeGravelTexture(), roughness: 1, metalness: 0 });
const gravelX0 = padEdgeX + 0.2;
const gravelX1 = 8.5;
const gravelZ0 = HALF_D + 1.5;
const gravel = new THREE.Mesh(new THREE.PlaneGeometry(gravelX1 - gravelX0, padEdgeZ - gravelZ0), gravelMat);
gravel.material.map.repeat.set((gravelX1 - gravelX0) / 1.6, (padEdgeZ - gravelZ0) / 1.6);
gravel.rotation.x = -Math.PI / 2;
gravel.position.set((gravelX0 + gravelX1) / 2, 0.02, (gravelZ0 + padEdgeZ) / 2);
gravel.receiveShadow = true;
scene.add(gravel);

function terrainY(x, z) {
    const west = x < padEdgeX ? Math.max(lowerGroundY, -(padEdgeX - x) * dropSlope) : 0;
    const south = z > padEdgeZ ? Math.max(lowerGroundY, -(z - padEdgeZ) * frontSlope) : 0;
    return Math.min(west, south);
}

const garageCZ = -0.1;
const driveMat = new THREE.MeshStandardMaterial({ color: 0x857b6c, roughness: 0.98 });

const apron = new THREE.Mesh(new THREE.PlaneGeometry(-padEdgeX - HALF_W - 0.1, 4.4), concreteMat);
apron.rotation.x = -Math.PI / 2;
apron.position.set((padEdgeX - HALF_W - 0.1) / 2, 0.03, garageCZ);
apron.receiveShadow = true;
scene.add(apron);

const driveSlope = new THREE.Mesh(new THREE.PlaneGeometry(dropLen + 0.6, 4.6), driveMat);
driveSlope.rotation.order = "ZYX";
driveSlope.rotation.x = -Math.PI / 2;
driveSlope.rotation.z = dropAngle;
driveSlope.position.set(
    padEdgeX - dropRun / 2 - 0.04 * Math.sin(dropAngle),
    lowerGroundY / 2 + 0.04 * Math.cos(dropAngle),
    garageCZ + 0.3
);
scene.add(driveSlope);

const driveLower = new THREE.Mesh(new THREE.PlaneGeometry(30, 4.6), driveMat);
driveLower.rotation.x = -Math.PI / 2;
driveLower.rotation.z = 0.08;
driveLower.position.set(padEdgeX - dropRun - 14.5, lowerGroundY + 0.02, garageCZ + 1.2);
scene.add(driveLower);

const house = new THREE.Group();
scene.add(house);

function slab(mat, w, h, d, x, y, z, parent = house) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}

function wallX(x0, x1, y0, y1, z, matFactory, t = WALL_T) {
    const w = x1 - x0;
    const h = y1 - y0;
    return slab(matFactory(w, h), w, h, t, (x0 + x1) / 2, (y0 + y1) / 2, z);
}

function lowerWallX(x0, x1, y0, y1, z) {
    wallX(x0, x1, y0, y0 + WAINSCOT, z + 0.005, (w) => corrMat(w), WALL_T + 0.01);
    wallX(x0, x1, y0 + WAINSCOT, y1, z, cedarMat);
}

function addWindow(group, w, h, x, y, z = 0, depth = 0.08) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, depth), trimMat);
    frame.position.set(x, y, z);
    group.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth * 0.6), glassMat.clone());
    glass.position.set(x, y, z + depth * 0.25);
    group.add(glass);
    return frame;
}

function addSlidingDoor(group, x, yCenter, z = 0) {
    slab(trimMat, 1.75, 2.05, 0.08, x, yCenter, z, group);
    slab(glassMat.clone(), 0.74, 1.88, 0.05, x - 0.42, yCenter, z + 0.03, group);
    slab(glassMat.clone(), 0.74, 1.88, 0.05, x + 0.42, yCenter, z + 0.035, group);
    slab(trimMat, 0.08, 1.9, 0.07, x, yCenter, z + 0.04, group);
}

function buildSideWall(xCenter, holes = []) {
    const shape = new THREE.Shape();
    shape.moveTo(-HALF_D, BASE_H);
    shape.lineTo(HALF_D, BASE_H);
    shape.lineTo(HALF_D, topFront);
    shape.lineTo(-HALF_D, topBack);
    shape.closePath();
    holes.forEach(([z0, z1, y0, y1]) => {
        const hole = new THREE.Path();
        hole.moveTo(z0, y0);
        hole.lineTo(z1, y0);
        hole.lineTo(z1, y1);
        hole.lineTo(z0, y1);
        hole.closePath();
        shape.holes.push(hole);
    });
    const geo = new THREE.ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false });
    const mesh = new THREE.Mesh(geo, cedarMat(1, 1));
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.x = xCenter + WALL_T / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    house.add(mesh);
    return mesh;
}

// Stem wall
slab(corrMat(W + 0.2), W + 0.2, BASE_H, D + 0.2, 0, BASE_H / 2, 0);

// ============ FRONT WALL (+Z) — entry door centred ============
const sdW = 0.95;
const sdOpenH = 2.1;
const sdX0 = -sdW / 2;
const sdX1 = sdW / 2;

lowerWallX(-HALF_W, sdX0, BASE_H, lowerTop, HALF_D);
lowerWallX(sdX1, HALF_W, BASE_H, lowerTop, HALF_D);
wallX(sdX0, sdX1, BASE_H + sdOpenH, lowerTop, HALF_D, cedarMat);
wallX(-HALF_W, HALF_W, lowerTop, topFront, HALF_D, cedarMat);

const frontFacade = new THREE.Group();
frontFacade.position.set(0, 0, HALF_D + WALL_T / 2 + 0.02);
house.add(frontFacade);

addWindow(frontFacade, 0.75, 1.5, 2.85, 4.85);
addWindow(frontFacade, 0.55, 0.55, -2.3, 1.95);

// "Windy Forest Builds" lettering on the upper siding, left of centre
const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8 * 416 / 1024), signMat);
sign.position.set(-0.6, 4.85, 0.03);
frontFacade.add(sign);
addWindow(frontFacade, 0.55, 0.55, 2.3, 1.95);

const serviceDoorGroup = new THREE.Group();
serviceDoorGroup.position.set(0, BASE_H, HALF_D);
house.add(serviceDoorGroup);
slab(entryDoorMat, sdW - 0.1, sdOpenH - 0.06, 0.08, 0, (sdOpenH - 0.06) / 2, -0.03, serviceDoorGroup);
const doorTrim = new GeoBuilder();
doorTrim.box(sdW + 0.14, 0.1, 0.1, 0, sdOpenH + 0.02, 0.05);
doorTrim.box(0.1, sdOpenH + 0.08, 0.1, -sdW / 2 - 0.02, sdOpenH / 2, 0.05);
doorTrim.box(0.1, sdOpenH + 0.08, 0.1, sdW / 2 + 0.02, sdOpenH / 2, 0.05);
doorTrim.mesh(trimMat, serviceDoorGroup);
const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshStandardMaterial({ color: 0xb8a98a, metalness: 0.7, roughness: 0.35 }));
knob.position.set(0.3, 1.0, 0.06);
serviceDoorGroup.add(knob);
slab(concreteMat, 1.6, BASE_H, 1.0, 0, BASE_H / 2, HALF_D + 0.6);
slab(concreteMat, 1.6, BASE_H / 2, 0.4, 0, BASE_H / 4, HALF_D + 1.3);

// ============ BACK WALL (-Z) ============
lowerWallX(-HALF_W, HALF_W, BASE_H, lowerTop, -HALF_D);
wallX(-HALF_W, HALF_W, lowerTop, topBack, -HALF_D, cedarMat);

const backFacade = new THREE.Group();
backFacade.position.set(0, 0, -HALF_D - WALL_T / 2 - 0.02);
backFacade.rotation.y = Math.PI;
house.add(backFacade);
addWindow(backFacade, 0.6, 0.6, 0.7, 4.45);
addWindow(backFacade, 0.6, 0.6, 1.5, 4.45);
addWindow(backFacade, 0.58, 0.9, 2.0, 4.4);

// ============ LEFT WALL (-X) — garage with king-post timber gable ============
const garageOpenW = 3.4;
const garageOpenH = 2.35;
const gZ0 = garageCZ - garageOpenW / 2;
const gZ1 = garageCZ + garageOpenW / 2;
const gTop = BASE_H + garageOpenH;

buildSideWall(-HALF_W, [[gZ0, gZ1, BASE_H, gTop]]);
slab(corrMat(gZ0 + HALF_D), 0.05, WAINSCOT, gZ0 + HALF_D, -HALF_W - WALL_T / 2 - 0.02, BASE_H + WAINSCOT / 2, (-HALF_D + gZ0) / 2);
slab(corrMat(HALF_D - gZ1), 0.05, WAINSCOT, HALF_D - gZ1, -HALF_W - WALL_T / 2 - 0.02, BASE_H + WAINSCOT / 2, (gZ1 + HALF_D) / 2);

const garageFacade = new THREE.Group();
garageFacade.position.set(-HALF_W - WALL_T / 2 - 0.02, 0, 0);
garageFacade.rotation.y = -Math.PI / 2;
house.add(garageFacade);
addWindow(garageFacade, 0.6, 0.6, -2.05, 5.05);
addWindow(garageFacade, 0.6, 0.6, -1.25, 5.05);
addWindow(garageFacade, 0.45, 1.25, 2.15, 4.8);

const garageGroup = new THREE.Group();
garageGroup.position.set(-HALF_W, 0, garageCZ);
garageGroup.rotation.y = -Math.PI / 2; // local +x -> world +Z, local +z -> world -X (outward)
house.add(garageGroup);

const doorW = garageOpenW - 0.12;
const doorH = gTop - 0.06;
const doorZ = WALL_T / 2 + 0.05;
slab(garageDoorMat, doorW, doorH, 0.08, 0, doorH / 2 + 0.02, doorZ, garageGroup);
const gTrim = new GeoBuilder();
gTrim.box(garageOpenW + 0.2, 0.12, 0.1, 0, gTop + 0.02, doorZ + 0.03);
gTrim.box(0.12, gTop + 0.08, 0.1, -garageOpenW / 2 - 0.04, gTop / 2, doorZ + 0.03);
gTrim.box(0.12, gTop + 0.08, 0.1, garageOpenW / 2 + 0.04, gTop / 2, doorZ + 0.03);
gTrim.mesh(trimMat, garageGroup);

// Timber portico: its own group so the truss can link to Timber Framing
const porticoGroup = new THREE.Group();
porticoGroup.position.copy(garageGroup.position);
porticoGroup.rotation.copy(garageGroup.rotation);
house.add(porticoGroup);

const wallZ = WALL_T / 2;
const proj = 1.5;
const halfSpan = garageOpenW / 2 + 0.45;
const postSize = 0.3;
const tieH = 0.26;
const tieY = gTop + 0.45;
const gableRise = halfSpan * 0.5;
const rafterT = 0.18;
const rafterLen = Math.hypot(halfSpan, gableRise) + 0.3;
const rafterAng = Math.atan2(gableRise, halfSpan);
const outerZ = wallZ + proj;
const postZ = outerZ - postSize / 2 - 0.05;
const postTop = tieY - tieH / 2;

const tb = new GeoBuilder(); // all portico timber in one mesh
const footings = new GeoBuilder();
[-1, 1].forEach((s) => {
    const px = s * (halfSpan - postSize / 2);
    tb.box(postSize, postTop, postSize, px, postTop / 2, postZ);
    tb.box(postSize + 0.08, 0.1, postSize + 0.08, px, postTop - 0.05, postZ);
    footings.box(postSize + 0.16, 0.12, postSize + 0.16, px, 0.06, postZ);
    tb.box(0.2, tieH, proj + 0.16, px, tieY, wallZ + proj / 2 + 0.04);
});
tb.box(halfSpan * 2 + 0.3, tieH, 0.22, 0, tieY, outerZ - 0.08);
tb.box(halfSpan * 2 + 0.3, 0.22, 0.16, 0, tieY, wallZ + 0.1);
const rafterCY = tieY + tieH / 2 + gableRise / 2 + 0.08;
[wallZ + 0.12, outerZ - 0.08].forEach((z) => {
    [-1, 1].forEach((s) => {
        tb.box(rafterLen, rafterT, 0.16, s * halfSpan / 2, rafterCY, z, 0, 0, -s * rafterAng);
    });
});
// King post and struts land on the rafter undersides — no leftover gap, no wall-to-eave purlins
const rafterYAt = (x) => rafterCY + (halfSpan / 2 - Math.abs(x)) * Math.tan(rafterAng);
const rafterUnder = (x) => rafterYAt(x) - (rafterT / 2) / Math.cos(rafterAng);
const kingBottom = tieY + tieH / 2;
const kingTop = rafterUnder(0);
const kingH = kingTop - kingBottom;
tb.box(0.18, kingH, 0.18, 0, (kingTop + kingBottom) / 2, outerZ - 0.08);
const strutFrom = new THREE.Vector2(0.09, kingBottom + 0.14);
const strutTo = new THREE.Vector2(halfSpan * 0.58, rafterUnder(halfSpan * 0.58));
const strutLen = strutFrom.distanceTo(strutTo);
const strutAng = Math.atan2(strutTo.y - strutFrom.y, strutTo.x - strutFrom.x);
[-1, 1].forEach((s) => {
    tb.box(strutLen, 0.14, 0.14, s * (strutFrom.x + strutTo.x) / 2, (strutFrom.y + strutTo.y) / 2, outerZ - 0.08, 0, 0, s * strutAng);
});
const ridgeY = rafterYAt(0) + 0.15;
tb.mesh(trussMat, porticoGroup);
footings.mesh(concreteMat, porticoGroup);

// Roof panels sit on the rafters and stop at the ridge line (nothing above the peak)
const gableRoof = new GeoBuilder();
const cosR = Math.cos(rafterAng);
const tanR = Math.tan(rafterAng);
const panelLen = (halfSpan + 0.1) / cosR + 0.15;      // inner end exactly at x = 0
const panelCX = (panelLen / 2) * cosR;
const panelCY = rafterCY - (panelCX - halfSpan / 2) * tanR + rafterT / 2 + 0.03;
[-1, 1].forEach((s) => {
    gableRoof.box(panelLen, 0.05, proj + 0.7, s * panelCX, panelCY, wallZ + proj / 2, 0, 0, -s * rafterAng);
});
gableRoof.mesh(roofMetal, porticoGroup);

// ============ RIGHT WALL (+X) — deck side ============
buildSideWall(HALF_W);
slab(corrMat(D), 0.05, WAINSCOT, D, HALF_W + WALL_T / 2 + 0.02, BASE_H + WAINSCOT / 2, 0);

const sideFacade = new THREE.Group();
sideFacade.position.set(HALF_W + WALL_T / 2 + 0.02, 0, 0);
sideFacade.rotation.y = Math.PI / 2; // local +x -> world -Z
house.add(sideFacade);

addWindow(sideFacade, 0.45, 1.25, -2.1, 4.8);
addWindow(sideFacade, 0.5, 0.45, 2.0, 1.85);

const remodelWindowGroup = new THREE.Group();
remodelWindowGroup.position.set(-0.3, 4.6, 0);
sideFacade.add(remodelWindowGroup);
addWindow(remodelWindowGroup, 1.0, 1.0, 0, 0);

const slidingDoorZ = -1.5; // world z of the sliding door
const slidingDoorGroup = new THREE.Group();
slidingDoorGroup.position.set(-slidingDoorZ, lowerTop + 1.1, 0);
sideFacade.add(slidingDoorGroup);
addSlidingDoor(slidingDoorGroup, 0, 0);

// ============ FLOORS / INTERIOR ============
const slabMat = new THREE.MeshStandardMaterial({ color: 0x9a948b, roughness: 0.95 });
const plyMat = new THREE.MeshStandardMaterial({ color: 0xc9ad7f, roughness: 0.9 });
slab(slabMat, W - 0.1, 0.1, D - 0.1, 0, BASE_H + 0.05, 0);
slab(plyMat, W - 0.05, 0.2, D - 0.05, 0, lowerTop - 0.1, 0);
const furniture = new GeoBuilder();
furniture.box(0.1, topBack - lowerTop - 0.05, D * 0.55, 0.6, (lowerTop + topBack) / 2, -0.4);
furniture.box(1.6, 0.85, 0.6, 2.1, lowerTop + 0.42, -1.9);
furniture.box(1.7, 0.5, 0.8, -1.4, lowerTop + 0.25, -1.6);
furniture.box(1.7, 0.55, 0.2, -1.4, lowerTop + 0.75, -1.9);
furniture.mesh(new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.85 }), house, false);

// ============ SHED ROOF (high at +Z, low at -Z) ============
const ovFront = 1.2;
const ovBack = 0;
const ovSide = 0.65;
const roofLen = (D + ovFront + ovBack) / Math.cos(roofAngle);
const roofW = W + ovSide * 2;
const roofCZ = (ovFront - ovBack) / 2;
const roofCY = topFront + (roofCZ - HALF_D) * slope;

const roofSlab = slab(roofMetal, roofW, 0.12, roofLen, 0, roofCY + 0.1, roofCZ);
roofSlab.rotation.x = -roofAngle;

const soffit = slab(timberMat, roofW - 0.08, 0.05, roofLen - 0.08, 0, roofCY + 0.01, roofCZ);
soffit.rotation.x = -roofAngle;

const fascia = new GeoBuilder();
fascia.box(roofW, 0.34, 0.06, 0, topFront + ovFront * slope - 0.03, HALF_D + ovFront + 0.03);
fascia.box(roofW, 0.14, 0.05, 0, topBack - 0.02, -HALF_D - 0.03);
[-1, 1].forEach((s) => {
    fascia.box(0.06, 0.3, roofLen, s * (HALF_W + ovSide + 0.03), roofCY - 0.06, roofCZ, -roofAngle, 0, 0);
});
fascia.mesh(roofMetal, house);

// Big square-cut timber tails: six across, like the photo
const tails = new GeoBuilder();
const tailCount = 6;
for (let i = 0; i < tailCount; i += 1) {
    const x = -HALF_W + 0.3 + ((W - 0.6) / (tailCount - 1)) * i;
    const tz = HALF_D + ovFront / 2 - 0.2;
    tails.box(0.26, 0.5, ovFront + 0.15, x, topFront + (tz - HALF_D) * slope - 0.3, tz, -roofAngle, 0, 0);
}
tails.mesh(timberMat, house);

// ============ SOLAR ARRAY ============
const solarGroup = new THREE.Group();
solarGroup.position.set(0, roofCY + 0.1, roofCZ);
solarGroup.rotation.x = -roofAngle;
house.add(solarGroup);

const panelW = 1.05;
const panelL = 1.7;
const standoff = 0.06 + 0.12;
const panelFrames = new GeoBuilder();
const panelFaces = new GeoBuilder();
[-1.0, 0.95].forEach((zl) => {
    [-1.45, -0.25, 0.95].forEach((xl) => {
        panelFrames.box(panelW + 0.06, 0.04, panelL + 0.06, xl, standoff, zl);
        panelFaces.box(panelW, 0.03, panelL, xl, standoff + 0.03, zl, 0, 0, 0, panelL);
        [-0.6, 0.6].forEach((dz) => {
            panelFrames.box(0.08, standoff, 0.08, xl - panelW / 2 + 0.1, standoff / 2, zl + dz);
            panelFrames.box(0.08, standoff, 0.08, xl + panelW / 2 - 0.1, standoff / 2, zl + dz);
        });
    });
});
panelFrames.mesh(solarFrameMat, solarGroup);
panelFaces.mesh(solarMat, solarGroup);

// ============ WRAP-AROUND DECK: framing, posts, hog-wire rail, stair ============
const deckGroup = new THREE.Group();
deckGroup.position.set(0, lowerTop + 0.1, 0);
house.add(deckGroup);

const JOIST_H = 0.26;
const JOIST_SPACING = 0.41;
const deckTop = JOIST_H / 2;                 // local y of the deck surface
const groundLocal = -deckGroup.position.y;   // local y of grade
const deckFrontZ = HALF_D + JOIST_SPACING * 2; // two bays past the front wall
const backDeckX0 = 0;                         // back wing only covers the +X half
const sideMidX = (deckX0 + deckX1) / 2;
const sideMidZ = (deckFrontZ + deckZ1) / 2;
const backMidX = (backDeckX0 + deckX1) / 2;
const backMidZ = (deckZ0 + deckZ1) / 2;
const sideLen = deckFrontZ - deckZ1;
const backDeckW = deckX1 - backDeckX0;

const dw = new GeoBuilder();   // wood framing + posts + stringers
const ds = new GeoBuilder();   // sonotubes
const dm = new GeoBuilder();   // metal rails + treads
const dwire = new GeoBuilder(); // hog-wire panels

// Side wing (+X), now past the front wall
dw.box(0.08, JOIST_H, HALF_D - deckZ0, deckX0 + 0.04, 0, (HALF_D + deckZ0) / 2);
dw.box(0.08, JOIST_H, sideLen, deckX1 - 0.04, 0, sideMidZ);
dw.box(deckOut, JOIST_H, 0.08, sideMidX, 0, deckFrontZ - 0.04);
for (let z = deckFrontZ - 0.2; z > deckZ1 + 0.15; z -= JOIST_SPACING) {
    dw.box(deckOut - 0.16, JOIST_H, 0.06, sideMidX, 0, z);
}
// Back wing (-Z), only the +X half of the house and a short cantilever off the wall
dw.box(backDeckW, JOIST_H, 0.08, backMidX, 0, deckZ0 - 0.04);
dw.box(backDeckW, JOIST_H, 0.08, backMidX, 0, deckZ1 + 0.04);
dw.box(0.08, JOIST_H, backDeckOut, backDeckX0 + 0.04, 0, backMidZ);
for (let x = backDeckX0 + 0.3; x < deckX1 - 0.1; x += JOIST_SPACING) {
    dw.box(0.06, JOIST_H, backDeckOut - 0.16, x, 0, backMidZ);
}
// Composite decking over the framing
const BOARD_T = 0.03;
slab(deckBoardMat(deckOut, sideLen, true), deckOut, BOARD_T, sideLen, sideMidX, deckTop + BOARD_T / 2, sideMidZ, deckGroup);
slab(deckBoardMat(backDeckW, backDeckOut, false), backDeckW, BOARD_T, backDeckOut, backMidX, deckTop + BOARD_T / 2, backMidZ, deckGroup);
// Drop beams
dw.box(0.18, 0.24, sideLen - 0.3, deckX1 - 0.3, -0.25, sideMidZ - 0.15);
dw.box(backDeckW - 0.3, 0.24, 0.18, backMidX - 0.1, -0.25, deckZ1 + 0.3);

function groundPost(x, z, topLocal = 1.15) {
    const bottom = groundLocal + 0.55;
    const h = topLocal - bottom;
    dw.box(0.16, h, 0.16, x, bottom + h / 2, z);
    ds.box(0.36, 0.55, 0.36, x, bottom - 0.275, z);
}
function railPost(x, z, h = 1.05) {
    dw.box(0.14, h, 0.14, x, deckTop + h / 2, z);
}

// Stair landing geometry (needs to be known before placing side posts)
const landingZ = slidingDoorZ - 0.5;        // a bit toward the hill from the sliding door
const landingW = 1.3;                       // along z
const landingOut = 1.3;                     // along x off the deck edge
const landingZ0 = landingZ - landingW / 2;  // hill side edge
const landingZ1 = landingZ + landingW / 2;  // stair side edge
const landingCX = deckX1 + landingOut / 2;

const sidePostX = deckX1 - 0.3;
const backPostZ = deckZ1 + 0.3;
// Last ground post sits at the front wall; the two bays past that cantilever
const sidePostZs = [HALF_D - 0.15, 0.6, landingZ1, landingZ0, backPostZ];
sidePostZs.forEach((z) => groundPost(sidePostX, z));
railPost(sidePostX, deckFrontZ - 0.25);

const backPostXs = [];
const backSpan = sidePostX - (backDeckX0 + 0.3);
const backBays = Math.max(1, Math.round(backSpan / 1.65));
for (let i = 0; i < backBays; i += 1) {
    backPostXs.push(backDeckX0 + 0.3 + (backSpan / backBays) * i);
}
backPostXs.forEach((x) => groundPost(x, backPostZ));

// Rails at the cut end of the back wing and the new front extension
railPost(backDeckX0 + 0.3, backMidZ);
railPost(backDeckX0 + 0.3, deckZ0 - 0.15);
railPost(deckX0 + 0.12, deckFrontZ - 0.15);
railPost(deckX0 + 0.12, HALF_D + 0.08);

// Metal rail + hog-wire panel between two post centres (same base height)
const RAIL_TOP = 1.0;
const RAIL_BOT = 0.1;
function railRun(x0, z0, x1, z1, baseY = deckTop) {
    const dx = x1 - x0;
    const dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    if (len < 0.3) {
        return;
    }
    const ry = Math.atan2(dx, dz);
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    dm.box(0.06, 0.05, len - 0.14, cx, baseY + RAIL_TOP, cz, 0, ry, 0);
    dm.box(0.05, 0.04, len - 0.14, cx, baseY + RAIL_BOT, cz, 0, ry, 0);
    const ux = dx / len;
    const uz = dz / len;
    const inset = 0.08;
    const a = new THREE.Vector3(x0 + ux * inset, baseY + RAIL_BOT + 0.03, z0 + uz * inset);
    const b = new THREE.Vector3(x1 - ux * inset, baseY + RAIL_BOT + 0.03, z1 - uz * inset);
    const c = new THREE.Vector3(b.x, baseY + RAIL_TOP - 0.03, b.z);
    const d = new THREE.Vector3(a.x, baseY + RAIL_TOP - 0.03, a.z);
    const n = new THREE.Vector3(uz, 0, -ux);
    const tile = 0.3;
    const u = (len - inset * 2) / tile;
    const v = (RAIL_TOP - RAIL_BOT - 0.06) / tile;
    dwire.quad(a, b, c, d, n, [[0, 0], [u, 0], [u, v], [0, v]]);
}

// Side outer edge (gap left where the landing attaches)
for (let i = 0; i < sidePostZs.length - 1; i += 1) {
    const z0 = sidePostZs[i];
    const z1 = sidePostZs[i + 1];
    if (z0 === landingZ1 && z1 === landingZ0) {
        continue;
    }
    railRun(sidePostX, z0, sidePostX, z1);
}
railRun(sidePostX, HALF_D - 0.15, sidePostX, deckFrontZ - 0.25);
// Front end of the side wing (past the house) and the inner edge of that extension
railRun(deckX0 + 0.12, HALF_D + 0.08, deckX0 + 0.12, deckFrontZ - 0.15);
railRun(deckX0 + 0.12, deckFrontZ - 0.15, sidePostX, deckFrontZ - 0.25);
// Back outer edge
for (let i = 0; i < backPostXs.length; i += 1) {
    const nextX = i + 1 < backPostXs.length ? backPostXs[i + 1] : sidePostX;
    railRun(backPostXs[i], backPostZ, nextX, backPostZ);
}
// Cut end of the back wing (halfway across the house)
railRun(backDeckX0 + 0.3, backPostZ, backDeckX0 + 0.3, backMidZ);
railRun(backDeckX0 + 0.3, backMidZ, backDeckX0 + 0.3, deckZ0 - 0.15);

// --- Landing off the deck edge, on two posts ---
dw.box(landingOut, JOIST_H, landingW, landingCX, 0, landingZ);
slab(deckBoardMat(landingOut, landingW, true), landingOut, BOARD_T, landingW, landingCX, deckTop + BOARD_T / 2, landingZ, deckGroup);
const landingPostX = deckX1 + landingOut - 0.1;
groundPost(landingPostX, landingZ0 + 0.1);
groundPost(landingPostX, landingZ1 - 0.1);
railRun(landingPostX, landingZ0 + 0.1, landingPostX, landingZ1 - 0.1);
railRun(sidePostX, landingZ0, landingPostX, landingZ0 + 0.1);

// --- Stair: big wood stringers, metal treads, heading away from the hill (+Z) ---
const stairW = 1.2;
const stairCX = landingCX;
const totalRise = deckTop - groundLocal;
const riserCount = 17;
const riser = totalRise / riserCount;
const run = 0.29;
const stairZ0 = landingZ1;
const stairLen = run * riserCount;
const stairZ1 = stairZ0 + stairLen;
const stairAng = Math.atan2(totalRise, stairLen);
const stringerLen = Math.hypot(stairLen, totalRise);
const stairMidZ = (stairZ0 + stairZ1) / 2;
const stairMidY = (deckTop + groundLocal) / 2;
const stairLineY = (z) => deckTop - (z - stairZ0) * (totalRise / stairLen);

[-1, 1].forEach((s) => {
    const sx = stairCX + s * (stairW / 2 - 0.05);
    dw.box(0.1, 0.36, stringerLen, sx, stairMidY - 0.1, stairMidZ, stairAng, 0, 0);
});
for (let k = 1; k < riserCount; k += 1) {
    dm.box(stairW, 0.04, run - 0.02, stairCX, deckTop - k * riser + 0.02, stairZ0 + (k - 0.5) * run);
}

// Stair rail posts: at the landing edge, mid-run (also carries the stringers), and the bottom
const stairRailH = 1.0;
const midZ = stairZ0 + stairLen * 0.5;
railPost(stairCX - (stairW / 2 - 0.05), stairZ0 + 0.1, stairRailH);
[-1, 1].forEach((s) => {
    const sx = stairCX + s * (stairW / 2 - 0.05);
    const topY = stairLineY(midZ) + stairRailH;
    dw.box(0.12, topY - groundLocal, 0.12, sx, (topY + groundLocal) / 2, midZ);
    ds.box(0.3, 0.1, 0.3, sx, groundLocal + 0.05, midZ);
    dw.box(0.12, stairRailH + 0.1, 0.12, sx, groundLocal + (stairRailH + 0.1) / 2, stairZ1 - 0.08);
    // sloped top rail + wire
    const railY = (stairLineY(stairZ0) + stairLineY(stairZ1)) / 2 + stairRailH - 0.05;
    dm.box(0.06, 0.05, stringerLen, sx, railY, stairMidZ, stairAng, 0, 0);
    const za = stairZ0 + 0.16;
    const zb = stairZ1 - 0.14;
    const a = new THREE.Vector3(sx, stairLineY(za) + 0.3, za);
    const b = new THREE.Vector3(sx, stairLineY(zb) + 0.3, zb);
    const c = new THREE.Vector3(sx, stairLineY(zb) + stairRailH - 0.09, zb);
    const d = new THREE.Vector3(sx, stairLineY(za) + stairRailH - 0.09, za);
    const u = (zb - za) / Math.cos(stairAng) / 0.3;
    const v = (stairRailH - 0.39) / 0.3;
    dwire.quad(a, b, c, d, new THREE.Vector3(s, 0, 0), [[0, 0], [u, 0], [u, v], [0, v]]);
});

dw.mesh(woodMat, deckGroup);
ds.mesh(sonoMat, deckGroup);
dm.mesh(railMetalMat, deckGroup);
dwire.mesh(hogWireMat, deckGroup, false);
slab(concreteMat, stairW + 0.4, 0.08, 0.9, stairCX, groundLocal + 0.04, stairZ1 + 0.4, deckGroup);

// --- Back gutter, rain tank on the remaining back deck, BBQ in front of the tank ---
const gutterMat = new THREE.MeshStandardMaterial({ color: 0x6a6f74, roughness: 0.42, metalness: 0.72 });
const tankMat = new THREE.MeshStandardMaterial({ color: 0x2c353b, roughness: 0.62, metalness: 0.12 });
const grillMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.48, metalness: 0.45 });
const grillAccent = new THREE.MeshStandardMaterial({ color: 0xb08a3a, roughness: 0.45, metalness: 0.55 });

const gutterY = topBack - ovBack * slope - 0.2;
const gutterZ = -HALF_D - ovBack - 0.08;
slab(gutterMat, W + 0.4, 0.09, 0.12, 0, gutterY, gutterZ);

const tankX = 1.7;
const tankH = 1.28;
const tankR = 0.52;
const tankLocalY = deckTop + 0.06 + tankH / 2;
const tankZ = deckZ0 - 0.58;
slab(woodMat, 1.16, 0.08, 1.16, tankX, deckTop + 0.07, tankZ, deckGroup);
const tank = new THREE.Mesh(new THREE.CylinderGeometry(tankR - 0.03, tankR, tankH, 16), tankMat);
tank.position.set(tankX, tankLocalY, tankZ);
tank.castShadow = true;
tank.receiveShadow = true;
deckGroup.add(tank);
slab(tankMat, tankR * 2.05, 0.06, tankR * 2.05, tankX, tankLocalY + tankH / 2 + 0.03, tankZ, deckGroup);
const tankBand = new THREE.Mesh(new THREE.TorusGeometry(tankR - 0.02, 0.03, 8, 18), gutterMat);
tankBand.rotation.x = Math.PI / 2;
tankBand.position.set(tankX, tankLocalY, tankZ);
deckGroup.add(tankBand);

const tankTopWorld = deckGroup.position.y + tankLocalY + tankH / 2 + 0.05;
const dropH = gutterY - tankTopWorld;
slab(gutterMat, 0.07, dropH, 0.07, tankX, gutterY - dropH / 2, gutterZ);
slab(gutterMat, 0.07, 0.07, Math.abs(tankZ - gutterZ) + 0.04, tankX, tankTopWorld, (tankZ + gutterZ) / 2);

// Cart grill between the barrel and the hangout, front facing the side deck (+X)
const grillGroup = new THREE.Group();
grillGroup.position.set(tankX + 1.35, 0, tankZ - 0.58);
grillGroup.rotation.y = Math.PI / 2;
deckGroup.add(grillGroup);
const gb = new GeoBuilder();
const gs = new GeoBuilder();
gb.box(1.25, 0.55, 0.72, 0, deckTop + 0.62, 0);
gb.box(1.28, 0.08, 0.76, 0, deckTop + 0.94, 0);
gb.box(1.22, 0.04, 0.68, 0, deckTop + 0.9, 0.02);
gb.box(0.08, 0.22, 0.08, -0.48, deckTop + 1.08, 0.28);
gb.box(0.08, 0.22, 0.08, 0, deckTop + 1.08, 0.28);
gb.box(0.08, 0.22, 0.08, 0.48, deckTop + 1.08, 0.28);
[-1, 1].forEach((sx) => {
    [-1, 1].forEach((sz) => {
        gb.box(0.07, 0.38, 0.07, sx * 0.52, deckTop + 0.19, sz * 0.28);
    });
});
gb.box(0.55, 0.06, 0.5, 0.95, deckTop + 0.92, 0);
gb.mesh(grillMat, grillGroup);
gs.box(0.55, 0.12, 0.04, 0, deckTop + 0.98, 0.4);
gs.box(0.06, 0.06, 0.18, -0.48, deckTop + 1.2, 0.36);
gs.box(0.06, 0.06, 0.18, 0, deckTop + 1.2, 0.36);
gs.box(0.06, 0.06, 0.18, 0.48, deckTop + 1.2, 0.36);
gs.mesh(grillAccent, grillGroup);
const tankSmall = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 10), grillMat);
tankSmall.position.set(-0.82, deckTop + 0.32, -0.12);
grillGroup.add(tankSmall);

// ============ FOREST (instanced) ============
const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2f5c38, roughness: 0.92 });
const foliageDark = new THREE.MeshStandardMaterial({ color: 0x27492f, roughness: 0.92 });

const forestSpots = [];
for (let i = 0; i < 26; i += 1) {
    const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.09;
    const r = 23 + (i % 4) * 2.2;
    forestSpots.push([Math.cos(a) * r, Math.sin(a) * r, 1.25 + (i % 3) * 0.2]);
}
for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2 + 0.17;
    const r = 31 + (i % 3) * 2.5;
    forestSpots.push([Math.cos(a) * r, Math.sin(a) * r, 1.5 + (i % 2) * 0.3]);
}
for (let i = 0; i < 14; i += 1) {
    const x = padEdgeX - dropRun - 4 - (i % 5) * 5.5;
    const z = -22 + i * 3.3;
    if (Math.abs(z - garageCZ) > 4) {
        forestSpots.push([x, z, 1.6 + (i % 3) * 0.25]);
    }
}

// Dense timber on the slope below the driveway pad
for (let row = 0; row < 9; row += 1) {
    const z = padEdgeZ + 4.5 + row * 4.6;
    for (let col = 0; col < 19; col += 1) {
        const x = -41 + col * 4.6 + ((row * 7 + col * 13) % 5) * 0.55 - 1.1;
        const zj = z + ((row * 11 + col * 3) % 4) * 0.5;
        forestSpots.push([x, zj, 1.35 + ((row + col) % 4) * 0.18]);
    }
}
// Keep a view corridor open from the man door toward the mountain
function inViewCorridor(x, z) {
    return z > padEdgeZ - 2 && Math.abs(x - 1) < 6 + (z - padEdgeZ) * 0.22;
}
for (let i = forestSpots.length - 1; i >= 0; i -= 1) {
    if (inViewCorridor(forestSpots[i][0], forestSpots[i][1])) {
        forestSpots.splice(i, 1);
    }
}

const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 2.6, 7);
const coneGeo = new THREE.ConeGeometry(1, 1.5, 7);
const forestTrunkMat = woodMat.clone();
const forestGroup = new THREE.Group();
scene.add(forestGroup);
const trunks = new THREE.InstancedMesh(trunkGeo, forestTrunkMat, forestSpots.length);
const conesA = new THREE.InstancedMesh(coneGeo, foliageMat, forestSpots.length * 2);
const conesB = new THREE.InstancedMesh(coneGeo, foliageDark, forestSpots.length * 2);
const im = new THREE.Matrix4();
const iq = new THREE.Quaternion();
forestSpots.forEach(([x, z, s], i) => {
    const y0 = terrainY(x, z);
    im.compose(new THREE.Vector3(x, y0 + 1.3 * s, z), iq, new THREE.Vector3(s, s, s));
    trunks.setMatrixAt(i, im);
    for (let j = 0; j < 4; j += 1) {
        const r = (1.15 - j * 0.2) * s;
        im.compose(new THREE.Vector3(x, y0 + (2.4 + j * 0.95) * s, z), iq, new THREE.Vector3(r, s, r));
        (j % 2 ? conesB : conesA).setMatrixAt(i * 2 + Math.floor(j / 2), im);
    }
});
[trunks, conesA, conesB].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    forestGroup.add(inst);
});

// Clickable foreground tree (regular meshes so it can be a region)
const treeGroup = new THREE.Group();
treeGroup.position.set(-10.5, terrainY(-10.5, -5.5), -5.5);
scene.add(treeGroup);
(function buildClickTree(s) {
    const trunk = new THREE.Mesh(trunkGeo, woodMat);
    trunk.position.y = 1.3 * s;
    trunk.scale.setScalar(s);
    trunk.castShadow = true;
    treeGroup.add(trunk);
    for (let j = 0; j < 4; j += 1) {
        const r = (1.15 - j * 0.2) * s;
        const layer = new THREE.Mesh(coneGeo, j % 2 ? foliageDark : foliageMat);
        layer.position.y = (2.4 + j * 0.95) * s;
        layer.scale.set(r, s, r);
        layer.castShadow = true;
        treeGroup.add(layer);
    }
})(0.95);

// --- Interaction ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredRegion = null;
let pointerDirty = false;

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
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 10;
    sprite.scale.set(2.1, 0.5, 1);
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
            if (child.material && child.material.emissive) {
                child.material.userData.baseEmissive = child.material.emissive.getHex();
                child.material.userData.baseEmissiveIntensity = child.material.emissiveIntensity || 0;
            }
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

registerClickRegion(garageGroup, "New-Construction.html", "New Construction", new THREE.Vector3(0, doorH * 0.55, doorZ + 0.4));
registerClickRegion(porticoGroup, "timber-framing.html", "Timber Framing", new THREE.Vector3(0, ridgeY + 0.7, outerZ + 0.3));
registerClickRegion(deckGroup, "deck-building.html", "Deck Building", new THREE.Vector3(deckX1 - 0.6, 1.9, 0.9));
registerClickRegion(forestGroup, "tree-trimming.html", null, new THREE.Vector3());
registerClickRegion(treeGroup, "tree-trimming.html", "Tree Service", new THREE.Vector3(0, 5.9, 0));
registerClickRegion(slidingDoorGroup, "interior-design.html", "Interior Design", new THREE.Vector3(0, 1.3, 0.5));
registerClickRegion(serviceDoorGroup, "handyman.html", "Handyman", new THREE.Vector3(0, sdOpenH + 0.5, 0.5));
registerClickRegion(remodelWindowGroup, "Remodels.html", "Remodels", new THREE.Vector3(0, -1.0, 0.5));
registerClickRegion(solarGroup, "off-grid-consulting.html", "Off Grid Consulting", new THREE.Vector3(-0.25, 1.1, 0));

const HOUSE_FALLBACK = "handyman.html";
house.traverse((child) => {
    if (child.isMesh && !child.userData.link) {
        child.userData.fallbackLink = HOUSE_FALLBACK;
    }
});

// Raycast against everything solid so a click can't pass through a wall.
const pickables = [];
scene.traverse((child) => {
    if (child.isMesh) {
        pickables.push(child);
    }
});

function linkFor(obj) {
    if (!obj || !obj.userData) {
        return null;
    }
    return obj.userData.link || obj.userData.fallbackLink || null;
}

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
            mat.emissiveIntensity = 0.28;
        } else {
            mat.emissive.setHex(mat.userData.baseEmissive ?? 0x000000);
            mat.emissiveIntensity = mat.userData.baseEmissiveIntensity ?? 0;
        }
    });
    if (region.label && region.label.material) {
        region.label.material.opacity = active ? 1 : 0.55;
    }
}

function setPointerFromEvent(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function findHit() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    return hits.length ? hits[0].object : null;
}

function regionFromObject(obj) {
    if (!obj || !obj.userData.regionRoot) {
        return null;
    }
    return clickRegions.find((r) => r.root === obj.userData.regionRoot) || null;
}

function updateHover() {
    const hitObj = findHit();
    const nextRegion = regionFromObject(hitObj);
    if (nextRegion !== hoveredRegion) {
        setRegionHighlight(hoveredRegion, false);
        hoveredRegion = nextRegion;
        setRegionHighlight(hoveredRegion, true);
    }
    document.body.style.cursor = linkFor(hitObj) ? "pointer" : "default";
}

function onPointerMove(event) {
    setPointerFromEvent(event);
    pointerDirty = true; // raycast once per frame, not per event
}

// A "tap" is a press that doesn't move much or last long; a drag orbits the camera instead.
const TAP_MAX_MOVE = 10;
const TAP_MAX_MS = 500;
let pressStart = null;

function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
        pressStart = null;
        return;
    }
    pressStart = { x: event.clientX, y: event.clientY, t: performance.now(), id: event.pointerId };
}

function onPointerUp(event) {
    if (!pressStart || pressStart.id !== event.pointerId) {
        return;
    }
    const moved = Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y);
    const held = performance.now() - pressStart.t;
    pressStart = null;
    if (moved > TAP_MAX_MOVE || held > TAP_MAX_MS) {
        return;
    }
    setPointerFromEvent(event);
    const link = linkFor(findHit());
    if (link) {
        window.location.href = link;
    }
}

renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("pointerdown", onPointerDown);
renderer.domElement.addEventListener("pointerup", onPointerUp);
renderer.domElement.addEventListener("pointercancel", () => { pressStart = null; });

function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    if (pointerDirty) {
        pointerDirty = false;
        updateHover();
    }
    clickRegions.forEach((region, idx) => {
        if (region.label) {
            const pulse = 0.55 + Math.sin(t * 2 + idx) * 0.08;
            region.label.material.opacity = hoveredRegion === region ? 1 : pulse;
        }
    });
    controls.target.y = baseTargetY + (isUserInteracting ? 0 : Math.sin(t * 0.6) * 0.04);
    controls.update();
    renderer.render(scene, camera);
}
animate();

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = fitCameraFov();
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onResize);
window.addEventListener("orientationchange", () => setTimeout(onResize, 120));
