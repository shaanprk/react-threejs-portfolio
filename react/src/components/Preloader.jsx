import React from 'react';
import { useProgress } from '@react-three/drei';

const Preloader = () => {
  const { progress } = useProgress();

  return (
    <div style={preloaderStyle}>
      <h2>Loading... {progress.toFixed(0)}%</h2>
    </div>
  );
};

const preloaderStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: '#000',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

export default Preloader;
