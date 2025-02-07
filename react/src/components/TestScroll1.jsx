import React, { useRef, useState, useEffect } from "react";
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

import scrollModel from "../assets/models/test_scroll_v2_1.glb";

const TestScroll1 = ({ page, isActive, onOpen }) => {
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
    bottomRodRef.current = gltf.scene.getObjectByName("bottom_rod");
    hangingStringRef.current = gltf.scene.getObjectByName("hanging_string");
    rodStringRef.current = gltf.scene.getObjectByName("rod_string");
    scrollRef.current = gltf.scene.getObjectByName("Scroll");
    texturedKnotRef.current = gltf.scene.getObjectByName("WideKnot");
  }, [gltf]);

  // Compute and store the dimensions of the scroll model.
  // We will use the scroll’s width (scrollSize.x) for our calculation.
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

  const { camera, gl, size } = useThree();

  // Interaction states
  const [hovered, setHovered] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  const [targetRotation, setTargetRotation] = useState([0, 0, 0]);

  const raycaster = new Raycaster();
  const mouse = new Vector2();

  // Dragging state
  const initialMouse = useRef({ x: 0, y: 0 });
  const initialRotation = useRef([0, 0, 0]);
  const isDragging = useRef(false);
  const isDraggingBuffer = useRef(false);

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
        texturedKnotRef.current,
      ].filter((obj) => obj)
    );
    if (intersects.length > 0) {
      setHovered(true);
      gl.domElement.style.cursor = "pointer";
    } else {
      setHovered(false);
      gl.domElement.style.cursor = "auto";
    }
  };

  const handlePointerClickDefault = (e) => {
    if (isDraggingBuffer.current) return;

    updateRayCaster(e);

    const intersects = raycaster.intersectObjects(
      [
        bottomRodRef.current,
        hangingStringRef.current,
        rodStringRef.current,
        scrollRef.current,
        texturedKnotRef.current,
      ].filter((obj) => obj)
    );

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;

      // Toggle open/close state if clicking on the knot or hanging string while centered
      if (
        isCentered &&
        (clickedObject === texturedKnotRef.current ||
          clickedObject === hangingStringRef.current)
      ) {
        setIsOpen((prev) => {
          console.log("Toggling Scroll. New state:", !prev);
          return !prev;
        });
        return;
      }

      // Use functional update to check latest state of isOpen before uncentering
      setIsOpen((prevIsOpen) => {
        if (prevIsOpen) {
          console.log("Scroll is open. Preventing uncentering.");
          return true;
        }

        if (!isCentered) {
          console.log("Centering Scroll.");
          onOpen(page);
          console.log("Updating URL to: ", page);
        } else {
          console.log("Uncentering Scroll.");
          onOpen("");
          console.log("Updating URL to: ", "");
        }

        return prevIsOpen;
      });
    }
  };

  // Smooth animation to center the model
  useFrame(() => {
    if (pivotRef.current && !isDragging.current) {
      const [x, y, z] = pivotRef.current.position;
      const [tx, ty, tz] = targetPosition;
      // Smooth interpolation for position
      pivotRef.current.position.set(
        x + (tx - x) * 0.1,
        y + (ty - y) * 0.1,
        z + (tz - z) * 0.1
      );

      // Smooth interpolation for rotation
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
  // DRAGGING / INSPECTING SETUP
  // ----------------------------
  const handleMouseDown = (e) => {
    if (isOpenRef.current) {
      console.log("Scroll is open. Preventing dragging.");
      return;
    }

    updateRayCaster(e);

    const intersects = raycaster.intersectObjects(
      [
        bottomRodRef.current,
        hangingStringRef.current,
        rodStringRef.current,
        scrollRef.current,
        texturedKnotRef.current,
      ].filter((obj) => obj)
    );

    if (intersects.length > 0) {
      return;
    }

    if (isCentered) {
      initialMouse.current = { x: e.clientX, y: e.clientY };
      initialRotation.current = pivotRef.current.rotation.toArray();
      isDragging.current = true;
      isDraggingBuffer.current = true;

      gl.domElement.addEventListener("mousemove", handleMouseMove);
      gl.domElement.addEventListener("mouseup", handleMouseUp);

      gl.domElement.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      gl.domElement.style.cursor = "grabbing";

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

    gl.domElement.style.cursor = hovered ? "grab" : "auto";

    gl.domElement.removeEventListener("mousemove", handleMouseMove);
    gl.domElement.removeEventListener("mouseup", handleMouseUp);
  };

  // ----------------------------
  // ANIMATION LOGIC
  // ----------------------------
  const [mixer] = useState(() => new AnimationMixer(scene));
  const actionRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const baseClip = animations[0]; // Full animation (frames 1-400)

      // Extract only the first 200 frames (opening animation)
      const openClip = AnimationUtils.subclip(baseClip, "Open_Clip", 1, 200);

      actionRef.current = mixer.clipAction(openClip, scene);
      actionRef.current.setLoop(LoopOnce);
      actionRef.current.clampWhenFinished = true;
      actionRef.current.setDuration(2); // Set duration to match opening clip

      mixer.timeScale = 1.5; // Adjust playback speed if needed
    }
  }, [animations, scene]);

  useEffect(() => {
    if (!actionRef.current) return;

    const action = actionRef.current;
    const duration = action.getClip().duration;

    if (isOpen) {
      action.setEffectiveTimeScale(1); // Forward playback
      action.paused = false;
      action.play();
    } else {
      action.setEffectiveTimeScale(-1); // Reverse playback
      action.paused = false;
      action.play();
    }

    // Clamp the animation time so it does not exceed the duration
    action.time = Math.min(action.time, duration);
  }, [isOpen]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  // Apply glow effect when centered
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

  // ================================
  // DYNAMIC POSITIONING LOGIC
  // ================================
  // We now compute the distance (d) from the camera that yields a projected
  // scroll width equal to 80% of the screen’s limiting dimension.
  // In a perspective camera:
  //   - In landscape (minDimension is height): d = scrollWidth / (1.6 * tan(verticalFOV/2))
  //   - In portrait (minDimension is width): d = scrollWidth / (1.6 * tan(verticalFOV/2) * aspect)
  // Because our scene’s object is already at a world coordinate, we position it relative
  // to the camera. For example, if the camera is at z = camera.position.z,
  // then we set targetZ = camera.position.z - d.
  useEffect(() => {
    if (!scrollSize) return; // Wait until scroll dimensions are available

    const aspect = camera.aspect; // size.width / size.height
    let computedD;

    // Use camera.fov as the vertical field-of-view (in degrees)
    const verticalFOVRad = (camera.fov * Math.PI) / 180;

    if (size.width >= size.height) {
      // Landscape: limiting dimension is the height.
      computedD = scrollSize.x / (1.6 * Math.tan(verticalFOVRad / 2));
    } else {
      // Portrait: limiting dimension is the width.
      // Note: horizontalFOV = 2 * atan(tan(verticalFOV/2)*aspect)
      // Here we use the simplified form: tan(horizontalFOV/2) = tan(verticalFOV/2)*aspect.
      computedD = scrollSize.x / (1.6 * Math.tan(verticalFOVRad / 2) * aspect);
    }

    // Place the scroll relative to the camera. (Assuming the default camera is at z ~ 5)
    const targetZ = camera.position.z - computedD;

    if (isActive) {
      setIsCentered(true);
      setTargetPosition([0, 0, targetZ]);
      setTargetRotation([0, 0, 0]);
      onOpen(page);
      console.log("Centering Scroll with target Z:", targetZ);
    } else {
      setIsCentered(false);
      setTargetPosition([0, -1, 0]);
      setTargetRotation([0, 0, 0]);
      onOpen("");
      console.log("Uncentering Scroll.");
    }
  }, [
    isActive,
    scrollSize,
    size,
    camera.fov,
    camera.aspect,
    camera.position.z,
    onOpen,
    page,
  ]);

  useFrame(() => {
    if (texturedKnotRef.current && isCentered) {
      const intensity = 0.5 + Math.sin(Date.now() * 0.0025) * 0.5; // Pulsating effect
      texturedKnotRef.current.material.emissiveIntensity = intensity;
    }
  });

  useEffect(() => {
    gl.domElement.addEventListener("pointermove", handlePointerMoveDefault);
    gl.domElement.addEventListener("click", handlePointerClickDefault);
    gl.domElement.addEventListener("mousedown", handleMouseDown);

    return () => {
      gl.domElement.removeEventListener("pointermove", handlePointerMoveDefault);
      gl.domElement.removeEventListener("click", handlePointerClickDefault);
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
    };
  }, [gl.domElement, isCentered]);

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
    console.log("isOpenRef updated:", isOpenRef.current);
  }, [isOpen]);

  return (
    <group ref={pivotRef}>
      <primitive
        ref={modelRef}
        object={gltf.scene}
        scale={1}
        position={[0, 0, 0]}
      />
    </group>
  );
};

export default TestScroll1;