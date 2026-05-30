// Data batu simulasi
const stoneData = [
    { name: "Monaco Grey", category: "Marble", m2: "976", slab: "183" },
    { name: "Moon Cream", category: "Marble", m2: "1,245", slab: "210" },
    { name: "Calacatta Gold", category: "Marble", m2: "450", slab: "85" },
    { name: "Nero Assoluto", category: "Granite", m2: "2,100", slab: "350" },
    { name: "Compress Statuario", category: "Artificial", m2: "850", slab: "150" }
];

// Inisialisasi Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#F9FAFB'); // Sama dengan --bg-light
scene.fog = new THREE.Fog('#F9FAFB', 10, 50);

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 25);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Controls (Orbit)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.1; 
controls.minDistance = 10;
controls.maxDistance = 40;

// Pencahayaan
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

// Lantai (Grid)
const planeGeo = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.MeshStandardMaterial({ 
    color: 0xeeeeee,
    roughness: 0.8
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const gridHelper = new THREE.GridHelper(100, 100, 0xdddddd, 0xdddddd);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Material Slab Batu
const defaultMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x6B7280, // Concrete Grey
    roughness: 0.2,
    metalness: 0.1
});

const hoverMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1B4F8A, // Steel Blue
    roughness: 0.1,
    metalness: 0.3,
    emissive: 0x1B4F8A,
    emissiveIntensity: 0.2
});

// Membuat Slab Batu
const slabs = [];
const group = new THREE.Group();
scene.add(group);

// Dimensi slab (lebar, tinggi, tebal)
const slabGeometry = new THREE.BoxGeometry(4, 6, 0.2);

stoneData.forEach((data, index) => {
    const mesh = new THREE.Mesh(slabGeometry, defaultMaterial.clone());
    
    // Susun sejajar seperti di gallery
    const xPos = (index - (stoneData.length - 1) / 2) * 5;
    
    mesh.position.set(
        xPos,
        3, // Setengah tinggi slab
        0
    );
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Simpan data di userData mesh
    mesh.userData = data;
    mesh.userData.originalY = mesh.position.y;
    
    group.add(mesh);
    slabs.push(mesh);
});

// Interaksi (Raycaster)
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
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';
    }
}

window.addEventListener('mousemove', onMouseMove);

// Resize handler
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
                hoveredMesh.material = defaultMaterial.clone();
            }
            hoveredMesh = object;
            hoveredMesh.material = hoverMaterial;
            
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
            hoveredMesh.material = defaultMaterial.clone();
            hoveredMesh = null;
            tooltip.classList.remove('visible');
            document.body.style.cursor = 'default';
        }
    }
    
    // Efek mengambang lambat
    slabs.forEach((mesh, index) => {
        const offset = index * 0.5;
        if(mesh !== hoveredMesh) {
           mesh.position.y = mesh.userData.originalY + Math.sin(time * 2 + offset) * 0.1; 
        } else {
            mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, mesh.userData.originalY + 0.5, 0.1);
        }
    });
    
    renderer.render(scene, camera);
}

animate();
