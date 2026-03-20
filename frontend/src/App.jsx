import { Routes, Route, useLocation, useEffect } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx";
import { RetryProvider, useRetry } from "./contexts/RetryContext.jsx";
import Navbar from "./components/Navbar.jsx";
import RetryLoader from "./components/RetryLoader.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Heatmap from "./pages/Heatmap.jsx";
import Guardian from "./pages/Guardian.jsx";
import Predictor from "./pages/Predictor.jsx";
import { keepAlive } from "./utils/apiClient.js";

function AppContent() {
  const { isDark, colors } = useTheme();
  const { retryState } = useRetry();
  const location = useLocation();

  // Keep-alive ping: Send a ping every 14 minutes to prevent Render backend from sleeping
  useEffect(() => {
    // Send initial ping on mount
    keepAlive();

    // Set up recurring ping every 14 minutes
    const keepAliveInterval = setInterval(() => {
      keepAlive();
    }, 14 * 60 * 1000); // 840000 ms = 14 minutes

    // Cleanup interval on unmount
    return () => clearInterval(keepAliveInterval);
  }, []);
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
      <RetryLoader isRetrying={retryState.isRetrying} retryInfo={retryState.retryInfo} />
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
      <RetryProvider>
        <AppContent />
      </RetryProvider>
    </ThemeProvider>
  );
}
