import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import Pages
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
import DesignPhilosophy from "./pages/DesignPhilosophy.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/design-philosophy" element={<DesignPhilosophy />} />
      </Routes>
    </Router>
  );
};

export default App;
