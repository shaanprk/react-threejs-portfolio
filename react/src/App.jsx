import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from "react-router-dom";

// Import Pages
import LandingPage from "./pages/LandingPage.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/AboutPage.jsx";
import Projects from "./pages/Projects.jsx";
import DesignPhilosophy from "./pages/DesignPhilosophy.jsx";
import NotFound from "./pages/NotFound.jsx";

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;