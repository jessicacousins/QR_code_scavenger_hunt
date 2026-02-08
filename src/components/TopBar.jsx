import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { LOCATIONS } from "../data/locations.js";

export default function TopBar({ state, setState, onToast }) {
  const location = useLocation();
  const solvedCount = Object.keys(state.solved || {}).length;
  const total = LOCATIONS.length;
  const pct = Math.round((solvedCount / total) * 100);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            IT
          </span>
          <div className="brand-text">
            <div className="brand-title">Italy QR Quest</div>
            <div className="brand-sub">Scan • Play • Learn • Respect</div>
          </div>
        </Link>

        <div className="topbar-actions">
          <div className="progress-pill" title="Your progress">
            <div className="progress-pill-top">
              <span className="mono">{solvedCount}/{total}</span>
              <span className="muted">found</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <ThemeToggle
            onToggle={(next) => {
              setState((s) => {
                const n = { ...s, theme: next };
                localStorage.setItem("italy_theme", next);
                document.documentElement.dataset.theme = next;
                return n;
              });
              if (location.pathname !== "/") onToast?.("Theme updated.", "ok");
            }}
          />
          <Link to="/leaderboard" className="ghost-btn">
            Leaderboard
          </Link>
        </div>
      </div>
    </header>
  );
}
