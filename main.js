// import styles
import './style.css'

// import necessary three.js modules
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

// import helper functions
import {getRandomMountainTexture} from "./helpers/textures.js";

// set up the three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new  THREE.PerspectiveCamera(75, 1, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
})

// set up renderer settings and canvas size
const canvasSize = 500;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasSize, canvasSize);

// set up orbit controls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false

// set up a vector to store mouse coordinates
const mouse = new THREE.Vector2();

// get the toggle button and set up a flag for using orbitcontrols
const toggleButton = document.getElementById('toggleButton');
let useOrbitControls = false;

// toggle orbitcontrols on button click
toggleButton.addEventListener('click', () => {
    useOrbitControls = !useOrbitControls;

    if (useOrbitControls) {
        controls.enabled = true; // Enable OrbitControls
        controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    } else {
        controls.enabled = false; // Disable OrbitControls
    }
});

// Listen for mouse movement only when orbitcontrol is disabled
document.addEventListener('mousemove', (event) => {
        // normalize mouse coordinates to [-1, 1]
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// update camera position based on mouse movement
function updateMouseParallax() {
    const parallaxStrength = 5;

    camera.position.x = THREE.MathUtils.clamp(-mouse.x * parallaxStrength, -100, 100);
    camera.position.y = THREE.MathUtils.clamp((mouse.y + 2) * parallaxStrength, 1, 100);
}

// variables for scene elements
let ground, treesGroup, mountainsGroup, birds;

// function to create the sky
function createSky() {
    const skyGeometry = new THREE.PlaneGeometry(500, 500);
    const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB });
    const sky = new THREE.Mesh(skyGeometry, blueMaterial);

    sky.position.set(0, 0, -50)

    scene.add(sky);
}

// function to create the ground and grass
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    ground = new THREE.Mesh(groundGeometry, grassMaterial);

    ground.position.set(0, 0, 0);
    ground.rotation.x = Math.PI / -2;

    scene.add(ground);

    // create grass blades
    const numBlades = 3000;
    const grassHeight = 0.25;
    for (let i = 0; i < numBlades; i++) {
        const grassBladeGeometry = new THREE.BoxGeometry(0.1, grassHeight, 0.1);
        const grassBladeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const grassBlade = new THREE.Mesh(grassBladeGeometry, grassBladeMaterial);

        // randomly positionnpm blades on the ground
        const randomX = THREE.MathUtils.randFloatSpread(200);
        const randomZ = THREE.MathUtils.randFloatSpread(100);

        grassBlade.position.set(randomX, grassHeight / 2, randomZ);

        scene.add(grassBlade);
    }
}

// function to create trees
function createTrees() {
    const numTrees = 20;
    const minDistance = 5; // Minimum distance between trees
    const minDistanceToMountains = 20; // Minimum distance between trees and mountains

    const trees = []; // Array to store tree positions
    treesGroup = new THREE.Group();

    const mountains = scene.children.filter(child => child instanceof THREE.Mesh && child.material.map); // Filter mountains

    for (let i = 0; i < numTrees; i++) {
        let validPosition = false;
        let newTree;

        // Generate a new tree position until it's valid (not too close to existing trees, grass, or mountains)
        while (!validPosition) {
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

            const leavesGeometry = new THREE.SphereGeometry(2, 16, 16);
            const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);

            const randomX = THREE.MathUtils.randFloatSpread(75);
            const randomZ = THREE.MathUtils.randFloatSpread(75);

            trunk.position.set(randomX, 1.5, randomZ);
            leaves.position.set(trunk.position.x, 4, trunk.position.z);

            // Check the distance to all existing trees
            validPosition = trees.every(existingTree => existingTree.position.distanceTo(trunk.position) >= minDistance);

            // Check the distance to mountains
            validPosition = validPosition && mountains.every(mountain => mountain.position.distanceTo(trunk.position) >= minDistanceToMountains);

            if (validPosition) {
                // If the position is valid, add the tree to the scene and store its position
                treesGroup.add(trunk);
                treesGroup.add(leaves);
                newTree = { position: trunk.position };
                trees.push(newTree);
            }
        }
    }

    scene.add(treesGroup);
}

// function to create the sun and lighting
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
    const yellowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, yellowMaterial);

    sun.position.set(30, 50, -30);
    scene.add(sun);

    // set up directional and ambient lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(20, 30, 1).normalize();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(directionalLight, ambientLight);
}

// creates a single mountain
function createMountain(geometry, color) {
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({map: getRandomMountainTexture(), color: color}));
}

// creates the three mountains
function createMountains() {
    // mountain geometries
    const farMountainGeometry = new THREE.ConeGeometry(10, 30, 8);
    const closeMountainGeometry = new THREE.ConeGeometry(5, 20, 8);

    // create mountains with random colors
    const farMountain = createMountain(farMountainGeometry, new THREE.Color(Math.random(), Math.random(), Math.random()));
    const closeLeftMountain = createMountain(closeMountainGeometry, new THREE.Color(Math.random(), Math.random(), Math.random()));
    const closeRightMountain = createMountain(closeMountainGeometry, new THREE.Color(Math.random(), Math.random(), Math.random()));

    // set mountain positions
    farMountain.position.set(0, 12, 1);
    closeLeftMountain.position.set(-10, 9, 5);
    closeRightMountain.position.set(8, 8, 11);

    // Create a group for mountains for easier parallax update
    mountainsGroup = new THREE.Group();
    mountainsGroup.add(farMountain, closeLeftMountain, closeRightMountain);

    scene.add(mountainsGroup);
}

// create a single bird
function createBird() {
    const birdGeometry = new THREE.BoxGeometry(1, 0.5, 0.1);
    const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const bird = new THREE.Mesh(birdGeometry, birdMaterial);

    bird.position.set(-50, THREE.MathUtils.randFloat(5, 20), THREE.MathUtils.randFloat(-50, -10));
    scene.add(bird);

    return bird;
}

// create a group of birds
function createBirds(numBirds) {
    const birds = [];
    for (let i = 0; i < numBirds; i++) {
        const bird = createBird();
        birds.push(bird);
    }
    return birds;
}

// aimate the bird movement
function animateBird(bird) {
    const speed = 0.2;
    bird.position.x += speed;
    if (bird.position.x > 50) {
        bird.position.x = -50;
        bird.position.y = THREE.MathUtils.randFloat(5, 20);
        bird.position.z = THREE.MathUtils.randFloat(-50, -10);
    }
}

// creates the scene
function createScene() {
    createSky();
    createGround();
    createSun();
    createMountains();
    createTrees();
    birds = createBirds(5);
}

// animates the scene
function animate() {
    requestAnimationFrame(animate);

    // Limit controls
    controls.maxPolarAngle = Math.PI / 2; // Maximum polar angle (from top view)
    controls.minPolarAngle = 0; // Minimum polar angle (from bottom view)
    controls.maxAzimuthAngle = Math.PI / 4; // Maximum azimuthal angle (rotation around up axis)
    controls.minAzimuthAngle = -Math.PI / 4; // Minimum azimuthal angle (rotation around up axis)
    controls.maxDistance = 80; // Maximum zoom distance
    controls.minDistance = 20; // Minimum zoom distance

    if (useOrbitControls) {
        controls.update();
    } else {
        // Update camera position based on mouse movement
        updateMouseParallax();
    }

    // animate bird movement for each bird
    for (const bird of birds) {
        animateBird(bird);
    }

    //render the scene
    renderer.render(scene, camera);
}

// initialize the scene
createScene();

// set initial camera position
camera.position.setZ(50);
camera.position.setY(15);

// start the animation loop
animate();