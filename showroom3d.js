const stoneData = [
    {
        name: "Gucci Black",
        category: "Bookmatch Marble",
        m2: "976",
        slab: "183",
        img: "assets/images/materials/GUCCI BLACK BOOKMATCH 3.jpg",
        note: "Statement wall, lobby, lift foyer"
    },
    {
        name: "Lavish Gold",
        category: "Warm Marble",
        m2: "145",
        slab: "32",
        img: "assets/images/materials/LAVISH GOLD.jpeg",
        note: "Living area, bathroom, hospitality counter"
    },
    {
        name: "Statuario Turkey",
        category: "White Marble",
        m2: "450",
        slab: "85",
        img: "assets/images/materials/STATUARIO TURKEY 2.jpg",
        note: "Clean modern walls and floors"
    },
    {
        name: "Verde Amber",
        category: "Exotic Stone",
        m2: "Pre-order",
        slab: "Curated",
        img: "assets/images/materials/VERDE AMBER.jpg",
        note: "Feature bar, powder room, private lobby"
    }
];

const roomHotspots = [
    { name: "Wall Mockup", category: "Showroom Zone", m2: "Full-scale", slab: "3 bays", note: "Bidang dinding untuk membaca bookmatch dan proporsi urat.", position: [7.3, 2.8, -5.6] },
    { name: "Consultation Desk", category: "Project Desk", m2: "RAB", slab: "Sampling", note: "Area diskusi tone, finishing, volume, dan jadwal pengiriman.", position: [4.3, 1.8, 3.2] },
    { name: "Sample Island", category: "Detail Station", m2: "Close-up", slab: "Swatches", note: "Tempat membandingkan potongan material dan finishing.", position: [-1.2, 1.25, 4.2] }
];

const container = document.getElementById("canvas-container");
const tooltip = document.getElementById("data-tooltip");
const ttTitle = document.getElementById("tt-title");
const ttCat = document.getElementById("tt-cat");
const ttM2 = document.getElementById("tt-m2");
const ttSlab = document.getElementById("tt-slab");
let hovered = null;
let selected = null;
let isTransitioning = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#101217");
scene.fog = new THREE.Fog("#101217", 22, 48);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
camera.position.set(11, 8, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 7;
controls.maxDistance = 32;
controls.maxPolarAngle = Math.PI / 2 - 0.08;
controls.target.set(0, 2.2, 0);
controls.addEventListener("start", () => {
    isTransitioning = false;
});

const textureLoader = new THREE.TextureLoader();
const interactiveObjects = [];
const pointer = new THREE.Vector2(10, 10);
const raycaster = new THREE.Raycaster();

const viewTargets = {
    overview: { position: new THREE.Vector3(11, 8, 16), target: new THREE.Vector3(0, 2.2, 0) },
    slabs: { position: new THREE.Vector3(-10, 4.8, 8), target: new THREE.Vector3(-5.2, 2.8, -3) },
    wall: { position: new THREE.Vector3(9, 4.5, 7), target: new THREE.Vector3(6.7, 2.7, -4.4) },
    consult: { position: new THREE.Vector3(4.8, 4.4, 10), target: new THREE.Vector3(2.7, 1.8, 2.6) }
};
let desiredView = viewTargets.overview;

function sizeRenderer() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

function makeMat(color, roughness = 0.45, metalness = 0.05) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function loadStoneTexture(src) {
    const texture = textureLoader.load(src);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
}

function addBox(name, size, position, material, options = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    if (options.rotation) mesh.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
    mesh.castShadow = options.castShadow !== false;
    mesh.receiveShadow = options.receiveShadow !== false;
    scene.add(mesh);
    return mesh;
}

function addRoom() {
    const floorMat = makeMat(0xdad4c7, 0.34, 0.12);
    const wallMat = makeMat(0x242832, 0.62, 0.02);
    const accentWallMat = makeMat(0x171a21, 0.52, 0.04);
    const trimMat = makeMat(0xb89b5e, 0.28, 0.38);

    addBox("polished showroom floor", [28, 0.18, 18], [0, -0.09, 0], floorMat, { receiveShadow: true, castShadow: false });
    addBox("back display wall", [28, 7, 0.28], [0, 3.4, -8.9], wallMat, { castShadow: false });
    addBox("left gallery wall", [0.28, 7, 18], [-14, 3.4, 0], accentWallMat, { castShadow: false });
    addBox("right mockup wall", [0.28, 7, 18], [14, 3.4, 0], accentWallMat, { castShadow: false });

    for (let i = -2; i <= 2; i += 1) {
        addBox("ceiling brass rail", [0.08, 0.08, 16.5], [i * 4.5, 6.9, -0.2], trimMat, { castShadow: false });
    }

    addBox("entrance path", [7.5, 0.035, 10], [0, 0.02, 3.5], makeMat(0xeee8dc, 0.28, 0.12), { castShadow: false });
    addBox("Global Stone back sign", [5.8, 0.12, 0.12], [0, 5.7, -8.68], trimMat, { castShadow: false });
}

function addLighting() {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x14161d, 1.35));

    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(-5, 9, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -20;
    key.shadow.camera.right = 20;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -20;
    scene.add(key);

    const warm = new THREE.PointLight(0xb89b5e, 1.4, 22);
    warm.position.set(7, 4, 4);
    scene.add(warm);

    [-9, -4.5, 0, 4.5, 9].forEach((x) => {
        const spot = new THREE.SpotLight(0xffffff, 1.35, 18, Math.PI / 6, 0.55, 1.6);
        spot.position.set(x, 6.5, -2);
        spot.target.position.set(x * 0.8, 1.8, -7.5);
        spot.castShadow = true;
        scene.add(spot);
        scene.add(spot.target);
    });
}

function addSlabGallery() {
    const rackMat = makeMat(0x0f1116, 0.5, 0.28);
    addBox("slab rack base", [10.8, 0.35, 0.8], [-6.8, 0.25, -7.35], rackMat);

    stoneData.forEach((data, index) => {
        const texture = loadStoneTexture(data.img);
        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.25,
            metalness: 0.06
        });
        const slab = addBox(data.name, [2.35, 4.7, 0.18], [-11.2 + index * 2.85, 2.65, -7.05], mat, {
            rotation: [0, -0.08 + index * 0.045, 0]
        });
        slab.userData = { ...data, kind: "stone" };
        interactiveObjects.push(slab);

        addBox(`${data.name} brass edge`, [2.5, 4.86, 0.06], [-11.2 + index * 2.85, 2.65, -7.18], makeMat(0xb89b5e, 0.32, 0.42), {
            rotation: [0, -0.08 + index * 0.045, 0],
            castShadow: false
        });
    });
}

function addWallMockup() {
    const wallBase = makeMat(0x0e1015, 0.42, 0.12);
    addBox("mockup plinth", [0.5, 0.45, 11], [13.62, 0.28, -2.8], wallBase);

    stoneData.slice(0, 3).forEach((data, index) => {
        const texture = loadStoneTexture(data.img);
        const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.24, metalness: 0.04 });
        const panel = addBox(`${data.name} wall mockup`, [0.22, 4.25, 2.8], [13.45, 2.85, -6 + index * 3.25], mat);
        panel.userData = { ...data, name: `${data.name} Mockup`, category: "Wall Application", kind: "stone" };
        interactiveObjects.push(panel);
    });

    const counterTexture = loadStoneTexture(stoneData[1].img);
    const counterMat = new THREE.MeshStandardMaterial({ map: counterTexture, roughness: 0.22, metalness: 0.04 });
    const counter = addBox("Lavish Gold reception counter", [4.4, 1.05, 1.55], [6.1, 0.7, 3.25], counterMat);
    counter.userData = { ...stoneData[1], name: "Reception Counter Mockup", category: "Counter Application", kind: "stone" };
    interactiveObjects.push(counter);
}

function addConsultationArea() {
    const tableTop = makeMat(0x161820, 0.35, 0.2);
    const legMat = makeMat(0xb89b5e, 0.26, 0.42);
    addBox("consultation table", [4.8, 0.22, 2.4], [-0.8, 1.05, 4.2], tableTop);
    addBox("left table leg", [0.16, 1.8, 2.1], [-2.85, 0.35, 4.2], legMat);
    addBox("right table leg", [0.16, 1.8, 2.1], [1.25, 0.35, 4.2], legMat);

    stoneData.forEach((data, index) => {
        const texture = loadStoneTexture(data.img);
        const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.32, metalness: 0.02 });
        const sample = addBox(`${data.name} sample`, [0.95, 0.08, 0.72], [-2.45 + index * 1.1, 1.22, 4.2], mat, {
            rotation: [0, index % 2 ? 0.16 : -0.1, 0]
        });
        sample.userData = { ...data, name: `${data.name} Sample`, category: "Sample on Desk", kind: "stone" };
        interactiveObjects.push(sample);
    });

    const chairMat = makeMat(0x272b34, 0.6, 0.03);
    [-3.1, 1.6].forEach((x) => {
        addBox("lounge chair seat", [1.2, 0.24, 1.05], [x, 0.55, 6.05], chairMat);
        addBox("lounge chair back", [1.2, 1.15, 0.18], [x, 1.1, 6.6], chairMat);
    });
}

function addHotspots() {
    const hotspotMat = new THREE.MeshStandardMaterial({
        color: 0xb89b5e,
        emissive: 0xb89b5e,
        emissiveIntensity: 0.45,
        roughness: 0.22,
        metalness: 0.25
    });

    roomHotspots.forEach((item) => {
        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 16), hotspotMat.clone());
        marker.position.set(item.position[0], item.position[1], item.position[2]);
        marker.castShadow = true;
        marker.userData = { ...item, kind: "hotspot" };
        scene.add(marker);
        interactiveObjects.push(marker);
    });
}

function setTooltip(data, event) {
    ttTitle.innerText = data.name;
    ttCat.innerText = data.category;
    ttM2.innerText = data.m2;
    ttSlab.innerText = data.slab;

    if (event && window.innerWidth > 768) {
        const rect = renderer.domElement.getBoundingClientRect();
        tooltip.style.left = `${Math.min(event.clientX + 18, rect.right - 290)}px`;
        tooltip.style.top = `${Math.min(event.clientY + 18, rect.bottom - 130)}px`;
    }
    tooltip.classList.add("visible");
}

function resetHover() {
    if (hovered && hovered.userData.kind === "stone") {
        hovered.scale.set(1, 1, 1);
    }
    hovered = null;
    if (!selected) tooltip.classList.remove("visible");
    renderer.domElement.style.cursor = "grab";
}

function updatePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function handlePointerMove(event) {
    updatePointer(event);
    if (hovered && window.innerWidth > 768) setTooltip(hovered.userData, event);
}

function handlePointerDown(event) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactiveObjects, false);
    if (!hits.length) {
        selected = null;
        tooltip.classList.remove("visible");
        return;
    }
    selected = hits[0].object;
    setTooltip(selected.userData, event);
}

function updateHover() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactiveObjects, false);
    const next = hits.length ? hits[0].object : null;

    if (next === hovered) return;
    if (hovered && hovered.userData.kind === "stone") hovered.scale.set(1, 1, 1);

    hovered = next;
    if (!hovered) {
        if (!selected) tooltip.classList.remove("visible");
        renderer.domElement.style.cursor = "grab";
        return;
    }

    if (hovered.userData.kind === "stone") hovered.scale.set(1.025, 1.025, 1.025);
    renderer.domElement.style.cursor = "pointer";
    setTooltip(hovered.userData);
}

function attachViewControls() {
    document.querySelectorAll("[data-view]").forEach((button) => {
        button.addEventListener("click", () => {
            const view = button.dataset.view;
            desiredView = viewTargets[view] || viewTargets.overview;
            isTransitioning = true;
            selected = null;
            tooltip.classList.remove("visible");
            document.querySelectorAll("[data-view]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;

    if (isTransitioning) {
        camera.position.lerp(desiredView.position, 0.025);
        controls.target.lerp(desiredView.target, 0.03);
        if (camera.position.distanceTo(desiredView.position) < 0.08 && controls.target.distanceTo(desiredView.target) < 0.04) {
            isTransitioning = false;
        }
    }

    interactiveObjects.forEach((object, index) => {
        if (object.userData.kind === "hotspot") {
            const pulse = 1 + Math.sin(time * 2.4 + index) * 0.12;
            object.scale.setScalar(pulse);
        }
    });

    updateHover();
    controls.update();
    renderer.render(scene, camera);
}

renderer.domElement.addEventListener("pointermove", handlePointerMove);
renderer.domElement.addEventListener("pointerdown", handlePointerDown);
renderer.domElement.addEventListener("pointerleave", resetHover);
window.addEventListener("resize", sizeRenderer);

addRoom();
addLighting();
addSlabGallery();
addWallMockup();
addConsultationArea();
addHotspots();
attachViewControls();
sizeRenderer();
animate();
