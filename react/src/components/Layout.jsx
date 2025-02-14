import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import gsap from "gsap";

// Import 3D components
import AboutScroll from "../components/AboutScroll";
import TestScroll2 from "../components/TestScroll2";
import Loader from "../components/Loader";

// Import pages
import AboutPage from "../pages/About/AboutPage";
import ProjectsPage from "../pages/Projects/ProjectsPage";
import HomePage from "../pages/Home/HomePage";
import DesignPhilosophyPage from "../pages/Philosophy/PhilosophyPage";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [centeredScroll, setCenteredScroll] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const contentRef = useRef();

  // When a user clicks on a scroll element, update URL and state
  const handleCenteredScroll = (page) => {
    setCenteredScroll(page);
    navigate(`/?centered=${page}`);
  };

  const handleUncenter = () => {
    setCenteredScroll(null);
    navigate("/");
  };

  // When a knot is clicked, delay then open the page overlay
  const handleKnotClick = (page) => {
    setCenteredScroll(page);
    gsap.delayedCall(1, () => {
      setActivePage(page);
      navigate(`/${page}`);
    });
  };

  // Animate the overlay page when activePage is set
  useEffect(() => {
    if (activePage && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { height: "0%", opacity: 0 },
        { height: "100%", opacity: 1, duration: 10, ease: "none" }
      );
    }
  }, [activePage]);

  // Sync URL search params with state so that the scroll centers properly
  useEffect(() => {
    const validPages = ["home", "about", "projects", "design-philosophy"];
    const centeredParam = searchParams.get("centered");
    const path = location.pathname.replace("/", "");

    if (centeredParam && validPages.includes(centeredParam)) {
      setCenteredScroll(centeredParam);
      setActivePage(null);
    } else if (validPages.includes(path)) {
      setActivePage(path);
      setCenteredScroll(null);
    } else {
      setActivePage(null);
      setCenteredScroll(null);
    }
  }, [location, searchParams]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "gray" }}>
      <Suspense fallback={<Loader />}>
        <Canvas>
          <ambientLight />
          <AboutScroll
            page="about"
            isActive={centeredScroll === "about"}
            onCenter={handleCenteredScroll}
            onUncenter={handleUncenter}
            onKnotClick={handleKnotClick}
          />
          <TestScroll2
            page="projects"
            isActive={centeredScroll === "projects"}
            onOpen={handleCenteredScroll}
          />
          <Preload all />
        </Canvas>
      </Suspense>

      {/* Overlay content container */}
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
            height: "0%", // starts collapsed
            overflow: "hidden",
            background: "white",
          }}
        >
          {activePage === "about" && <AboutPage />}
          {activePage === "projects" && <ProjectsPage />}
          {activePage === "home" && <HomePage />}
          {activePage === "design-philosophy" && <DesignPhilosophyPage />}
        </div>
      )}

      {/* Outlet for additional route-based content (if needed) */}
      <Outlet />
    </div>
  );
};

export default Layout;
