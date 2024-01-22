import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Render shadow map
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Initialize scene & camera
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  1,
  1000
);
scene.background = "white";
camera.position.set(0, 200, 100);

// Initialize orbig Controller
const controls = new OrbitControls(camera, renderer.domElement);
controls.minZoom = 5;
controls.maxZoom = 20;
// controls.enablePan = false;

// Load 3d models
const loader = new GLTFLoader();
loader.load(
  "data/not_oudekerk_001.glb",
  function (gltf) {
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = true;
      }
    });
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

loader.load(
  "data/oudekerk_003.glb",
  function (gltf) {
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
      }
    });
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Add hemisphere directionalLight
const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemiLight);

// Add directional directionalLight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(80, 90, 100); //default; directionalLight shining from top
directionalLight.castShadow = true; // default false
directionalLight.intensity = 2; // default false
scene.add(directionalLight);

//Set up shadow properties for the DirectionalLight
directionalLight.shadow.mapSize.width = 512; // default
directionalLight.shadow.mapSize.height = 512; // default
directionalLight.shadow.camera.near = 2; // default
directionalLight.shadow.camera.far = 500; // default

//Set up fulcrum properties for the DirectionalLight
const d = 30;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d;

// Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.PlaneGeometry(691, 660);
const planeTexture = new THREE.TextureLoader().load(
  "data/airphoto_enschede_clip002.png"
);
const planeMaterial = new THREE.MeshStandardMaterial({ map: planeTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.set((Math.PI / 4) * 6, 0, 0);
plane.receiveShadow = false;
plane.position.set(-27, 0, 12);
scene.add(plane);

const shadowPlaneGeometry = new THREE.PlaneGeometry(691, 660);
const shadowPlaneMaterial = new THREE.MeshStandardMaterial({
  color: 0xf4f4f4,
  transparent: true,
  opacity: 0.4,
  side: THREE.DoubleSide,
});
const shadowPlane = new THREE.Mesh(shadowPlaneGeometry, shadowPlaneMaterial);
shadowPlane.rotation.set((Math.PI / 4) * 6, 0, 0);
shadowPlane.receiveShadow = true;
shadowPlane.position.set(-27, 0, 12);
scene.add(shadowPlane);

// Shadow camera helper
const helper = new THREE.CameraHelper(directionalLight.shadow.camera);

controls.addEventListener("change", () => {
  renderer.render(scene, camera);
});

document.getElementById("show-helper").onclick = () => {
	scene.add(helper);
}

document.getElementById("hide-helper").onclick = () => {
	scene.remove(helper);
}

let angle = 0;
function animate() {
  requestAnimationFrame(animate);

  angle += 0.01;
  directionalLight.position.x = 100 * Math.cos(angle);
  directionalLight.position.y = 200 + 150 * Math.cos(angle);
  directionalLight.position.z = 100 + 180 * Math.cos(angle);

  controls.update();
  renderer.render(scene, camera);
}

animate();
