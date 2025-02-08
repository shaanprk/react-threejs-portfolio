import React, { useRef, useState, useEffect, Fragment } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Box3,
  Vector3,
  Raycaster,
  Vector2,
  AnimationMixer,
  AnimationUtils,
  LoopOnce,
} from "three";
import * as THREE from "three";

import scrollModel from "../assets/models/GreenScroll.glb";

const TestScroll1 = ({ page, isActive, onOpen }) => {
  // Load the scroll model
  const gltf = useLoader(GLTFLoader, scrollModel);
  const { scene, animations } = gltf;

  // Main refs
  const modelRef = useRef();
  const pivotRef = useRef();
  const bgPlaneRef = useRef();

  // Child mesh refs from glTF
  const bottomRodRef = useRef();
  // const hangingStringRef = useRef();
  const rodStringRef = useRef();
  const scrollRef = useRef();
  const texturedKnotRef = useRef();

  useEffect(() => {
    bottomRodRef.current = gltf.scene.getObjectByName("bottom_rod");
    // hangingStringRef.current = gltf.scene.getObjectByName("hanging_string");
    rodStringRef.current = gltf.scene.getObjectByName("rod_string");
    scrollRef.current = gltf.scene.getObjectByName("Scroll");
    texturedKnotRef.current = gltf.scene.getObjectByName("WideKnot");
  }, [gltf]);

  // Compute scroll dimensions
  const [scrollSize, setScrollSize] = useState(null);
  useEffect(() => {
    if (gltf.scene) {
      const box = new Box3().setFromObject(gltf.scene);
      const sizeVec = new Vector3();
      box.getSize(sizeVec);
      setScrollSize(sizeVec);
      console.log("Scroll Dimensions:", sizeVec);
      console.log(
        `Width: ${sizeVec.x}, Height: ${sizeVec.y}, Depth: ${sizeVec.z}`
      );
    }
  }, [gltf.scene]);

  const { camera, size } = useThree();

  // Interaction states
  const [hovered, setHovered] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  const [targetRotation, setTargetRotation] = useState([1, 0, 0]);

  const raycaster = new Raycaster();
  const mouse = new Vector2();

  // Dragging state
  const initialMouse = useRef({ x: 0, y: 0 });
  const initialRotation = useRef([0, 0, 0]);
  const isDragging = useRef(false);

  // --- Global pointer handlers for dragging ---
  const handleGlobalPointerMove = (e) => {
    if (isDragging.current) {
      const deltaX = e.clientX - initialMouse.current.x;
      const deltaY = e.clientY - initialMouse.current.y;
      const [rx, ry, rz] = initialRotation.current;
      pivotRef.current.rotation.set(
        rx + deltaY * 0.01,
        ry + deltaX * 0.01,
        rz
      );
      e.stopPropagation();
    }
  };

  const handleGlobalPointerUp = (e) => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = hovered ? "grab" : "auto";
    }
    window.removeEventListener("pointermove", handleGlobalPointerMove);
    window.removeEventListener("pointerup", handleGlobalPointerUp);
    e.stopPropagation();
  };

  // --- Background plane pointer handler: start dragging ---
  const handleBackgroundPointerDown = (e) => {
    // Only allow dragging if the scroll is centered.
    if (!isCentered) return;
    if (isOpenRef.current) {
      console.log("Scroll is open. Preventing dragging.");
      return;
    }

    initialMouse.current = { x: e.clientX, y: e.clientY };
    initialRotation.current = pivotRef.current.rotation.toArray();
    isDragging.current = true;
    document.body.style.cursor = "grabbing";
    // Add global pointer listeners so dragging continues even if the cursor goes over the scroll.
    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    e.stopPropagation();
  };

  // --- Animation logic ---
  const [mixer] = useState(() => new AnimationMixer(scene));
  const actionRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const baseClip = animations[0];
      // Extract the first 200 frames (opening animation)
      const openClip = AnimationUtils.subclip(baseClip, "Open_Clip", 1, 200);
      actionRef.current = mixer.clipAction(openClip, scene);
      actionRef.current.setLoop(LoopOnce);
      actionRef.current.clampWhenFinished = true;
      actionRef.current.setDuration(2);
      mixer.timeScale = 0.5;
    }
  }, [animations, scene]);

  useEffect(() => {
    if (!actionRef.current) return;
    const action = actionRef.current;
    const duration = action.getClip().duration;
    if (isOpen) {
      action.setEffectiveTimeScale(1);
      action.paused = false;
      action.play();
    } else {
      action.setEffectiveTimeScale(-1);
      action.paused = false;
      action.play();
    }
    action.time = Math.min(action.time, duration);
  }, [isOpen]);

  // Interpolate pivot toward target position and rotation.
  useFrame(() => {
    if (pivotRef.current && !isDragging.current) {
      const [x, y, z] = pivotRef.current.position.toArray();
      const [tx, ty, tz] = targetPosition;
      pivotRef.current.position.set(
        x + (tx - x) * 0.1,
        y + (ty - y) * 0.1,
        z + (tz - z) * 0.1
      );

      const [rx, ry, rz] = pivotRef.current.rotation.toArray();
      const [trx, try_, trz] = targetRotation;
      pivotRef.current.rotation.set(
        rx + (trx - rx) * 0.1,
        ry + (try_ - ry) * 0.1,
        rz + (trz - rz) * 0.1
      );
    }
    mixer.update(0.016);
    // Update the background plane to follow the pivot.
    if (bgPlaneRef.current && pivotRef.current) {
      const worldPos = new THREE.Vector3();
      pivotRef.current.getWorldPosition(worldPos);
      bgPlaneRef.current.position.copy(worldPos).add(new THREE.Vector3(0, 0, -0.1));
      bgPlaneRef.current.rotation.set(0, 0, 0);
    }
  });

  // Pulsating glow effect on the knot.
  useEffect(() => {
    if (texturedKnotRef.current) {
      if (isCentered) {
        texturedKnotRef.current.material.emissive = new THREE.Color(0xffffff);
        texturedKnotRef.current.material.emissiveIntensity = 1;
      } else {
        texturedKnotRef.current.material.emissive = new THREE.Color(0x000000);
        texturedKnotRef.current.material.emissiveIntensity = 0;
      }
    }
  }, [isCentered]);

  // useFrame(() => {
  //   if (texturedKnotRef.current && isCentered) {
  //     const intensity = 0.5 + Math.sin(Date.now() * 0.0025) * 0.5;
  //     texturedKnotRef.current.material.emissiveIntensity = intensity;
  //   }
  // });
  useFrame(() => {
    if (texturedKnotRef.current && isCentered) {
      const time = Date.now() * 0.0025; // Adjust speed
      // Use 0.5 ± 0.3 range for a subtle effect
      const emissivePulse = 0.5 + 0.5 * Math.sin(time);
      texturedKnotRef.current.material.emissiveIntensity = emissivePulse;
    }
  });

  // Dynamic positioning logic.
  useEffect(() => {
    if (!scrollSize) return;
    const aspect = camera.aspect;
    let computedD;
    const verticalFOVRad = (camera.fov * Math.PI) / 180;
    if (size.width >= size.height) {
      computedD = scrollSize.x / (1.6 * Math.tan(verticalFOVRad / 2));
    } else {
      computedD = scrollSize.x / (1.6 * Math.tan(verticalFOVRad / 2) * aspect);
    }
    const targetZ = camera.position.z - computedD;
    if (isActive) {
      setIsCentered(true);
      setTargetPosition([0, 0, targetZ]);
      setTargetRotation([0, 0, 0]);
      console.log(`Centering [${page}] Scroll with target Z:`, targetZ);
    } else {
      setIsCentered(false);
      setTargetPosition([0, 0, 0]);
      setTargetRotation([1, 0, 0]);
      console.log(`Uncentering [${page}] Scroll.`);
    }
  }, [isActive, scrollSize, size, camera.fov, camera.aspect, camera.position.z, page, onOpen]);

  // Click handler on the scroll model.
  const handlePrimitiveClick = (e) => {
    e.stopPropagation();
    const knotClicked = e.intersections.some(
      (intersect) => intersect.object === texturedKnotRef.current
    );
    if (isCentered && knotClicked) {
      setIsOpen((prev) => !prev);
      return;
    }
    setIsOpen((prevIsOpen) => {
      if (prevIsOpen) {
        console.log("Scroll is open. Preventing uncentering.");
        return true;
      }
      if (!isCentered) {
        setIsCentered(true);
        onOpen(page);
        console.log("Updating URL to:", page);
      } else {
        onOpen("");
        setIsCentered(false);
        console.log("Updating URL to:", "");
      }
    });
  };

  // Keep an isOpenRef updated for use in pointer handlers.
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpenRef.current) {
      console.log(`Opening [${page}] Scroll`);
    } else {
      console.log(`Closing [${page}] Scroll`);
    }
  }, [isOpen, page]);

  return (
    <Fragment>
      {/* Background plane (visible white with 70% transparency for debugging) */}
      <mesh
        ref={bgPlaneRef}
        onPointerDown={handleBackgroundPointerDown}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
        {/* <meshBasicMaterial color="white" transparent opacity={0.3} /> */}
      </mesh>

      {/* Pivot group containing the scroll model */}
      <group ref={pivotRef}>
        <primitive
          ref={modelRef}
          object={gltf.scene}
          scale={1}
          position={[0, 0, 0]}
          onPointerDown={(e) => {
            // Prevent starting drag if the pointer is over the scroll.
            e.stopPropagation();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            // Only update cursor if not dragging.
            if (!isDragging.current) {
              document.body.style.cursor = "pointer";
            }
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (!isDragging.current) {
              document.body.style.cursor = "auto";
            }
          }}
          onClick={handlePrimitiveClick}
        />
      </group>
    </Fragment>
  );
};

export default TestScroll1;
