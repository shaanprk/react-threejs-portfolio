<script>
  import * as THREE from 'three'
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

  export default {
    name: 'ThreeScene',
    data() {
      return {
        scene: null,
        camera: null,
        renderer: null,
        raycaster: null,
        mouse: new THREE.Vector2(),
        scrolls: []
      }
    },
    mounted() {
      this.initScene(); // Initialize the scene
      this.loadModels(); // Load the models
      this.animate(); // Animate the scene
    },
    methods: {
      // Initialize the scene
      initScene() {
        // Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f8f8)

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.$refs.threeContainer.appendChild(this.renderer.domElement);

        // Add Lighting
        // Candle Light 
        const candleLight = new THREE.PointLight(0xffaa33, 1, 10);
        candleLight.position.set(0, 0, -5);
        this.scene.add(candleLight);

        function flickerLight() {
          const intensity = 0.8 + Math.random() * 0.2; // Simulate flickering effect
          candleLight.intensity = intensity;
          requestAnimationFrame(flickerLight);
        }
        flickerLight();

        const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(ambientLight);

        // Initialize Raycaster
        this.raycaster = new THREE.Raycaster();
      },

      // Load the models
      loadModels() {
        const loader = new GLTFLoader();
        const shelfPath = "../assets/models/shelf.glb"; // Path to shelf model

        // Load the shelf model
        loader.load(
          shelfPath,
          (gltf) => {
            this.scene.add(gltf.scene);
          },
          undefined,
          (error) => console.error(error)
        );
      },

      // Animate the scene
      animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
      }
    }
  }
</script>

<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>