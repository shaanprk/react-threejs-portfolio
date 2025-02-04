import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3, Raycaster, Vector2 } from 'three';

import scrollModel from '../assets/models/test_scroll_v1.glb';

const Scroll = () => {
    const gltf = useLoader(GLTFLoader, scrollModel);
    const scrollRef = useRef();
    const pivotRef = useRef();
    const { camera, gl } = useThree();
    const [hovered, setHovered] = useState(false);
    const [selected, setSelected] = useState(false);
    const [targetPosition, setTargetPosition] = useState([-0.4, 0.685, 1.5]);
    const [targetRotation, setTargetRotation] = useState([0, 0, 0]);
    const [isCentered, setIsCentered] = useState(false);
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const initialMouse = useRef({ x: 0, y: 0 });
    const initialRotation = useRef([0, 0, 0]);
    const isDragging = useRef(false);

    // Scroll Components
    let rodString = null;
    // const scrollPart = null;

    // Find specific components of the model
    // useEffect(() => {
    //     // Center the scroll object's axis
    //     const box = new Box3().setFromObject(gltf.scene); // Get bounding box
    //     const center = new Vector3(); // Create a vector to store the center
    //     box.getCenter(center); // Get the center of the bounding box
    //     gltf.scene.position.sub(center); // Subtract the center from the position

    //     // Find specific components of the model
    //     rodString = gltf.scene.getObjectByName('rod_string');
    //     // scrollPart = gltf.scene.getObjectByName('Scroll');

    //     // Add the scroll object to the pivot group
    //     pivotRef.current.add(gltf.scene);
    // }, [gltf]);
    
    
    // Center the scroll object's axis
    useEffect(() => {
        const box = new Box3().setFromObject(gltf.scene); // Get bounding box
        const center = new Vector3(); // Create a vector to store the center
        box.getCenter(center); // Get the center of the bounding box
        gltf.scene.position.sub(center); // Subtract the center from the position

        // rodString = gltf.scene.getObjectByName('rod_string');

        // Add the scroll object to the pivot group
        pivotRef.current.add(gltf.scene);
    }, [gltf]);

    // Update the raycaster on mouse movement
    const updateRaycaster = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
    };

    // Handle pointer movement
    const handlePointerMove = (e) => {
        updateRaycaster(e);

        const intersects = raycaster.intersectObjects([pivotRef.current]);
        if (intersects.length > 0) {
            setHovered(true); // Set hovered state
            gl.domElement.style.cursor = 'pointer'; // Change cursor to pointer
        } else {
            setHovered(false); // Reset hovered state
            gl.domElement.style.cursor = 'auto'; // Change cursor back to default
        }
    };

    // Handle pointer click
    const handlePointerClick = (e) => {
        updateRaycaster(e);

        const intersects = raycaster.intersectObjects([pivotRef.current]);
        // if (intersects.length > 0) {
        //     setSelected((prevSelected) => !prevSelected);
        //     if (!isCentered) {
        //         setTargetPosition([0.1, 0, 4.1]);
        //         setTargetRotation([0, Math.PI / 2, 0]);
        //         setIsCentered(true);
        //     } else {
        //         setTargetPosition([-0.4, 0.685, 1.5]);
        //         setTargetRotation([0, 0, 0]);
        //         setIsCentered(false);
        //     }
        // }
    };

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

    return (
        <group ref={pivotRef}>
            <primitive
                ref={scrollRef}
                object={gltf.scene}
                scale={selected ? 1.2 : 1}
                position={[0, 0, 0]}
            />
        </group>
    );
};

export default Scroll;