// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// // Load shelf model
// import shelf from '../assets/models/shelf.glb';

// const Landing = () => {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     // Scene
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0xffffff);

//     // Camera
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     camera.position.z = 5;

//     // Renderer
//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current.appendChild(renderer.domElement);

//     // Object
//     const loader = new GLTFLoader();
//     loader.load(
//       shelf,
//       function ( gltf ) {
//         scene.add( gltf.scene );
//       }, undefined, function ( error ) {
//         console.error( error );
//       }
//     );

//     // Animation
//     const animate = () => {
//       requestAnimationFrame(animate);

//       renderer.render(scene, camera);
//     }
//     animate();

//     return () => {
//       mountRef.current.removeChild(renderer.domElement);
//     }
//   }, [])

//   return (
//     <div ref={mountRef}></div>
//   );
// };

// export default Landing;

import React from 'react';
import { Canvas } from '@react-three/fiber'

// Import models
import Shelf from '../components/Shelf';
import Light from '../components/Light';

const Landing = () => {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'green' }}>
      <Canvas >
        {/* Lighting */}
        <Light />

        {/* Shelf */}
        <Shelf />
      </Canvas>
    </div>
  );
};

// const Landing = () => {
//   return (
//     <div>
//       <h1>hi</h1>
//     </div>
//   );
// };

export default Landing;