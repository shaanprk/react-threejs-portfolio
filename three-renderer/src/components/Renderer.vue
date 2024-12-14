<script>
  import * as THREE from 'three'

  export default {
    name: 'Renderer',
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
      this.initScene()
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
      }
    }
  }
</script>
<template>hi</template>
<style scoped></style>