import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber'
import { useLocation, useNavigate } from 'react-router-dom';

// Import models
import Shelf from '../components/Shelf';
import Light from '../components/Light';
// import Scroll from '../components/Scroll';
// import NewScroll from '../components/NewScroll'
import NewScroll from '../components/NewScrollv2';
import { AmbientLight } from 'three';

// TEST SCROLLS
import TestScroll1 from '../components/TestScroll1';
import TestScroll2 from '../components/TestScroll2';


// Import content pages
// import About from './About';

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [ activeScroll, setActiveScroll ] = useState(null);

  const handleOpenScroll = (page) => {
    setActiveScroll(page);
    window.history.pushState({}, "", `/${page}`); // Updates URL without triggering navigation
  }

  useEffect(() => {
    const path = location.pathname.replace("/", "");
    const validPages = ["home", "about", "projects", "design-philosophy"];

    if (validPages.includes(path)) {
      setActiveScroll(path);
    }
  }, [location.pathname]);

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
        {/* <NewScroll page="about" isActive={activeScroll === 'about'} onOpen={handleOpenScroll}/> */}
        <TestScroll1 page="about" isActive={activeScroll === 'about'} onOpen={handleOpenScroll}/>
        {/* <TestScroll2 page="projects" isActive={activeScroll === 'projects'} onOpen={handleOpenScroll}/> */}


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