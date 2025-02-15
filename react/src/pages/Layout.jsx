import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, useProgress } from "@react-three/drei";
import { Outlet, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

// Import interactive components
import AboutScroll from "../components/AboutScroll";
import TestScroll2 from "../components/ProjectsScroll";
import Preloader from "../components/Preloader";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get loading progress from useProgress.
  // Note: useProgress must be used while Canvas is mounted.
  const { progress } = useProgress();
  const assetsLoaded = progress === 100;

  // State for controlling the canvas’ scroll behavior and page overlay.
  const [centeredScroll, setCenteredScroll] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const contentRef = useRef(); // Container for the HTML overlay content

  // --- Handlers for interactive canvas events ---
  const handleCenteredScroll = (page) => {
    setCenteredScroll(page);
    navigate(`/?centered=${page}`);
  };

  const handleUncenter = () => {
    setCenteredScroll(null);
    navigate("/");
  };

  const handleKnotClick = (page) => {
    setCenteredScroll(page);
    gsap.delayedCall(0.15, () => {
      setActivePage(page);
      navigate(`/${page}`);
    });
  };

  const handleCloseOverlay = () => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        height: "0%",
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          setActivePage(null);
          navigate("/?centered=about");
        },
      });
    }
  };


  // --- Animate the overlay content when activePage is set ---
  useEffect(() => {
    if (activePage && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { height: "0%", opacity: 0 },
        { height: "100%", opacity: 1, duration: 0.6, ease: "power2.inOut" }
      );
      // const tl = gsap.timeline()
      // tl.fromTo(
      //   contentRef.current,
      //   { height: "0%", opacity: 0 },
      //   { height: "100%", opacity: 1, duration: 0.6, ease: "power2.inOut" }
      // );
      // tl.progress(1).progress(0);
    }
  }, [activePage]);

  // --- Sync state with URL changes ---
  useEffect(() => {
    const validPages = ["home", "about", "projects", "design-philosophy"];
    const centeredParam = searchParams.get("centered");
    const path = location.pathname.replace("/", "");
    if (centeredParam && validPages.includes(centeredParam)) {
      setCenteredScroll(centeredParam);
      setActivePage(null);
      setResetTrigger((prev) => prev + 1);
    } else if (validPages.includes(path) && path !== "") {
      setActivePage(path);
    } else {
      setActivePage(null);
      setCenteredScroll(null);
    }
  }, [location, searchParams]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "gray" }}>
      {/* Always render the Canvas */}
      <Suspense fallback={null}>
        <Canvas>
          <ambientLight />
          <AboutScroll
            page="about"
            isActive={centeredScroll === "about" || activePage === "about"}
            open={activePage === "about"}
            onCenter={handleCenteredScroll}
            onUncenter={handleUncenter}
            onKnotClick={handleKnotClick}
            resetTrigger={resetTrigger}
            assetsLoaded={assetsLoaded}
          />
          <TestScroll2
            page="projects"
            isActive={centeredScroll === "projects"}
            onCenter={handleCenteredScroll}
            onUncenter={handleUncenter}
            onKnotClick={handleKnotClick}
            resetTrigger={resetTrigger}
          />
          <Preload all />
        </Canvas>
      </Suspense>

      {/* Render the overlay container for page content */}
      {activePage && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            height: "0%", // Starts collapsed and animates open.
            overflowY: "auto",
            background: "white",
          }}
        >
          <Outlet context={{ closeOverlay: handleCloseOverlay }} />
        </div>
      )}

      {/* Overlay the Preloader until all assets are loaded */}
      {!assetsLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#000",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <h2>Loading... {progress.toFixed(0)}%</h2>
        </div>
      )}
    </div>
  );
};

export default Layout;