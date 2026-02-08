import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProgressGrid from "../components/ProgressGrid.jsx";
import Card from "../components/Card.jsx";
import { DEPARTMENTS } from "../utils/departments.js";
import { LOCATIONS } from "../data/locations.js";

export default function Home({ state, setState, onToast }) {
  const solvedCount = Object.keys(state.solved || {}).length;
  const total = LOCATIONS.length;
  const allDone = solvedCount === total;

  const profileOk = useMemo(() => {
    return state.profile?.firstName?.trim() && state.profile?.department?.trim();
  }, [state.profile]);

  function setProfile(k, v) {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, [k]: v },
    }));
  }

  return (
    <div className="stack">
      <section className="hero">
        <motion.div
          className="hero-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="hero-kicker">Mobile scavenger hunt • 10 QR codes • Italy Edition</div>
          <h1 className="hero-title">Scan. Solve. Explore.</h1>
          <p className="hero-lede">
            Find all 10 Italy locations around the venue. Each QR unlocks a quick mini‑game plus a fun fact.
            Complete all 10 to unlock the <span className="accent">Italy Explorer</span> achievement.
          </p>

          <div className="hero-row">
            <div className="hero-mini">
              <div className="mini-label">Your department</div>
              <select
                className="input"
                value={state.profile.department || ""}
                onChange={(e) => setProfile("department", e.target.value)}
                aria-label="Select your department"
              >
                <option value="" disabled>
                  Select…
                </option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="hero-mini">
              <div className="mini-label">First name</div>
              <input
                className="input"
                value={state.profile.firstName || ""}
                onChange={(e) => setProfile("firstName", e.target.value.replace(/[^a-zA-Z\-\s]/g, ""))}
                placeholder="e.g., Jess"
                maxLength={18}
                aria-label="Enter your first name"
              />
            </div>
          </div>

          <div className="hero-actions">
            <Link
              to="/leaderboard"
              className="btn"
              onClick={() => {
                if (!profileOk) onToast?.("Add your name + department for the leaderboard.", "warn");
              }}
            >
              View Leaderboard
            </Link>

            {allDone ? (
              <Link to="/certificate" className="btn alt">
                View Certificate
              </Link>
            ) : (
              <button
                className="btn alt"
                onClick={() => onToast?.("Scan a QR code to begin — or tap any location tile after your first scan.", "ok")}
              >
                How to Start
              </button>
            )}

            <div className="hero-progress">
              <span className="mono">{solvedCount}/{total}</span> completed
            </div>
          </div>

          <div className="ethics-banner" role="note" aria-label="Ethics and respect note">
            <strong>Ethics & Respect:</strong> Compete hard, stay kind. Take turns, encourage others,
            and keep shared spaces clean.
          </div>
        </motion.div>
      </section>

      <ProgressGrid state={state} />

      <Card
        title="How QR codes work"
        sub="Each QR points to a location URL like /loc/3. When you finish the mini‑game once, it stays unlocked (replay content anytime) but won’t score again."
      >
        <ul className="bullets">
          <li>Scan a QR code with iPhone Camera or Android camera.</li>
          <li>Complete the mini‑game to mark that location as “Found”.</li>
          <li>Complete all 10 to unlock Italy Explorer + submit to leaderboard.</li>
        </ul>
        <div className="row">
          <Link to="/admin/links" className="ghost-btn">
            Admin: Location Links
          </Link>
          <Link to="/leaderboard" className="ghost-btn">
            Leaderboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
