import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { useSearchParams, useLocation } from "react-router-dom";
import gsap from "gsap";

// Import scroll model components
import AboutScroll from "../components/AboutScroll";
import TestScroll2 from "../components/TestScroll2";
import Loader from '../components/Loader';

// Import HTML page components
import HomePage from "./Home/HomePage";
import AboutPage from "./About/AboutPage";
import ProjectsPage from "./Projects/ProjectsPage";
import DesignPhilosophyPage from "./Philosophy/PhilosophyPage";

const LandingPage = () => {
  const location = useLocation();

  // Keeps track of which scroll is centered on the page.
  const [centeredScroll, setCenteredScroll] = useState(null);
  // activePage determines which HTML content to render after the transition.
  const [activePage, setActivePage] = useState(null);
  const overlayRef = useRef();
  const contentRef = useRef(); // container for the new HTML page

  // const handleCenteredScroll = (page) => {
  //   setCenteredScroll(page);
  //   window.history.pushState({}, "", `/centered/${page}`);
  // };

  //tester
  const [searchParams, setSearchParams] = useSearchParams();
  const handleCenteredScroll = (page) => {
    setCenteredScroll(page);
    setSearchParams({ centered: page });
  };
  const handleUncenter = () => {
    setCenteredScroll(null);
    setSearchParams({});
  };

  // Callback for when the knot is clicked in a scroll.
  // This timeline fades in the overlay, then sets activePage.
  const handleKnotClick = (page) => {
    gsap.timeline({
      delay: 0.5,
      defaults: { duration: 1, ease: "power2.inOut" },
      onComplete: () => {
        // Once the overlay is fully opaque, set the active page.
        setActivePage(page);
        window.history.pushState({}, "", `/${page}`);
      },
    }).to(overlayRef.current, { opacity: 1 });
  };

  // When activePage changes (i.e. new content is rendered), animate the fade-out of the overlay
  // and the fade-in of the content.
  useEffect(() => {
    if (activePage) {
      // Delay a tick to ensure the new content is mounted.
      gsap.delayedCall(0.1, () => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 1 });
        gsap.to(contentRef.current, { opacity: 1, duration: 0.25 });
      });
    }
  }, [activePage]);

  // Update centeredScroll if the URL changes.
  // useEffect(() => {
  //   const path = location.pathname.replace("/", "");
  //   const validPages = ["home", "about", "projects", "design-philosophy"];
  //   if (validPages.includes(path)) {
  //     setCenteredScroll(path);
  //   }
  // }, [location.pathname]);
  useEffect(() => {
    const validPages = ["home", "about", "projects", "design-philosophy"];
    // Check query parameters first
    const centeredParam = searchParams.get("centered");
    if (centeredParam && validPages.includes(centeredParam)) {
      setCenteredScroll(centeredParam);
    } else {
      // Fallback to checking pathname if no query parameter exists
      const path = location.pathname.replace("/", "");
      if (validPages.includes(path)) {
        setActivePage(path);
      }
    }
  }, [location.pathname, searchParams]);
  

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "gray",
      }}
    > <Suspense fallback={<Loader />}>
      <Canvas>
        <ambientLight />
        <AboutScroll
          page="about"
          isActive={centeredScroll === "about"}
          onCenter={handleCenteredScroll}
          onUncenter={handleUncenter}
          onKnotClick={handleKnotClick} // Pass the callback to signal knot clicks
        />
        <TestScroll2
          page="projects"
          isActive={centeredScroll === "projects"}
          onOpen={handleCenteredScroll}
        />
        <Preload all />
      </Canvas>
      </Suspense>

      {/* Overlay div used only for the transition animation */}
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
          zIndex: 5,
        }}
      />

      {/* Content container for the new HTML page.
          Rendered outside the overlay so its opacity is not affected by the overlay.
          Only one activePage is rendered at a time.
          It starts with opacity 0 and is animated to opacity 1 after activePage is set.
      */}
      {activePage === "about" && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            opacity: 0, // start hidden
          }}
        >
          <AboutPage />
        </div>
      )}
      {activePage === "projects" && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            opacity: 0,
          }}
        >
          <ProjectsPage />
        </div>
      )}
      {activePage === "home" && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            opacity: 0,
          }}
        >
          <HomePage />
        </div>
      )}
      {activePage === "design-philosophy" && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            opacity: 0,
          }}
        >
          <DesignPhilosophyPage />
        </div>
      )}
    </div>
  );
};

export default LandingPage;