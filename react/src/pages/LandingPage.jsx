import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useLocation, useNavigate } from "react-router-dom";

// Import scroll components
import AboutScroll from "../components/AboutScroll";
import TestScroll2 from "../components/TestScroll2";

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeScroll, setActiveScroll] = useState(null);

  const handleOpenScroll = (page) => {
    setActiveScroll(page);
    window.history.pushState({}, "", `/${page}`);
  };

  useEffect(() => {
    const path = location.pathname.replace("/", "");
    const validPages = ["home", "about", "projects", "design-philosophy"];
    if (validPages.includes(path)) {
      setActiveScroll(path);
    }
  }, [location.pathname]);

  return (
    <div style={{ width: "100%", height: "100vh", background: "gray" }}>
      <Canvas>
        <ambientLight />
        <AboutScroll
          page="about"
          isActive={activeScroll === "about"}
          onOpen={handleOpenScroll}
        />
        <TestScroll2
          page="projects"
          isActive={activeScroll === "projects"}
          onOpen={handleOpenScroll}
        />
      </Canvas>
    </div>
  );
};

export default Landing;
