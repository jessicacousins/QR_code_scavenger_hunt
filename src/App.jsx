import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "./components/TopBar.jsx";
import Home from "./pages/Home.jsx";
import LocationPage from "./pages/Location.jsx";
import Certificate from "./pages/Certificate.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AdminLinks from "./pages/AdminLinks.jsx";
import Toast from "./components/Toast.jsx";
import { loadState, freshState, saveState } from "./utils/storage.js";

export default function App() {
  const loc = useLocation();
  const [toast, setToast] = useState(null);
  const [state, setState] = useState(() => loadState() || freshState());

  useEffect(() => {
    // Persist on change
    saveState(state);
  }, [state]);

  useEffect(() => {
    // Theme boot
    const t = state?.theme || localStorage.getItem("italy_theme") || "dark";
    document.documentElement.dataset.theme = t;
  }, []);

  const routeKey = useMemo(() => loc.pathname, [loc.pathname]);

  function pushToast(msg, type = "ok") {
    setToast({ msg, type, k: Date.now() });
  }

  return (
    <div className="app-shell">
      <TopBar state={state} setState={setState} onToast={pushToast} />
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={routeKey}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Routes>
              <Route
                path="/"
                element={<Home state={state} setState={setState} onToast={pushToast} />}
              />
              <Route
                path="/loc/:id"
                element={<LocationPage state={state} setState={setState} onToast={pushToast} />}
              />
              <Route
                path="/certificate"
                element={<Certificate state={state} setState={setState} onToast={pushToast} />}
              />
              <Route
                path="/leaderboard"
                element={<Leaderboard state={state} onToast={pushToast} />}
              />
              <Route path="/admin/links" element={<AdminLinks />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {toast && (
        <Toast
          key={toast.k}
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
