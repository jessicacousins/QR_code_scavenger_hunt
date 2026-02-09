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
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";

export async function submitAchievementIfEligible(state, setState) {
  const solvedCount = Object.keys(state.solved || {}).length;
  const allDone = solvedCount === LOCATIONS.length;

  if (!allDone) return false;
  if (state.submittedAchievement) return false;
  if (!fbEnabled) return false;

  const name = (state.profile?.firstName || "").trim();
  const dept = (state.profile?.department || "").trim();
  if (!name || !dept) return false;

  const { uid } = await ensureAnonAuth();
  if (!uid) return false;

  const { db } = getFirebase();
  const entryRef = doc(db, "italyQuestLeaderboard", uid);

  const existing = await getDoc(entryRef);
  if (existing.exists()) {
    // already submitted on this device identity
    setState((s) => ({ ...s, submittedAchievement: true }));
    return false;
  }

  const payload = {
    firstName: name.slice(0, 18),
    department: dept.slice(0, 24),
    totalPoints: Number(state.totalPoints || 0),
    completedAt: serverTimestamp(),
    solvedCount,
    version: "v1",
  };

  await setDoc(entryRef, payload, { merge: false });

  setState((s) => ({ ...s, submittedAchievement: true }));
  return true;
}

export default function Leaderboard({ state, onToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const solvedCount = Object.keys(state.solved || {}).length;
  const allDone = solvedCount === LOCATIONS.length;
  const profileOk =
    (state.profile?.firstName || "").trim() &&
    (state.profile?.department || "").trim();

  useEffect(() => {
    let mounted = true;
    async function load() {
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
          limit(50),
        );
        const snap = await getDocs(qy);
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        if (mounted) setRows(list);
      } catch (e) {
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <div className="stack">
      <section className="page-head">
        <div className="crumbs">
          <Link to="/" className="crumb">
            Home
          </Link>
          <span className="crumb-sep">/</span>
          <span className="crumb">Leaderboard</span>
        </div>
        <h1 className="h1">Italy Explorer Leaderboard</h1>
        <p className="muted">
          Shared live board for departments. Submit after completing all 10
          locations.
        </p>
      </section>

      {!fbEnabled && (
        <Card
          title="Leaderboard Unavailable"
          sub="shared leaderboard -  Firebase. "
        >
          <div className="hint warn">Under development...</div>
        </Card>
      )}

      <Card
        title="Your Status"
        sub="Finish all 10 to unlock and submit your achievement."
      >
        <div className="row wrap">
          <div className="stat">
            <div className="stat-num mono">{solvedCount}/10</div>
            <div className="stat-label">Locations</div>
          </div>
          <div className="stat">
            <div className="stat-num mono">{state.totalPoints || 0}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              {state.submittedAchievement ? "✅" : allDone ? "⭐" : "—"}
            </div>
            <div className="stat-label">Submitted</div>
          </div>
        </div>

        <div className="row">
          <Link className="btn" to={allDone ? "/certificate" : "/"}>
            {allDone ? "Go to Certificate" : "Continue Hunt"}
          </Link>
        </div>

        {!profileOk && (
          <div className="hint warn">
            Add your name + department on the home page to submit.
          </div>
        )}
      </Card>

      <Card
        title="Top Explorers"
        sub={loading ? "Loading…" : "Ranked by points"}
      >
        <div className="leader">
          {top3.map((r, i) => (
            <div key={r.id} className="leader-top">
              <div className="medal">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </div>
              <div className="leader-name">
                {r.firstName} <span className="muted">({r.department})</span>
              </div>
              <div className="leader-points mono">{r.totalPoints}</div>
            </div>
          ))}
          {top3.length === 0 && (
            <div className="muted">No submissions yet. Be the first!</div>
          )}
        </div>
      </Card>

      <Card title="Full Board" sub="Up to 50 submissions shown">
        <div className="table">
          <div className="trow thead">
            <div>#</div>
            <div>Name</div>
            <div>Department</div>
            <div className="right">Points</div>
          </div>
          {rows.map((r, idx) => (
            <div className="trow" key={r.id}>
              <div className="mono">{idx + 1}</div>
              <div>{r.firstName}</div>
              <div className="muted">{r.department}</div>
              <div className="right mono">{r.totalPoints}</div>
            </div>
          ))}
          {rows.length === 0 && !loading && (
            <div className="muted">No entries yet.</div>
          )}
        </div>

        <div className="hint muted">
          Ethics & Respect note: Win with integrity—help others join in and
          avoid blocking access to QR stations.
        </div>
      </Card>
    </div>
  );
}
