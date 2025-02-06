import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3, Raycaster, Vector2, AnimationMixer, AnimationUtils, LoopOnce } from 'three';
import * as THREE from 'three';

// URL change
import { useNavigate, useLocation } from 'react-router-dom';
import { Html } from '@react-three/drei';


import scrollModel from '../assets/models/test_scroll_v1.glb';

const NewScroll = ({ page, isActive, onOpen }) => {
    // URL handling
    const navigate = useNavigate();
    const location = useLocation();

    // const handleOpenScroll = (page) => {
    //     console.log("Navigating to: ", page);
    //     navigate(`/${page}`);
    // }

    // Import the Scroll model
    const gltf = useLoader(GLTFLoader, scrollModel);
    const { scene, animations } = gltf;

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
    // const [ selected, setSelected ] = useState(false);
    const [ isCentered, setIsCentered ] = useState(false);
    const [ targetPosition, setTargetPosition ] = useState([0, 0, 0]);
    const [ targetRotation, setTargetRotation ] = useState([0, 0, 0]);

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    // Dragging 
    const initialMouse = useRef({ x: 0, y: 0});
    const initialRotation = useRef([0, 0, 0]);
    const isDragging = useRef(false);
    const isDraggingBuffer = useRef(false);

    // Center the model's axis
    // useEffect(() => {
    //     const box = new Box3().setFromObject(gltf.scene);
    //     const center = new Vector3();
    //     box.getCenter(center);
    //     gltf.scene.position.sub(center);
    //     pivotRef.current.add(gltf.scene);
    // }, [gltf]);

    // ----------------------------
    // RAYCAST LOGIC
    // ----------------------------
    const updateRayCaster = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
    };

    // ----------------------------
    // MOUSE EVENTS
    // ----------------------------
    const handlePointerMoveDefault = (e) => {
        updateRayCaster(e);

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

    useEffect(() => {
        setIsCentered(isActive);
    }, [isActive]);

    const handlePointerClickDefault = (e) => {
        if (isDraggingBuffer.current) return;
    
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
            const clickedObject = intersects[0].object;
    
            // Toggle open/close state if clicking on the knot or hanging string while centered
            if (isCentered && (clickedObject === texturedKnotRef.current || clickedObject === hangingStringRef.current)) {
                setIsOpen(prev => {
                    console.log("Toggling Scroll. New state:", !prev);
                    return !prev;
                });
                return;
            }
    
            // ✅ Fix: Use functional update to check the latest state of isOpen before uncentering
            setIsOpen(prevIsOpen => {
                if (prevIsOpen) {
                    console.log("Scroll is open. Preventing uncentering.");
                    return true; // Keep it open, don't allow uncentering
                }
    
                // If it's not open, allow centering/uncentering
                if (!isCentered) {
                    setTargetPosition([0, 0, 2]); // Move forward
                    setTargetRotation([0, 0, 0]); // Rotate to face user
                    setIsCentered(true);
                    console.log("Centering Scroll.");
                    onOpen(page); // Updates URL dynamically
                    console.log("Updating URL to: ", page);
                } else {
                    setTargetPosition([0, 0, 0]); // Reset position
                    setTargetRotation([0, 0, 0]); // Reset rotation
                    setIsCentered(false);
                    console.log("Uncentering Scroll.");
                    onOpen("");
                    console.log("Updating URL to: ", "");
                }
    
                return prevIsOpen; // Return the correct state
            });
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

    // // ----------------------------
    // // DRAGGING/INSPECTING SETUP
    // // ----------------------------
    const handleMouseDown = (e) => {
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

        if (intersects.length > 0 || isOpen.current) {
            return;
        }

        if (isCentered) {
            initialMouse.current = { x: e.clientX, y: e.clientY };
            initialRotation.current = pivotRef.current.rotation.toArray();
            isDragging.current = true;
            isDraggingBuffer.current = true;

            gl.domElement.addEventListener('mousemove', handleMouseMove);
            gl.domElement.addEventListener('mouseup', handleMouseUp);

            gl.domElement.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging.current) {
            gl.domElement.style.cursor = 'grabbing';

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

        setTimeout(() => {
            isDraggingBuffer.current = false;
        }, 100);

        gl.domElement.style.cursor = hovered ? 'grab' : 'auto';

        gl.domElement.removeEventListener('mousemove', handleMouseMove);
        gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };

    // ----------------------------
    // ANIMATION LOGIC
    // ----------------------------
    // // const mixer = useRef(new AnimationMixer(scene));
    const [mixer] = useState(() => new AnimationMixer(scene));
    const openActionRef = useRef(null);
    const closeActionRef = useRef(null);

    // Keep track of whether the scroll is currently open or closed
    const [ isOpen, setIsOpen ] = useState(false);

    useEffect(() => {
        if (animations && animations.length > 0) {
            const baseClip = animations[0]; // Main animation containing all frames

            // console.log("BaseClip Duration (seconds):", baseClip.duration);
            // console.log("Total Keyframes:", baseClip.tracks[0]?.times.length); // Get frame count

            // Extract subclips for opening and closing animation sequences
            const openClip = AnimationUtils.subclip(baseClip, 'Open_Clip', 1, 200);
            const closeClip = AnimationUtils.subclip(baseClip, 'Close_Clip', 200, 400);

            // CAssign animations to ref actions
            openActionRef.current = mixer.clipAction(openClip, scene);
            closeActionRef.current = mixer.clipAction(closeClip, scene);

            // Set to play once and stay at last frame
            openActionRef.current.setLoop(LoopOnce);
            openActionRef.current.clampWhenFinished = true;
            closeActionRef.current.setLoop(LoopOnce);
            closeActionRef.current.clampWhenFinished = true;
        }
    }, [animations, scene]);

    // Manage animation playback based on scroll state
    useEffect(() => {
        if (!isCentered) return;

        if (isOpen) {
            closeActionRef.current?.stop(); // Stop closing animation if playing
            openActionRef.current?.reset().play(); // Play open animation
        } else {
            openActionRef.current?.stop(); // Stop opening animation if playing
            closeActionRef.current?.reset().play(); // Play close animation
        }
    }, [isOpen]);

    useFrame((_, delta) => {
        mixer.update(delta);
    });

    // Attach event listeners
    
    useEffect(() => {
        if (texturedKnotRef.current) {
            if (isCentered) {
                // Apply glow effect when centered
                texturedKnotRef.current.material.emissive = new THREE.Color(0xffffff); // Yellow glow
                texturedKnotRef.current.material.emissiveIntensity = 10; // Adjust intensity
            } else {
                // Remove glow effect when not centered
                texturedKnotRef.current.material.emissive = new THREE.Color(0x000000); // No glow
                texturedKnotRef.current.material.emissiveIntensity = 0;
            }
        }
    }, [isCentered]);

    useEffect(() => {
        if (isActive) {
            setIsCentered(true);
            setTargetPosition([0, 0, 2]);
            setTargetRotation([0, 0, 0]);
        }
    }, [isActive]);
    
    useFrame(() => {
        if (texturedKnotRef.current && isCentered) {
            const intensity = 0.5 + Math.sin(Date.now() * 0.0025) * 0.5; // Pulsating effect
            texturedKnotRef.current.material.emissiveIntensity = intensity;
        }
    });

    useEffect(() => {
        gl.domElement.addEventListener('pointermove', handlePointerMoveDefault);
        gl.domElement.addEventListener('click', handlePointerClickDefault);
        gl.domElement.addEventListener('mousedown', handleMouseDown);

        return () => {
            gl.domElement.removeEventListener('pointermove', handlePointerMoveDefault);
            gl.domElement.removeEventListener('click', handlePointerClickDefault);
            gl.domElement.removeEventListener('mousedown', handleMouseDown);
        };
    }, [gl.domElement, isCentered]);

    return (
        <group ref={pivotRef}>
            <primitive 
                ref={modelRef} 
                object={gltf.scene}
                scale={1}
                position={[0, 0, 0]} 
                // scale={[1, 1, 1]} 
            />
        </group>
    );
};

export default NewScroll;