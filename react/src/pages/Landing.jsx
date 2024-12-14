import React from 'react';
import { Canvas } from '@react-three/fiber'

// Import models
import Shelf from '../components/Shelf';
import Light from '../components/Light';
import Scroll from '../components/Scroll';

const Landing = () => {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'green' }}>
      <Canvas >
        {/* Lighting */}
        <Light />

        {/* Shelf */}
        <Shelf />

        {/* Scrolls */}
        <Scroll />
      </Canvas>
    </div>
  );
};

export default Landing;