import React, { useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';

import scrollModel from '../assets/models/scroll.glb';

const Scroll = () =>{
    // Load the shelf model
    const gltf = useLoader(GLTFLoader, scrollModel); // Scroll model
    const scrollRef = useRef();
    const { camera, gl } = useThree();
    const [hovered, setHovered] = useState(false);
    const [selected, setSelected] = useState(false);
    const raycaster = new Raycaster();
    const mouse = useRef(new Vector2());

    useFrame(() => {
        if (hovered && scrollRef.current) {
            scrollRef.current.rotation.x += 0.01;
        }
    });

    const handlePointerMove = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects([scrollRef.current]);
        if (intersects.length > 0) {
            
        }
    };

    const handlePointerClick = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([scrollRef.current]);
        if (intersects.length > 0) {
            setSelected(!selected);
        }
    };

    return (
        <primitive 
            ref={scrollRef}
            object={gltf.scene} 
            scale={selected ? 1.2 : 1} 
            position={[-0.4, 0.685, 1.5]} 
            onPointerMove={handlePointerMove}
            onClick={handlePointerClick}
        ></primitive>
    );
}

export default Scroll;