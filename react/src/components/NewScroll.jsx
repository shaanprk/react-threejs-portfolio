import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3, Raycaster, Vector2 } from 'three';

import scrollModel from '../assets/models/test_scroll_v1.glb';

const NewScroll = () => {
    /*
    1. Load Scroll GLTF/GLB model
    2. Keep references to child objects
    3. Set up states for hovering, selection, centering, dragging
    */

    // Import the Scroll model
    const gltf = useLoader(GLTFLoader, scrollModel);

    // Main references
    const modelRef = useRef();
    const pivotRef = useRef();

    // Child components mesh references
    const bottomRodRef = useRef();
    const hangingStringRef = useRef();
    const rodStringRef = useRef();
    const scrollRef = useRef();
    const texturedKnotRef = useRef();

    // Assign child meshes after loading model
    useEffect(() => {
        bottomRodRef.current = gltf.scene.getObjectByName('bottom_rod');
        hangingStringRef.current = gltf.scene.getObjectByName('hanging_string');
        rodStringRef.current = gltf.scene.getObjectByName('rod_string');
        scrollRef.current = gltf.scene.getObjectByName('Scroll');
        texturedKnotRef.current = gltf.scene.getObjectByName('textured_knot');
    }, [gltf]);

    
    const { camera, gl } = useThree();

    // Interaction states
    const [ hovered, setHovered ] = useState(false);
    // const [ selected, setSelected ] = useState(false);
    // const [ isCentered, setIsCentered ] = useState(false);

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    // Dragging 
    // const initialMouse = useRef({ x: 0, y: 0});
    // const initialRotation = useRef([0, 0, 0]);
    // const isDragging = useRef(false);

    // ----------------------------
    // RAYCAST SETUP
    // ----------------------------
    const updateRayCaster = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 - 1;
        raycaster.setFromCamera(mouse, camera);
    };

    // ----------------------------
    // MOUSE EVENTS
    // ----------------------------
    const handlePointerMove = (e) => {
        updateRayCaster(e);

        const intersects = raycaster.intersectObjects([pivotRef.current]);
        // const intersects = raycaster.intersectObjects(
        //     [
        //         bottomRodRef.current,
        //         hangingStringRef.current,
        //         rodStringRef.current,
        //         scrollRef.current,
        //         texturedKnotRef.current
        //     ].filter(obj => obj) // Ensure no null references
        // );

        if (intersects.length > 0) {
            setHovered(true); // Set hovered state
            gl.domElement.style.cursor = 'pointer'; // Change cursor to pointer
        } else {
            setHovered(false); // Reset hovered state
            gl.domElement.style.cursor = 'auto'; // Change cursor back to default
        }
    };

    // const handlePointerClick = (e) => {
    //     updateRayCaster(e);

    //     const intersects = raycaster.intersectObjects([pivotRef.current]);
    // };

    // const handleMouseDown = (e) => {
    //     if (isCentered) {
    //         initialMouse.current = { x: e.clientX, y: e.clientY };
    //         initialRotation.current = pivotRef.current.rotation.toArray();
    //         isDragging.current = true;
    //         gl.domEleemnt.addEventListener('mousemove', handleMouseMove);
    //         gl.domElement.addEventListener('mouseup', handleMouseUp);
    //     }
    // };

    // const handleMouseMove = (e) => {
    //     if (isDragging.current) {
    //         const deltaX = e.clientX - initialMouse.current.x;
    //         const deltaY = e.clientY - initialMouse.current.y;
    //         const [rx, ry, rz] = initialRotation.current;

    //         pivotRef.current.rotation.set(
    //             rx + deltaY * 0.01,
    //             ry + deltaX * 0.01,
    //             rz
    //         );
    //     }
    // };

    // const handleMouseUp = () => {
    //     isDragging.current = false;
    //     gl.domElement.removeEventListener('mousemove', handleMouseMove);
    //     gl.domElement.removeEventListener('mouseup', handleMouseUp);
    // };

    useEffect(() => {
        gl.domElement.addEventListener('pointermove', handlePointerMove);
        // gl.domElement.addEventListener('click', handlePointerClick);
        // gl.domElement.addEventListener('mousedown', handleMouseDown);

        return () => {
            gl.domElement.removeEventListener('pointermove', handlePointerMove);
            // gl.domElement.removeEventListener('click', handlePointerClick);
            // gl.domElement.removeEventListener('mousedown', handleMouseDown);
        };
    }, [gl.domElement]);

    return (
        <group ref={pivotRef}>
            <primitive 
                ref={modelRef} 
                object={gltf.scene} 
                position={[0, 0, 0]} 
                scale={[1, 1, 1]} 
            />
        </group>
    );
};

export default NewScroll;