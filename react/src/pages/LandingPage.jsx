import React from 'react';
import { Canvas } from '@react-three/fiber'

// Import models
import Shelf from '../components/Shelf';
import Light from '../components/Light';
import Scroll from '../components/Scroll';
import NewScroll from '../components/NewScroll'
import { AmbientLight } from 'three';

const Landing = () => {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'gray' }}>
      {/* <h1 className="text-white">HI</h1> */}
      <Canvas >
        {/* Lighting */}
        {/* <Light /> */}
        <ambientLight />

        {/* Shelf */}
        {/* <Shelf /> */}

        {/* Scrolls */}
        {/* <Scroll /> */}
        <NewScroll />

        {/* Floor */}
        {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="gray" />
        </mesh> */}
      </Canvas>
    </div>
  );
};

export default Landing;