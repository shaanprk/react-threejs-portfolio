import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import Pages
import Layout from "./pages/Layout.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import AboutPage from "./pages/About/AboutPage.jsx";
import ProjectsPage from "./pages/Projects/ProjectsPage.jsx";
import DesignPhilosophyPage from "./pages/Philosophy/PhilosophyPage.jsx";
import NotFoundPage from "./pages/NotFound/NotFoundPage.jsx";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Nested routes render into Layout's Outlet */}
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="design-philosophy" element={<DesignPhilosophyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;