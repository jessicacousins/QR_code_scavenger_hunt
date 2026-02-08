import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import Card from "../components/Card.jsx";
import { LOCATIONS } from "../data/locations.js";
import { submitAchievementIfEligible } from "./Leaderboard.jsx";

export default function Certificate({ state, setState, onToast }) {
  const ref = useRef(null);
  const solvedCount = Object.keys(state.solved || {}).length;
  const allDone = solvedCount === LOCATIONS.length;

  const name = state.profile?.firstName?.trim() || "Explorer";
  const dept = state.profile?.department?.trim() || "Department";

  const [busy, setBusy] = useState(false);

  const canSubmit = allDone && !state.submittedAchievement;

  async function download() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Italy-Explorer-${name}.png`;
      a.click();
      onToast?.("Certificate downloaded!", "ok");
    } catch {
      onToast?.("Could not generate image on this device.", "warn");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    try {
      const ok = await submitAchievementIfEligible(state, setState);
      if (ok) onToast?.("Submitted to leaderboard!", "ok");
      else onToast?.("Leaderboard submit not available (Firebase not configured) or already submitted.", "warn");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <section className="page-head">
        <div className="crumbs">
          <Link to="/" className="crumb">Home</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb">Certificate</span>
        </div>
        <h1 className="h1">Italy Explorer</h1>
        <p className="muted">
          {allDone ? "Achievement unlocked. Download or submit to the live leaderboard." : "Complete all 10 locations to unlock."}
        </p>
      </section>

      <div className="certWrap">
        <div className="certificate" ref={ref}>
          <div className="certTop">
            <div className="certSeal" aria-hidden="true">★</div>
            <div>
              <div className="certTitle">Italy Explorer Achievement</div>
              <div className="certSub">Scavenger Hunt • Culture • Respect</div>
            </div>
          </div>

          <div className="certMid">
            <div className="certName">{name}</div>
            <div className="certDept">{dept}</div>
            <div className="certLine" />
            <div className="certText">
              Completed all <strong>10</strong> Italy locations and finished each mini‑game once.
            </div>
            <div className="certPoints">
              Total Points: <span className="mono">{state.totalPoints || 0}</span>
            </div>
          </div>

          <div className="certBottom">
            <div className="certFine">Play fair • Cheer others on • Keep spaces welcoming</div>
            <div className="certStamp mono">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <Card
        title="Next"
        sub="Leaderboard is shared across devices (requires free Firebase)."
      >
        <div className="row">
          <button className="btn" onClick={download} disabled={!allDone || busy}>
            Download Certificate
          </button>
          <button className="btn alt" onClick={submit} disabled={!canSubmit || busy}>
            {state.submittedAchievement ? "Already Submitted" : "Submit to Leaderboard"}
          </button>
          <Link to="/leaderboard" className="ghost-btn">View Leaderboard</Link>
        </div>
        {!allDone && (
          <div className="hint warn">Complete all 10 first. Current: {solvedCount}/10</div>
        )}
      </Card>
    </div>
  );
}
