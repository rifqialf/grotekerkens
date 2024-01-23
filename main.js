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

// Initialize Orbit Controller
const controls = new OrbitControls(camera, renderer.domElement);
controls.minZoom = 2;
controls.maxZoom = 20;

// Load 3d Models
const loader = new GLTFLoader();

let buildings;
loader.load(
  "data/centrum_004.glb",
  function (gltf) {
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = true;
      }
    });
    buildings = gltf.scene;
    scene.add(buildings);
  },
  undefined,
  function (error) {
    console.error(error);
  });

let oudekerk;
loader.load(
  "./data/oudekerk_003.glb",
  function (gltf) {
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
      }
    });
    oudekerk = gltf.scene;
    scene.add(oudekerk);
  },
  undefined,
  function (error) {
    console.error(error);
  });

document.getElementById("all-shadows").onclick = () => {
  buildings.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });
};

document.getElementById("not-all-shadows").onclick = () => {
  buildings.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = false;
    }
  });
};


let jacobuskerk;
loader.load(
  "./data/jacobuskerk_001.glb",
  function (gltf) {
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
      }
    });
    jacobuskerk = gltf.scene;
    scene.add(jacobuskerk);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

let gementee;
loader.load(
  "./data/gementee_001.glb",
  function (gltf) {
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
      }
    });
    gementee = gltf.scene;
    scene.add(gementee);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

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

// Add hemisphere directionalLight
const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemiLight);

// Add directionalLight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 0); //default; directionalLight shining from top
directionalLight.castShadow = true; // default false
directionalLight.intensity = 3; // default false
scene.add(directionalLight);

// Set up shadow properties for the DirectionalLight
directionalLight.shadow.mapSize.width = 2048; // default
directionalLight.shadow.mapSize.height = 2048; // default
directionalLight.shadow.camera.near = 2; // default
directionalLight.shadow.camera.far = 1000; // default

// Set up fulcrum properties for the DirectionalLight
let d = 500;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d;

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

// Shadow Camera Helper
const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);

document.getElementById("show-helper").onclick = () => {
  scene.add(helper);
};

document.getElementById("hide-helper").onclick = () => {
  scene.remove(helper);
};

let initAnim = true;
let runAnim = true;
let isPlay = true;

let angle = 0;
let lightAzimuth = document.getElementById("light-azimuth");
let lightElevation = document.getElementById("light-elevation");
let animationButton = document.getElementById("toggle-animation");

animationButton.onclick = function startAnimation() {
  if (initAnim) {
    initAnim = false;
    runAnim = false;
  }
  if (runAnim) {
    animationButton.innerHTML = "Pause Animation";
    runAnim = false;
    isPlay = true;
    animate();
  } else {
    animationButton.innerHTML = "Start Animation";
    runAnim = true;
    isPlay = false;
    noAnimate();
  }
};

function animate() {
  if (isPlay === false) {
    return;
  }
  requestAnimationFrame(animate);
  angle -= 0.008;
  directionalLight.position.x = lightElevation.value * Math.sin(angle);
  directionalLight.position.y = lightElevation.value * Math.cos(angle);
  directionalLight.position.z = lightAzimuth.value * Math.sin(angle);
  rendering();
}

function noAnimate() {
  requestAnimationFrame(noAnimate);
  directionalLight.position.x = lightElevation.value * Math.sin(angle);
  directionalLight.position.y = lightElevation.value * Math.cos(angle);
  directionalLight.position.z = lightAzimuth.value * Math.sin(angle);
  rendering();
}

function rendering() {
  controls.update();
  renderer.render(scene, camera);
}

animate();
