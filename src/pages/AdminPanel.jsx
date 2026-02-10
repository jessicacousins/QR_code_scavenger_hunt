import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import {
  fbEnabled,
  ensureAnonAuth,
  getFirebase,
  serverTimestamp,
} from "../firebase.js";
import { LOCATIONS } from "../data/locations.js";
import { freshState } from "../utils/storage.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

function buildBypassSolved() {
  const solved = {};
  for (const loc of LOCATIONS) {
    solved[loc.id] = { solvedAt: Date.now(), points: 100 };
  }
  return solved;
}

export default function AdminPanel({ state, setState, onToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [filter, setFilter] = useState("");
  const adminCode = import.meta.env.VITE_ADMIN_CODE || "ITALY-ADMIN";

  async function loadRows() {
    setLoading(true);
    try {
      if (!fbEnabled) {
        setRows([]);
        return;
      }
      await ensureAnonAuth();
      const { db } = getFirebase();
      const qy = query(
        collection(db, "italyQuestLeaderboard"),
        orderBy("totalPoints", "desc"),
        limit(200),
      );
      const snap = await getDocs(qy);
      const next = [];
      snap.forEach((d) => next.push({ id: d.id, ...d.data() }));
      setRows(next);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (unlocked) loadRows();
  }, [unlocked]); // eslint-disable-line

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const name = String(r.firstName || "").toLowerCase();
      const dept = String(r.department || "").toLowerCase();
      const id = String(r.id || "").toLowerCase();
      return name.includes(q) || dept.includes(q) || id.includes(q);
    });
  }, [rows, filter]);

  async function runRowAction(row, action) {
    if (!fbEnabled) return;
    setBusyId(row.id);
    try {
      const { db } = getFirebase();
      const ref = doc(db, "italyQuestLeaderboard", row.id);

      if (action === "delete") {
        await deleteDoc(ref);
        onToast?.(`Deleted user ${row.firstName || row.id}.`, "ok");
      }

      if (action === "reset") {
        await updateDoc(ref, {
          totalPoints: 0,
          solvedCount: 0,
          achievementUnlocked: false,
          adminResetAt: serverTimestamp(),
        });
        onToast?.(`Reset progress for ${row.firstName || row.id}.`, "ok");
      }

      if (action === "grant") {
        await updateDoc(ref, {
          solvedCount: LOCATIONS.length,
          achievementUnlocked: true,
          adminGrantedAchievement: true,
          adminGrantedAt: serverTimestamp(),
        });
        onToast?.(`Granted achievement to ${row.firstName || row.id}.`, "ok");
      }

      await loadRows();
    } catch {
      onToast?.("Admin action failed. Check Firebase rules/permissions.", "warn");
    } finally {
      setBusyId("");
    }
  }

  function resetThisDevice() {
    setState((s) => {
      const base = freshState();
      return {
        ...base,
        theme: s.theme,
        profile: { ...base.profile, ...s.profile },
      };
    });
    onToast?.("This device state has been reset.", "ok");
  }

  function bypassThisDevice() {
    const solved = buildBypassSolved();
    const totalPoints = Object.values(solved).reduce((sum, x) => sum + (x.points || 0), 0);
    setState((s) => ({
      ...s,
      solved,
      totalPoints,
      achievementUnlocked: true,
    }));
    onToast?.("Achievement bypass granted on this device.", "ok");
  }

  if (!unlocked) {
    return (
      <div className="stack">
        <section className="page-head">
          <div className="crumbs">
            <Link to="/" className="crumb">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb">Admin Panel</span>
          </div>
          <h1 className="h1">Admin Panel</h1>
          <p className="muted">Enter the admin code to continue.</p>
        </section>

        <Card title="Unlock Admin Tools" sub="Use environment variable VITE_ADMIN_CODE to customize this code.">
          <div className="admin-unlock">
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Admin code"
              aria-label="Admin code"
            />
            <button
              className="btn"
              onClick={() => {
                if (code.trim() === adminCode) {
                  setUnlocked(true);
                  onToast?.("Admin panel unlocked.", "ok");
                } else {
                  onToast?.("Incorrect admin code.", "warn");
                }
              }}
            >
              Unlock
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="page-head">
        <div className="crumbs">
          <Link to="/" className="crumb">Home</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb">Admin Panel</span>
        </div>
        <h1 className="h1">Admin Panel</h1>
        <p className="muted">
          Manage players: delete entries, reset progress, or grant achievement.
        </p>
      </section>

      <Card title="Local Device Controls" sub="Affects only this browser/device state.">
        <div className="admin-actions">
          <button className="ghost-btn" onClick={resetThisDevice}>Reset This Device Mini-Games</button>
          <button className="btn alt" onClick={bypassThisDevice}>Bypass + Grant Achievement (This Device)</button>
        </div>
        <div className="hint muted">
          Current device: {Object.keys(state.solved || {}).length}/{LOCATIONS.length} solved, {state.totalPoints || 0} points.
        </div>
      </Card>

      <Card title="Leaderboard User Controls" sub={loading ? "Loading users..." : "Firebase users"}>
        {!fbEnabled && <div className="hint warn">Firebase is disabled in this environment.</div>}
        {fbEnabled && (
          <>
            <div className="admin-row">
              <input
                className="input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name, department, or uid"
                aria-label="Filter users"
              />
              <button className="ghost-btn" onClick={loadRows} disabled={loading}>Refresh</button>
            </div>
            <div className="table">
              <div className="trow thead admin-trow">
                <div>Name</div>
                <div>Dept</div>
                <div className="right">Pts</div>
                <div className="right">Solved</div>
                <div>Actions</div>
              </div>
              {filteredRows.map((r) => (
                <div className="trow admin-trow" key={r.id}>
                  <div className="wrapline">{r.firstName || "(No name)"}</div>
                  <div className="muted wrapline">{r.department || "-"}</div>
                  <div className="right mono">{Number(r.totalPoints || 0)}</div>
                  <div className="right mono">{Number(r.solvedCount || 0)}</div>
                  <div className="admin-actions">
                    <button
                      className="ghost-btn"
                      disabled={busyId === r.id}
                      onClick={() => runRowAction(r, "reset")}
                    >
                      Reset
                    </button>
                    <button
                      className="btn alt"
                      disabled={busyId === r.id}
                      onClick={() => runRowAction(r, "grant")}
                    >
                      Grant
                    </button>
                    <button
                      className="danger-btn"
                      disabled={busyId === r.id}
                      onClick={() => runRowAction(r, "delete")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!loading && filteredRows.length === 0 && <div className="hint muted">No users found.</div>}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
