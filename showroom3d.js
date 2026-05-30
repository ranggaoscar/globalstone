// Data batu simulasi + link gambar nyata
const stoneData = [
    { name: "Gucci Black", category: "Marble", m2: "976", slab: "183", img: "assets/images/materials/GUCCI BLACK BOOKMATCH 3.jpg" },
    { name: "Lavish Gold", category: "Marble", m2: "1,245", slab: "210", img: "assets/images/materials/LAVISH GOLD.jpeg" },
    { name: "Statuario Turkey", category: "Marble", m2: "450", slab: "85", img: "assets/images/materials/STATUARIO TURKEY 2.jpg" },
    { name: "Verde Amber", category: "Exotic", m2: "2,100", slab: "350", img: "assets/images/materials/VERDE AMBER.jpg" }
];

// Inisialisasi Scene - Editorial
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f7f5f2'); // Offwhite
scene.fog = new THREE.FogExp2('#f7f5f2', 0.02); // Clean fog

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 22);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic tone mapping
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// Controls (Orbit)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; 
controls.minDistance = 8;
controls.maxDistance = 35;
controls.target.set(0, 3, 0);

// Pencahayaan Elegan
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Bright white ambient
scene.add(ambientLight);

// Spotlight utama
const spotLight = new THREE.SpotLight(0xffffff, 5);
spotLight.position.set(0, 20, 10);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5;
spotLight.decay = 2;
spotLight.distance = 50;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// Lampu aksen emas (Editorial feel)
const accentLight = new THREE.PointLight(0xB89B5E, 1.0);
accentLight.position.set(-10, -5, -10);
scene.add(accentLight);

// Lantai (Grid / Reflektif)
const planeGeo = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.1, // Highly reflective floor
    metalness: 0.3
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Grid halus gaya arsitektural
const gridHelper = new THREE.GridHelper(100, 100, 0xE5E5E5, 0xE5E5E5);
gridHelper.position.y = 0.01;
gridHelper.material.opacity = 0.5;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Membuat Slab Batu dengan Tekstur Asli
const slabs = [];
const group = new THREE.Group();
scene.add(group);

const slabGeometry = new THREE.BoxGeometry(4, 6, 0.2);

stoneData.forEach((data, index) => {
    // Muat tekstur
    const texture = textureLoader.load(data.img);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // Material default dengan gambar
    const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.3,
        metalness: 0.1,
        color: 0xcccccc
    });
    
    const mesh = new THREE.Mesh(slabGeometry, material);
    
    const xPos = (index - (stoneData.length - 1) / 2) * 5.5;
    
    mesh.position.set(xPos, 3, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Simpan material asli untuk reset saat di-hover
    mesh.userData = data;
    mesh.userData.originalY = mesh.position.y;
    mesh.userData.originalMaterial = material;
    
    // Hover material (lebih bercahaya dikit)
    const hoverMat = material.clone();
    hoverMat.emissive = new THREE.Color(0xffffff);
    hoverMat.emissiveIntensity = 0.1; // Subtle highlight
    mesh.userData.hoverMaterial = hoverMat;
    
    group.add(mesh);
    slabs.push(mesh);
});

// Interaksi
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredMesh = null;

const tooltip = document.getElementById('data-tooltip');
const ttTitle = document.getElementById('tt-title');
const ttCat = document.getElementById('tt-cat');
const ttM2 = document.getElementById('tt-m2');
const ttSlab = document.getElementById('tt-slab');

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    if (hoveredMesh) {
        // Efek smooth follow untuk HUD tooltip
        tooltip.style.left = (event.clientX + 20) + 'px';
        tooltip.style.top = (event.clientY + 20) + 'px';
    }
}

window.addEventListener('mousemove', onMouseMove);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    controls.update();
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(slabs);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        if (hoveredMesh !== object) {
            if (hoveredMesh) {
                hoveredMesh.material = hoveredMesh.userData.originalMaterial;
            }
            hoveredMesh = object;
            hoveredMesh.material = hoveredMesh.userData.hoverMaterial;
            
            const data = hoveredMesh.userData;
            ttTitle.innerText = data.name;
            ttCat.innerText = data.category;
            ttM2.innerText = data.m2;
            ttSlab.innerText = data.slab;
            
            tooltip.classList.add('visible');
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (hoveredMesh) {
            hoveredMesh.material = hoveredMesh.userData.originalMaterial;
            hoveredMesh = null;
            tooltip.classList.remove('visible');
            document.body.style.cursor = 'default';
        }
    }
    
    // Efek mengambang lambat
    slabs.forEach((mesh, index) => {
        const offset = index * 0.8;
        if(mesh !== hoveredMesh) {
           mesh.position.y = mesh.userData.originalY + Math.sin(time * 1.5 + offset) * 0.08; 
           // Berputar sangat pelan
           mesh.rotation.y = Math.sin(time * 0.5 + offset) * 0.05;
        } else {
            mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, mesh.userData.originalY + 0.4, 0.1);
            mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.1);
        }
    });
    
    // Spotlight muter pelan menyapu scene
    spotLight.position.x = Math.sin(time * 0.5) * 10;
    spotLight.position.z = 10 + Math.cos(time * 0.5) * 5;
    
    renderer.render(scene, camera);
}

animate();
