import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "./components/TopBar.jsx";
import Home from "./pages/Home.jsx";
import LocationPage from "./pages/Location.jsx";
import Certificate from "./pages/Certificate.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AdminLinks from "./pages/AdminLinks.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Toast from "./components/Toast.jsx";
import { loadState, freshState, saveState } from "./utils/storage.js";

export default function App() {
  const loc = useLocation();
  const [toast, setToast] = useState(null);
  const [state, setState] = useState(() => loadState() || freshState());
  const [showTeleport, setShowTeleport] = useState(() => {
    try {
      return sessionStorage.getItem("italy_intro_seen") !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // Persist on change
    saveState(state);
  }, [state]);

  useEffect(() => {
    // Theme boot
    const t = state?.theme || localStorage.getItem("italy_theme") || "dark";
    document.documentElement.dataset.theme = t;
  }, []);

  useEffect(() => {
    if (!showTeleport) return;
    const timer = setTimeout(() => {
      setShowTeleport(false);
      try {
        sessionStorage.setItem("italy_intro_seen", "1");
      } catch {
        // Ignore storage errors and continue.
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [showTeleport]);

  const routeKey = useMemo(() => loc.pathname, [loc.pathname]);

  function pushToast(msg, type = "ok") {
    setToast({ msg, type, k: Date.now() });
  }

  return (
    <div className="app-shell">
      <AnimatePresence>
        {showTeleport && (
          <motion.div
            className="teleport-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            aria-hidden="true"
          >
            <motion.div
              className="teleport-map"
              initial={{ scale: 1.2, rotate: -3, filter: "blur(3px)" }}
              animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.7, ease: [0.2, 0.8, 0.2, 1] }}
            />
            <motion.div
              className="teleport-ring ring-a"
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.4, repeat: 1, ease: "easeOut" }}
            />
            <motion.div
              className="teleport-ring ring-b"
              initial={{ scale: 0.2, opacity: 0.8 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 1.4, repeat: 1, ease: "easeOut", delay: 0.2 }}
            />
            <motion.div
              className="teleport-copy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>Teleporting to Italy</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <Route
                path="/admin/panel"
                element={<AdminPanel state={state} setState={setState} onToast={pushToast} />}
              />
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
