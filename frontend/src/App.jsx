import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Heatmap from "./pages/Heatmap.jsx";
import Guardian from "./pages/Guardian.jsx";
import Predictor from "./pages/Predictor.jsx";

function AppContent() {
  const { isDark, colors } = useTheme();
  const location = useLocation();
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/guardian" element={<Guardian />} />
            <Route path="/predictor" element={<Predictor />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
