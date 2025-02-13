import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from "react-router-dom";

// Import Pages
import LandingPage from "./pages/LandingPage.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import AboutPage from "./pages/About/AboutPage.jsx";
import ProjectsPage from "./pages/Projects/ProjectsPage.jsx";
import DesignPhilosophyPage from "./pages/Philosophy/PhilosophyPage.jsx";
import NotFoundPage from "./pages/NotFound/NotFoundPage.jsx";

const validPages = ["home", "about", "projects", "design-philosophy"];

const PageWrapper = () => {
  const { page } = useParams();

  if (!validPages.includes(page)) {
    return <NotFound />;
  }

  return <LandingPage />;
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Catch-all routes for LandingPage */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/:page" element={<PageWrapper />} />

        {/* Redirect invalid routes to 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;