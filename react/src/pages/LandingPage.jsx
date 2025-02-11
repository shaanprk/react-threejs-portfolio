import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

// Import scroll model components
import AboutScroll from "../components/AboutScroll";
import TestScroll2 from "../components/TestScroll2";

// Import HTML page components
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import ProjectsPage from "./ProjectsPage";
import DesignPhilosophyPage from "./DesignPhilosophyPage";

const LandingPage = () => {
  const location = useLocation();

  const [ centeredScroll, setCenteredScroll ] = useState(null);
  const [ openedScroll, setOpenedScroll ] = useState(null);
  // activePage determines which HTML content to render after the transition
  const [ activePage, setActivePage ] = useState(null);
  const overlayRef = useRef();

  const pageComponents = {
    home: <HomePage />,
    about: <AboutPage />,
    projects: <ProjectsPage />,
    design: <DesignPhilosophyPage />
  }

  useEffect(() => {
    if (centeredScroll === "about") {
      // Create a GSAP timeline for the overlay fade transition
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: "power2.inOut" },
        onComplete: () => {
          // Once timeline is complete, set activePage so that the HTML content is shown
          setActivePage(centeredScroll);
        },
      });
      // Animate the overlay:
      // 1. Fade in the overlay to cover the canvas.
      // 2. Fade out the overlay to reveal the HTML content.
      tl.to(overlayRef.current, { opacity: 1 })
        .to(overlayRef.current, { opacity: 0 }, "+=0.5");
    }
  }, [centeredScroll]);

  const handleOpenScroll = (page) => {
    setCenteredScroll(page);
    window.history.pushState({}, "", `/${page}`);
  };
  
  // Update centeredScroll if the URL changes
  useEffect(() => {
    const path = location.pathname.replace("/", "");
    const validPages = ["home", "about", "projects", "design-philosophy"];
    if (validPages.includes(path)) {
      setCenteredScroll(path);
    }
  }, [location.pathname]);

  return (
    <div 
      style={{ 
        position: "relative", 
        width: "100%", 
        height: "100vh", 
        background: "gray" 
      }}
    >
      <Canvas>
        <ambientLight />
        <AboutScroll
          page="about"
          isActive={centeredScroll === "about"}
          onOpen={handleOpenScroll}
        />
        <TestScroll2
          page="projects"
          isActive={centeredScroll === "projects"}
          onOpen={handleOpenScroll}
        />
      </Canvas>

      {/* Overlay Div for the transition */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "black",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
      
        {/* Conditional HTML content rendering based on activePage */}
        {activePage === "about" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          >
            <AboutPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
