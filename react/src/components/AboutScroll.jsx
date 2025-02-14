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

const AboutScroll = ({
  page,
  isActive,
  onCenter,
  onUncenter,
  onKnotClick,
  resetTrigger,
}) => {
  // Load the scroll model
  const gltf = useLoader(GLTFLoader, scrollModel);
  const { scene, animations } = gltf;

  // Refs for the model and its parts
  const modelRef = useRef();
  const pivotRef = useRef();
  const bgPlaneRef = useRef();
  const bottomRodRef = useRef();
  const topRodRef = useRef();
  const backgroundRef = useRef();
  const contentRef = useRef();
  const knotRef = useRef();

  useEffect(() => {
    bottomRodRef.current = gltf.scene.getObjectByName("bottom_rod");
    topRodRef.current = gltf.scene.getObjectByName("top_rod");
    backgroundRef.current = gltf.scene.getObjectByName("background");
    contentRef.current = gltf.scene.getObjectByName("content");
    knotRef.current = gltf.scene.getObjectByName("knot");
  }, [gltf]);

  // Other states, dimensions, etc.
  const [scrollSize, setScrollSize] = useState(null);
  useEffect(() => {
    if (gltf.scene) {
      const box = new Box3().setFromObject(gltf.scene);
      const sizeVec = new Vector3();
      box.getSize(sizeVec);
      setScrollSize(sizeVec);
      console.log("Scroll Dimensions:", sizeVec);
    }
  }, [gltf.scene]);

  const [scrollBox, setScrollBox] = useState(null);
  useEffect(() => {
    if (gltf.scene) {
      const box = new Box3().setFromObject(gltf.scene);
      setScrollBox(box);
    }
  }, [gltf.scene]);

  const { camera, size } = useThree();

  // Interaction and dragging states
  const [hovered, setHovered] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  const [targetRotation, setTargetRotation] = useState([1, 0, 0]);
  const raycaster = new Raycaster();
  const mouse = new Vector2();

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
    if (!isCentered) return;
    if (isOpenRef.current) {
      console.log("Scroll is open. Preventing dragging.");
      return;
    }
    initialMouse.current = { x: e.clientX, y: e.clientY };
    initialRotation.current = pivotRef.current.rotation.toArray();
    isDragging.current = true;
    document.body.style.cursor = "grabbing";
    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    e.stopPropagation();
  };

  // Animation logic
  const [mixer] = useState(() => new AnimationMixer(scene));
  const actionRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const baseClip = animations[0];
      const openClip = AnimationUtils.subclip(baseClip, "Open_Clip", 1, 200);
      actionRef.current = mixer.clipAction(openClip, scene);
      actionRef.current.setLoop(LoopOnce);
      actionRef.current.clampWhenFinished = true;
      actionRef.current.setDuration(2);
      mixer.timeScale = 0.5;
    }
  }, [animations, scene, mixer]);

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

  // Reset internal open state when resetTrigger changes.
  useEffect(() => {
    // Whenever the parent's resetTrigger changes, force the scroll closed.
    setIsOpen(false);
  }, [resetTrigger]);

  // Positioning logic for centering
  useEffect(() => {
    if (!scrollSize) return;
    const aspect = camera.aspect;
    const verticalFOVRad = (camera.fov * Math.PI) / 180;
    let computedD;
    if (size.width >= size.height) {
      computedD = scrollSize.x / (1.6 * Math.tan(verticalFOVRad / 2));
    } else {
      computedD = scrollSize.x / (1.6 * Math.tan(verticalFOVRad / 2) * aspect);
    }
    let targetZ;
    let targetY = 0;
    if (isActive) {
      if (isOpen && backgroundRef.current && scrollBox) {
        const bgBox = new Box3().setFromObject(backgroundRef.current);
        const bgSizeVec = new Vector3();
        bgBox.getSize(bgSizeVec);
        const bgWidth = bgSizeVec.x;
        const horizontalFOV =
          2 * Math.atan(Math.tan(verticalFOVRad / 2) * camera.aspect);
        const adjustmentFactor = 0.575;
        const desiredDistance =
          (bgWidth / (2 * Math.tan(horizontalFOV / 2))) * adjustmentFactor;
        targetZ = camera.position.z - desiredDistance;
        const frustumHeight =
          2 * desiredDistance * Math.tan(verticalFOVRad / 2);
        const r = size.height / size.width;
        const fraction =
          r > 1 ? 0.61 - 0.1 * (r - 1.63) : 1.085 - (r - 0.5);
        targetY = fraction * frustumHeight;
      } else {
        targetZ = camera.position.z - computedD;
      }
      setIsCentered(true);
      setTargetPosition([0, targetY, targetZ]);
      setTargetRotation([0, 0, 0]);
    } else {
      setIsCentered(false);
      setTargetPosition([0, 0, 0]);
      setTargetRotation([1, 0, 0]);
    }
  }, [
    isActive,
    isOpen,
    scrollSize,
    size,
    camera.fov,
    camera.aspect,
    camera.position.z,
    scrollBox,
  ]);

  // Animate pivot group each frame.
  useFrame(() => {
    if (pivotRef.current && !isDragging.current) {
      const lerpFactor = 0.07;
      const [x, y, z] = pivotRef.current.position.toArray();
      const [tx, ty, tz] = targetPosition;
      pivotRef.current.position.set(
        x + (tx - x) * lerpFactor,
        y + (ty - y) * lerpFactor,
        z + (tz - z) * lerpFactor
      );
      const [rx, ry, rz] = pivotRef.current.rotation.toArray();
      const [trx, try_, trz] = targetRotation;
      pivotRef.current.rotation.set(
        rx + (trx - rx) * lerpFactor,
        ry + (try_ - ry) * lerpFactor,
        rz + (trz - rz) * lerpFactor
      );
    }
    mixer.update(0.016);
    if (bgPlaneRef.current && pivotRef.current) {
      const worldPos = new THREE.Vector3();
      pivotRef.current.getWorldPosition(worldPos);
      bgPlaneRef.current.position
        .copy(worldPos)
        .add(new THREE.Vector3(0, 0, -0.1));
      bgPlaneRef.current.rotation.set(0, 0, 0);
    }
  });

  // Pulsating glow effect on the knot.
  useEffect(() => {
    if (knotRef.current) {
      if (isCentered) {
        knotRef.current.material.emissive = new THREE.Color(0xffffff);
        knotRef.current.material.emissiveIntensity = 1;
      } else {
        knotRef.current.material.emissive = new THREE.Color(0x000000);
        knotRef.current.material.emissiveIntensity = 0;
      }
    }
  }, [isCentered]);

  useFrame(() => {
    if (knotRef.current && isCentered) {
      const time = Date.now() * 0.0025;
      const emissivePulse = 0.5 + 0.5 * Math.sin(time);
      knotRef.current.material.emissiveIntensity = emissivePulse;
    }
  });

  // Click handler on the scroll model.
  const handlePrimitiveClick = (e) => {
    e.stopPropagation();
    const knotClicked = e.intersections.some(
      (intersect) => intersect.object === knotRef.current
    );
    const sectionClicked = e.intersections.some(
      (intersect) => intersect.object === contentRef.current
    );
    if (isCentered && knotClicked) {
      setIsOpen((prev) => {
        const newState = !prev;
        if (newState) {
          onKnotClick(page);
        }
        return newState;
      });
      return;
    }

    setIsOpen((prevIsOpen) => {
      if (prevIsOpen) {
        console.log("Scroll is open. Preventing uncentering.");
        return true;
      }
      if (!isCentered) {
        setIsCentered(true);
        onCenter(page);
        console.log("Updating URL to:", page);
      } else {
        onUncenter();
        setIsCentered(false);
        console.log("Updating URL to:", "");
      }
      return prevIsOpen;
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
      {/* Invisible background plane for pointer events */}
      <mesh ref={bgPlaneRef} onPointerDown={handleBackgroundPointerDown}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Pivot group containing the scroll model */}
      <group ref={pivotRef}>
        <primitive
          ref={modelRef}
          object={gltf.scene}
          scale={1}
          position={[0, 0, 0]}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerOver={(e) => {
            e.stopPropagation();
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

export default AboutScroll;
