import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3, Raycaster, Vector2 } from 'three';

import scrollModel from '../assets/models/test_scroll_v1.glb';

const NewScroll = () => {
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

    // Store references to child meshes
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
    const [ selected, setSelected ] = useState(false);
    const [ isCentered, setIsCentered ] = useState(false);
    const [ targetPosition, setTargetPosition ] = useState([0, 0, 0]);
    const [ targetRotation, setTargetRotation ] = useState([0, 0, 0]);

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    // Dragging 
    const initialMouse = useRef({ x: 0, y: 0});
    const initialRotation = useRef([0, 0, 0]);
    const isDragging = useRef(false);

    // Center the model's axis
    // useEffect(() => {
    //     const box = new Box3().setFromObject(gltf.scene);
    //     const center = new Vector3();
    //     box.getCenter(center);
    //     gltf.scene.position.sub(center);
    //     pivotRef.current.add(gltf.scene);
    // }, [gltf]);

    // ----------------------------
    // RAYCAST SETUP
    // ----------------------------
    const updateRayCaster = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
    };

    // ----------------------------
    // MOUSE SETUP
    // ----------------------------

    // Handles ponter movement for hover detection
    const handlePointerMove = (e) => {
        updateRayCaster(e);

        // const intersects = raycaster.intersectObjects([pivotRef.current]);
        const intersects = raycaster.intersectObjects(
            [
                bottomRodRef.current,
                hangingStringRef.current,
                rodStringRef.current,
                scrollRef.current,
                texturedKnotRef.current
            ].filter(obj => obj) // Ensure no null references
        );
        if (intersects.length > 0) {
            setHovered(true); // Set hovered state
            gl.domElement.style.cursor = 'pointer'; // Change cursor to pointer
        } else {
            setHovered(false); // Reset hovered state
            gl.domElement.style.cursor = 'auto'; // Change cursor back to default
        }
    };

    // Handles click interaction to center the model
    const handlePointerClick = (e) => {
        updateRayCaster(e);

        const intersects = raycaster.intersectObjects(
            [
                bottomRodRef.current,
                hangingStringRef.current,
                rodStringRef.current,
                scrollRef.current,
                texturedKnotRef.current
            ].filter(obj => obj) // Ensure valid objects
        );

        if (intersects.length > 0) {
            setSelected((prev) => !prev);
            if (!isCentered) {
                setTargetPosition([0, 0, 1]); // Move forward
                setTargetRotation([0, 0, 0]); // Rotate to face user
                setIsCentered(true);
            } else {
                setTargetPosition([0, 0, 0]); // Reset position
                setTargetRotation([0, 0, 0]); // Reset rotation
                setIsCentered(false);
            }
        }
    };

    // Smooth animation to center model
    useFrame(() => {
        if (pivotRef.current && !isDragging.current) {
            const [x, y, z] = pivotRef.current.position;
            const [tx, ty, tz] = targetPosition;

            // Smooth transition to target position
            pivotRef.current.position.set(
                x + (tx - x) * 0.1,
                y + (ty - y) * 0.1,
                z + (tz - z) * 0.1
            );

            // Smooth transition to target rotation
            const [rx, ry, rz] = pivotRef.current.rotation.toArray();
            const [trx, try_, trz] = targetRotation;
            pivotRef.current.rotation.set(
                rx + (trx - rx) * 0.1,
                ry + (try_ - ry) * 0.1,
                rz + (trz - rz) * 0.1
            );
        }
    });

    // ----------------------------
    // DRAGGING/INSPECTING SETUP
    // ----------------------------
    const handleMouseDown = (e) => {
        if (isCentered) {
            initialMouse.current = { x: e.clientX, y: e.clientY };
            initialRotation.current = pivotRef.current.rotation.toArray();
            isDragging.current = true;
            gl.domElement.addEventListener('mousemove', handleMouseMove);
            gl.domElement.addEventListener('mouseup', handleMouseUp);
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging.current) {
            const deltaX = e.clientX - initialMouse.current.x;
            const deltaY = e.clientY - initialMouse.current.y;
            const [rx, ry, rz] = initialRotation.current;

            pivotRef.current.rotation.set(
                rx + deltaY * 0.01,
                ry + deltaX * 0.01,
                rz
            );
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        gl.domElement.removeEventListener('mousemove', handleMouseMove);
        gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };

    // Attach event listeners
    useEffect(() => {
        gl.domElement.addEventListener('pointermove', handlePointerMove);
        gl.domElement.addEventListener('click', handlePointerClick);
        gl.domElement.addEventListener('mousedown', handleMouseDown);

        return () => {
            gl.domElement.removeEventListener('pointermove', handlePointerMove);
            gl.domElement.removeEventListener('click', handlePointerClick);
            gl.domElement.removeEventListener('mousedown', handleMouseDown);
        };
    }, [gl.domElement, isCentered]);

    return (
        <group ref={pivotRef}>
            <primitive 
                ref={modelRef} 
                object={gltf.scene}
                scale={selected ? 1.2 : 1}
                position={[0, 0, 0]} 
                // scale={[1, 1, 1]} 
            />
        </group>
    );
};

export default NewScroll;