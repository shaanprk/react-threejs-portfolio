import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Outlet, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

// Import interactive components
import AboutScroll from "../components/AboutScroll";
import TestScroll2 from "../components/ProjectsScroll";
import Loader from "../components/Loader";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State for controlling the canvas’ scroll behavior and page overlay.
  const [centeredScroll, setCenteredScroll] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const contentRef = useRef(); // Container for the HTML overlay content

  // --- Handlers for interactive canvas events ---

  // When the scroll should be centered, update state and URL query.
  const handleCenteredScroll = (page) => {
    setCenteredScroll(page);
    navigate(`/?centered=${page}`);
  };

  // Uncenter the scroll and reset URL.
  const handleUncenter = () => {
    setCenteredScroll(null);
    navigate("/");
  };

  // When the knot is clicked, animate then update active page and URL.
  const handleKnotClick = (page) => {
    setCenteredScroll(page);
    gsap.delayedCall(0.5, () => {
      setActivePage(page);
      navigate(`/${page}`);
    });
  };

  // --- Animate the overlay content when activePage is set ---
  useEffect(() => {
    if (activePage && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { height: "0%", opacity: 0 },
        { height: "100%", opacity: 1, duration: 0.6, ease: "circ.inOut" }
        // { height: "100%", opacity: 1, duration: 1, ease: "power2.inOut" }
        // { height: "100%", opacity: 1, duration: 1.4, ease: "power1.out" }
      );
    }
  }, [activePage]);

  // --- Sync state with URL changes ---
  useEffect(() => {
    const validPages = ["home", "about", "projects", "design-philosophy"];
    const centeredParam = searchParams.get("centered");
    // Remove the leading slash from pathname (e.g. "about")
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
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "gray",
      }}
    >
      <Suspense fallback={<Loader />}>
        <Canvas>
          <ambientLight />
          <AboutScroll
            page="about"
            isActive={centeredScroll === "about"}
            onCenter={handleCenteredScroll}
            onUncenter={handleUncenter}
            onKnotClick={handleKnotClick}
            resetTrigger={resetTrigger}
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

      {/* Overlay container for page content with waterfall animation */}
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
          <Outlet />
        </div>
      )}

      {/* When no active overlay is needed, render the current page directly. */}
      {/* {!activePage && <Outlet />} */}
    </div>
  );
};

export default Layout;
