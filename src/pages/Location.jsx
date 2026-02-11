import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../components/Card.jsx";
import { LOCATIONS, getLocationById } from "../data/locations.js";
import { computePoints } from "../utils/gameScoring.js";

function now() { return Date.now(); }

function YouTubeEmbed({ videoId, title }) {
  return (
    <div className="video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title || "YouTube video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

/** GAME 1: Quiz */
function QuizGame({ locked, onSolved }) {
  const rounds = [
    {
      code: "FND-01",
      title: "Load Distribution",
      brief: "Cracks appear along the lower ellipse. Choose the best stabilization layer.",
      fact: "Roman engineers relied on travertine, tuff, and concrete systems to spread vertical and lateral load.",
      correct: "Reinforce with a travertine perimeter ring",
      options: [
        "Suspend the structure from bronze cables",
        "Reinforce with a travertine perimeter ring",
        "Replace lower walls with timber braces",
        "Use glass panels to reduce mass",
      ],
    },
    {
      code: "ARC-02",
      title: "Crowd Throughput",
      brief: "You need faster ingress for a full event. Which design scales circulation safely?",
      fact: "Stacked arcades and vomitoria moved spectators efficiently through the amphitheater.",
      correct: "Expand radial corridors and vaulted arches",
      options: [
        "Expand radial corridors and vaulted arches",
        "Reduce entrances to improve control",
        "Convert access points into ramps only",
        "Close upper tiers during entry",
      ],
    },
    {
      code: "ARE-03",
      title: "Arena Operations",
      brief: "Set transitions are too slow below stage level. Choose the authentic systems upgrade.",
      fact: "The hypogeum used chambers, trapdoors, and lift mechanisms for rapid scene changes.",
      correct: "Integrate hypogeum lift shafts and trapdoor routes",
      options: [
        "Flood the arena to move scenery by raft",
        "Integrate hypogeum lift shafts and trapdoor routes",
        "Move all prep space to rooftop platforms",
        "Remove underfloor compartments entirely",
      ],
    },
    {
      code: "SEA-04",
      title: "Spectator Zoning",
      brief: "Sightlines are uneven. Pick the seating geometry that best fits the venue.",
      fact: "Tiered cavea seating optimized viewing angles while managing social and traffic zones.",
      correct: "Use tiered cavea sectors with dedicated access bands",
      options: [
        "Use flat concentric benches with no aisles",
        "Use tiered cavea sectors with dedicated access bands",
        "Place premium seating only at arena floor",
        "Randomize rows to avoid crowd clustering",
      ],
    },
    {
      code: "ENV-05",
      title: "Heat Control",
      brief: "Afternoon heat is reducing comfort. Select the historically accurate mitigation.",
      fact: "The velarium was a retractable awning system stretched over the seating bowl.",
      correct: "Deploy a retractable velarium canopy",
      options: [
        "Install a fixed marble dome roof",
        "Deploy a retractable velarium canopy",
        "Cover spectators with mirrored panels",
        "Use oil torches for updraft cooling",
      ],
    },
  ];

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const [roundIdx, setRoundIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState("");
  const [choicesByRound, setChoicesByRound] = useState(() => rounds.map((r) => shuffle(r.options)));
  const startedAt = useRef(now());
  const solvedRef = useRef(false);

  const solvedCount = Math.min(roundIdx, rounds.length);
  const activeRound = roundIdx < rounds.length ? rounds[roundIdx] : null;
  const progressPct = Math.round((solvedCount / rounds.length) * 100);

  useEffect(() => {
    if (locked || solvedRef.current) return;
    if (roundIdx >= rounds.length) {
      solvedRef.current = true;
      const seconds = Math.round((now() - startedAt.current) / 1000);
      onSolved({ seconds, mistakes });
    }
  }, [roundIdx, locked, mistakes]); // eslint-disable-line

  function choose(option) {
    if (locked || !activeRound) return;
    if (option === activeRound.correct) {
      setStreak((s) => s + 1);
      setStatus("Correct decision. Arena subsystem stabilized.");
      setRoundIdx((i) => i + 1);
      return;
    }

    setMistakes((m) => m + 1);
    setStreak(0);
    setIntegrity((n) => Math.max(0, n - 14));
    setStatus("Rejected. Structural model mismatch.");
  }

  function restart() {
    if (locked) return;
    startedAt.current = now();
    solvedRef.current = false;
    setRoundIdx(0);
    setMistakes(0);
    setIntegrity(100);
    setStreak(0);
    setStatus("");
    setChoicesByRound(rounds.map((r) => shuffle(r.options)));
  }

  return (
    <div className="game">
      <div className="game-title">Colosseum Command: Structural Audit</div>
      <p className="game-q">
        Complete 5 real engineering calls to commission Rome&apos;s arena. Choices are randomized each round.
      </p>

      <div className="rome-hud">
        <div className="rome-hud-chip">Round {Math.min(roundIdx + 1, rounds.length)}/{rounds.length}</div>
        <div className="rome-hud-chip">Integrity {integrity}%</div>
        <div className="rome-hud-chip">Misses {mistakes}</div>
        <div className="rome-hud-chip">Streak {streak}</div>
      </div>

      <div className="rome-arena">
        <div
          className="rome-ring"
          style={{ "--rome-progress": `${progressPct}%` }}
          aria-label={`Arena completion ${progressPct}%`}
        />
        <div className="rome-core">
          <div className="rome-core-top">Audit Progress</div>
          <div className="rome-core-main">{solvedCount}/5</div>
        </div>
      </div>

      {activeRound ? (
        <div className="rome-stage-card">
          <div className="rome-stage-code">{activeRound.code}</div>
          <div className="rome-stage-title">{activeRound.title}</div>
          <p className="game-q">{activeRound.brief}</p>
          <p className="hint muted">{activeRound.fact}</p>
          <div className="rome-options">
            {choicesByRound[roundIdx].map((option) => (
              <button
                key={option}
                className="rome-opt"
                onClick={() => choose(option)}
                disabled={locked}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="hint muted">Audit complete. Rome unlocked.</div>
      )}

      {!!status && !locked && <div className={`hint ${status.startsWith("Rejected") ? "warn" : "muted"}`}>{status}</div>}
      {!locked && <button className="ghost-btn" onClick={restart}>Restart Audit</button>}
    </div>
  );
}
/** GAME 2: Word Scramble */
function WordScramble({ word, locked, onSolved }) {
  const stages = [
    {
      title: "Stone Street Base",
      prompt: "Pick the surface that defines old Tuscan lanes.",
      fact: "Historic centers were built around durable stone paving and stepped streets.",
      correct: "Cobblestone terrace",
      options: ["Cobblestone terrace", "Plastic deck", "Asphalt parking lot"],
    },
    {
      title: "Masonry Homes",
      prompt: "Choose the wall system common in 17th-century Italian hill towns.",
      fact: "Thick masonry walls kept homes cool in summer and stable over centuries.",
      correct: "Stone-and-plaster walls",
      options: ["Stone-and-plaster walls", "Mirror glass facade", "Steel warehouse shell"],
    },
    {
      title: "Terracotta Roofline",
      prompt: "Select the roof material that gives villages their warm silhouette.",
      fact: "Terracotta tiles became a hallmark of central Italian architecture.",
      correct: "Terracotta tile roofs",
      options: ["Terracotta tile roofs", "Transparent acrylic roof", "Flat aluminum canopy"],
    },
    {
      title: "Street Character",
      prompt: "Pick details that make the facade feel authentically Italian.",
      fact: "Shutters, arched openings, and small balconies define many historic streets.",
      correct: "Shutters and arched loggia",
      options: ["Shutters and arched loggia", "Neon sign wall", "LED billboard strip"],
    },
    {
      title: "Village Landmark",
      prompt: "Choose the final element often seen above old town roofs.",
      fact: "A campanile (bell tower) and greenery complete the classic skyline.",
      correct: "Campanile tower and cypress",
      options: ["Campanile tower and cypress", "Satellite dish array", "Airport radar mast"],
    },
  ];

  const [stageIdx, setStageIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const startedAt = useRef(now());
  const solvedRef = useRef(false);

  const built = locked ? stages.length : stageIdx;
  const stage = stages[Math.min(stageIdx, stages.length - 1)];

  useEffect(() => {
    if (locked || solvedRef.current) return;
    if (stageIdx >= stages.length) {
      solvedRef.current = true;
      const seconds = Math.round((now() - startedAt.current) / 1000);
      onSolved({ seconds, mistakes });
    }
  }, [stageIdx, mistakes, locked]); // eslint-disable-line

  function choose(option) {
    if (locked || advancing || stageIdx >= stages.length) return;

    if (option !== stage.correct) {
      setMistakes((m) => m + 1);
      setStatus("Not this one. Re-check the architectural clue.");
      return;
    }

    if (stageIdx === stages.length - 1) {
      setStatus("Village complete.");
      setStageIdx((i) => i + 1);
      return;
    }

    setStatus("Correct. Historic layer added.");
    setAdvancing(true);
    setTimeout(() => {
      setStageIdx((i) => i + 1);
      setAdvancing(false);
      setStatus("");
    }, 420);
  }

  function restart() {
    if (locked) return;
    startedAt.current = now();
    solvedRef.current = false;
    setStageIdx(0);
    setMistakes(0);
    setStatus("");
    setAdvancing(false);
  }

  return (
    <div className="game">
      <div className="game-title">Build A Tuscan Village</div>
      <p className="game-q">
        Create a 17th-century Italian streetscape in 5 stages. Choose the correct element each round.
      </p>

      <div className="hint muted">
        Stage {Math.min(stageIdx + 1, stages.length)}/{stages.length} | Built: {built}/5 | Misses: {mistakes}
      </div>

      <div className="duomo-card" aria-label="Tuscan village construction visual">
        <svg className="duomo-svg" viewBox="0 0 360 240" role="img" aria-label="Tuscan village build progress">
          <defs>
            <linearGradient id="villaSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7999bf" />
              <stop offset="58%" stopColor="#d7e6ef" />
              <stop offset="100%" stopColor="#f5d7ad" />
            </linearGradient>
            <linearGradient id="villaWall" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#efd9bc" />
              <stop offset="100%" stopColor="#caa27c" />
            </linearGradient>
            <linearGradient id="villaRoof" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c66a45" />
              <stop offset="100%" stopColor="#8e452f" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="360" height="240" fill="url(#villaSky)" />
          <path d="M0 108 L42 86 L94 104 L138 80 L188 101 L244 74 L300 102 L360 82 L360 136 L0 136 Z" fill="rgba(70,82,93,0.22)" />
          <circle cx="290" cy="44" r="18" fill="rgba(255,245,214,0.72)" />

          <path d="M0 188 C62 170, 124 173, 194 188 C242 198, 298 194, 360 178 L360 240 L0 240 Z" fill="#c8a07a" />
          <ellipse cx="176" cy="206" rx="140" ry="16" fill="rgba(74,47,31,0.24)" />

          <path className={`duomo-piece foundation ${built >= 1 ? "on" : ""}`} d="M34 196 L332 196 L316 222 L18 222 Z" />
          <path className={`duomo-piece foundation ${built >= 1 ? "on" : ""}`} d="M24 190 L334 190 L326 196 L32 196 Z" />

          <rect className={`duomo-piece house ${built >= 2 ? "on" : ""}`} x="56" y="128" width="72" height="62" rx="2" />
          <rect className={`duomo-piece house ${built >= 2 ? "on" : ""}`} x="128" y="118" width="96" height="72" rx="2" />
          <rect className={`duomo-piece house ${built >= 2 ? "on" : ""}`} x="224" y="132" width="70" height="58" rx="2" />

          <path className={`duomo-piece roof ${built >= 3 ? "on" : ""}`} d="M52 128 L92 102 L132 128 Z" />
          <path className={`duomo-piece roof ${built >= 3 ? "on" : ""}`} d="M122 118 L176 86 L230 118 Z" />
          <path className={`duomo-piece roof ${built >= 3 ? "on" : ""}`} d="M220 132 L258 108 L296 132 Z" />
          <rect className={`duomo-piece chimney ${built >= 3 ? "on" : ""}`} x="196" y="92" width="10" height="20" rx="2" />

          <rect className={`duomo-piece shutter ${built >= 4 ? "on" : ""}`} x="72" y="148" width="10" height="24" rx="1" />
          <rect className={`duomo-piece shutter ${built >= 4 ? "on" : ""}`} x="100" y="148" width="10" height="24" rx="1" />
          <rect className={`duomo-piece shutter ${built >= 4 ? "on" : ""}`} x="146" y="140" width="12" height="28" rx="1" />
          <rect className={`duomo-piece shutter ${built >= 4 ? "on" : ""}`} x="194" y="140" width="12" height="28" rx="1" />
          <path className={`duomo-piece loggia ${built >= 4 ? "on" : ""}`} d="M154 190 L154 166 Q164 150 174 166 L174 190 Z" />
          <path className={`duomo-piece loggia ${built >= 4 ? "on" : ""}`} d="M178 190 L178 166 Q188 150 198 166 L198 190 Z" />

          <rect className={`duomo-piece tower ${built >= 5 ? "on" : ""}`} x="304" y="92" width="22" height="98" rx="2" />
          <rect className={`duomo-piece tower ${built >= 5 ? "on" : ""}`} x="308" y="82" width="14" height="12" rx="1" />
          <circle className={`duomo-piece tower ${built >= 5 ? "on" : ""}`} cx="315" cy="104" r="3" />
          <path className={`duomo-piece cypress ${built >= 5 ? "on" : ""}`} d="M38 190 C42 160, 42 136, 50 116 C58 136, 58 160, 62 190 Z" />
          <path className={`duomo-piece cypress ${built >= 5 ? "on" : ""}`} d="M288 190 C292 166, 292 146, 300 126 C308 146, 308 166, 312 190 Z" />
        </svg>

        <div className="duomo-overlay">
          <div className="duomo-stage-title">{stageIdx < stages.length ? stage.title : "Village Completed"}</div>
          <div className="duomo-stage-fact">{stage.fact}</div>
        </div>
      </div>

      {stageIdx < stages.length ? (
        <>
          <p className="game-q">{stage.prompt}</p>
          <div className="duomo-options">
            {stage.options.map((option) => (
              <button key={option} className="duomo-opt" onClick={() => choose(option)} disabled={locked || advancing}>
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="hint muted">Florence complete. Location unlocked.</div>
      )}

      {!!status && !locked && <div className={`hint ${status.startsWith("Not") ? "warn" : "muted"}`}>{status}</div>}

      {!locked && <button className="ghost-btn" onClick={restart}>Restart Build</button>}
      <div className="hint muted">Reference token: {word}</div>
    </div>
  );
}
/** GAME 3: Path Tap (Venice canals) */
function PathTap({ locked, onSolved }) {
  // 3x3 grid; need to tap in order to "navigate"
  const path = [0, 1, 4, 7, 8];
  const nodePos = {
    0: { x: 18, y: 18 },
    1: { x: 50, y: 18 },
    2: { x: 82, y: 18 },
    3: { x: 18, y: 50 },
    4: { x: 50, y: 50 },
    5: { x: 82, y: 50 },
    6: { x: 18, y: 82 },
    7: { x: 50, y: 82 },
    8: { x: 82, y: 82 },
  };
  const canalSegments = [
    [0, 1], [1, 2],
    [0, 3], [1, 4], [2, 5],
    [3, 4], [4, 5],
    [3, 6], [4, 7], [5, 8],
    [6, 7], [7, 8],
  ];

  const [seq, setSeq] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState("Tap START, then follow the highlighted canal route to FINISH.");
  const [shake, setShake] = useState(false);
  const [showRoute, setShowRoute] = useState(true);
  const startedAt = useRef(now());
  const shakeTimer = useRef(null);

  const progressPct = Math.round((seq.length / path.length) * 100);
  const nextTile = seq.length < path.length ? path[seq.length] : null;
  const boatTile = seq.length ? seq[seq.length - 1] : path[0];
  const routeLinePoints = path.map((tile) => `${nodePos[tile].x},${nodePos[tile].y}`).join(" ");

  function tap(i) {
    if (locked) return;
    const nextIndex = seq.length;
    if (i === path[nextIndex]) {
      const n = [...seq, i];
      setSeq(n);
      if (n.length === path.length) {
        setStatus("Perfect route. You made it through the canals.");
        const seconds = Math.round((now() - startedAt.current) / 1000);
        onSolved({ seconds, mistakes });
      } else {
        const upcoming = path[n.length];
        setStatus(`Nice move. Next canal stop: Tile ${upcoming + 1}.`);
      }
    } else {
      setMistakes((m) => m + 1);
      setSeq([]);
      setStatus("Wrong turn. Route reset to START.");
      setShake(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShake(false), 260);
    }
  }

  function reset() {
    setSeq([]);
    setStatus("Route reset. Tap START to begin again.");
  }

  useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, []);

  return (
    <div className="game">
      <div className="game-title">Canal Navigation</div>
      <p className="game-q">
        Venice uses canals like streets. Follow the highlighted water route from START to FINISH.
      </p>

      <div className="venice-route-card" aria-label="Canal route map">
        <div className="venice-route-head">
          <div className="venice-route-title">Canal Route Map</div>
          <button
            className="ghost-btn venice-route-toggle"
            type="button"
            disabled={locked}
            onClick={() => setShowRoute((v) => !v)}
          >
            {showRoute ? "Hide Route" : "Show Route"}
          </button>
        </div>
        <p className="venice-route-copy">
          Water streets are highlighted in blue. Stay on the bright route to reach FINISH.
        </p>
        <div className="venice-map-stage">
          <svg className="venice-map" viewBox="0 0 100 100" role="img" aria-label="Venice canal map and route">
            {canalSegments.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                className="venice-map-canal"
                x1={nodePos[a].x}
                y1={nodePos[a].y}
                x2={nodePos[b].x}
                y2={nodePos[b].y}
              />
            ))}
            {showRoute && <polyline className="venice-map-route" points={routeLinePoints} />}
            {path.map((tile, idx) => (
              <g key={tile}>
                <circle className="venice-map-stop" cx={nodePos[tile].x} cy={nodePos[tile].y} r="4.2" />
                <text className="venice-map-step" x={nodePos[tile].x} y={nodePos[tile].y + 1.1}>{idx + 1}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="venice-instructions" aria-label="Canal navigation instructions">
        <div className="venice-instructions-title">How to play</div>
        <div className="venice-instructions-list">
          <span>1. Tap the START tile first.</span>
          <span>2. Follow tiles in route order: 1, 2, 5, 8, 9.</span>
          <span>3. Wrong tile resets to START.</span>
        </div>
      </div>

      <div className={`venice-grid-wrap ${shake ? "shake" : ""}`}>
        <div className="venice-grid-water" aria-hidden="true" />
        {showRoute && (
          <svg className="venice-grid-route" viewBox="0 0 100 100" aria-hidden="true">
            {canalSegments.map(([a, b]) => (
              <line
                key={`grid-${a}-${b}`}
                className="venice-grid-canal"
                x1={nodePos[a].x}
                y1={nodePos[a].y}
                x2={nodePos[b].x}
                y2={nodePos[b].y}
              />
            ))}
            <polyline className="venice-grid-main-route" points={routeLinePoints} />
          </svg>
        )}
        <div className="venice-grid">
          {Array.from({ length: 9 }).map((_, i) => {
            const isIn = seq.includes(i);
            const stepNumber = seq.indexOf(i) + 1;
            const isStart = i === path[0];
            const isEnd = i === path[path.length - 1];
            const isNext = !locked && nextTile === i;
            const hasBoat = boatTile === i;
            const isRouteTile = path.includes(i);
            return (
              <button
                key={i}
                className={`venice-cell ${isIn ? "on" : ""} ${isStart ? "start" : ""} ${isEnd ? "end" : ""} ${isNext ? "next" : ""} ${isRouteTile ? "route" : ""}`}
                onClick={() => tap(i)}
                disabled={locked}
                aria-label={`Tile ${i + 1}`}
              >
                <span className="venice-cell-id">{i + 1}</span>
                {isStart && <span className="venice-flag">START</span>}
                {isEnd && <span className="venice-flag">FINISH</span>}
                {isIn && <span className="venice-step">{stepNumber}</span>}
                {showRoute && isRouteTile && !isIn && <span className="venice-route-dot" aria-hidden="true" />}
                {hasBoat && <span className="venice-boat" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="venice-progress" aria-label="Route progress">
        <div className="venice-progress-track">
          <div className="venice-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="venice-progress-meta">
          <span className="hint muted">Progress: {seq.length}/{path.length}</span>
          {!locked && nextTile !== null && <span className="hint muted">Next: Tile {nextTile + 1}</span>}
        </div>
      </div>

      {!locked && <div className={`hint ${status.startsWith("Wrong") ? "warn" : "muted"}`}>{status}</div>}
      {!locked && mistakes > 0 && <div className="hint warn">Resets: {mistakes}</div>}
      <button className="btn" disabled={locked} onClick={reset}>Reset Route</button>
    </div>
  );
}
/** GAME 4: Pattern Memory */
function PatternMemory({ locked, onSolved }) {
  // show 4-step pattern on 2x2, then user repeats
  const buttons = ["A", "B", "C", "D"];
  const [pattern] = useState(() => Array.from({ length: 4 }).map(() => Math.floor(Math.random() * 4)));
  const [showing, setShowing] = useState(true);
  const [idx, setIdx] = useState(0);
  const [flash, setFlash] = useState(-1);
  const [mistakes, setMistakes] = useState(0);
  const startedAt = useRef(now());

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (let i = 0; i < pattern.length; i++) {
        if (cancelled) return;
        setFlash(pattern[i]);
        await new Promise((r) => setTimeout(r, 360));
        setFlash(-1);
        await new Promise((r) => setTimeout(r, 140));
      }
      setShowing(false);
    }
    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  function press(i) {
    if (locked || showing) return;
    if (i === pattern[idx]) {
      const n = idx + 1;
      setIdx(n);
      if (n === pattern.length) {
        const seconds = Math.round((now() - startedAt.current) / 1000);
        onSolved({ seconds, mistakes });
      }
    } else {
      setMistakes((m) => m + 1);
      setIdx(0);
    }
  }

  return (
    <div className="game">
      <div className="game-title">Design Memory</div>
      <p className="game-q">
        Watch the flashes, then repeat the pattern. Wrong press resets.
      </p>
      <div className="grid2">
        {buttons.map((b, i) => (
          <button
            key={b}
            className={`mem ${flash === i ? "flash" : ""}`}
            onClick={() => press(i)}
            disabled={locked || showing}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="hint muted">
        {locked ? "Completed" : showing ? "Watching…" : `Your turn: ${idx}/4`}
      </div>
      {!locked && mistakes > 0 && <div className="hint warn">Resets: {mistakes}</div>}
    </div>
  );
}

/** GAME 5: Drag Build (Pizza) */
function DragBuild({ locked, onSolved }) {
  const steps = ["Dough", "Tomato", "Mozzarella", "Basil"];
  const [pool, setPool] = useState(() => shuffle(steps));
  const [built, setBuilt] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const startedAt = useRef(now());

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function add(item) {
    if (locked) return;
    const want = steps[built.length];
    if (item === want) {
      setBuilt((b) => [...b, item]);
      setPool((p) => p.filter((x) => x !== item));
      if (built.length + 1 === steps.length) {
        const seconds = Math.round((now() - startedAt.current) / 1000);
        onSolved({ seconds, mistakes });
      }
    } else {
      setMistakes((m) => m + 1);
    }
  }

  function reset() {
    if (locked) return;
    setPool(shuffle(steps));
    setBuilt([]);
    setMistakes(0);
  }

  return (
    <div className="game">
      <div className="game-title">Build the Classic</div>
      <p className="game-q">Tap the ingredients in the right order.</p>

      <div className="dragzone">
        <div className="stackline">
          {steps.map((s, i) => (
            <div key={s} className={`slot ${built[i] ? "filled" : ""}`}>
              {built[i] ? built[i] : i === built.length ? "Next…" : "—"}
            </div>
          ))}
        </div>

        <div className="ingredients">
          {pool.map((p) => (
            <button key={p} className="chipbtn" disabled={locked} onClick={() => add(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <button className="ghost-btn" onClick={reset} disabled={locked}>Reset</button>
        {!locked && mistakes > 0 && <div className="hint warn">Mistakes: {mistakes}</div>}
      </div>
    </div>
  );
}

/** GAME 6: Ingredient match (pairing) */
function IngredientMatch({ locked, onSolved }) {
  const pairs = [
    ["Pesto", "Basil"],
    ["Risotto", "Rice"],
    ["Gelato", "Frozen dessert"],
    ["Espresso", "Coffee shot"]
  ];
  const left = pairs.map((p) => p[0]);
  const right = pairs.map((p) => p[1]);
  const [L] = useState(() => shuffle(left));
  const [R] = useState(() => shuffle(right));
  const [pickL, setPickL] = useState(null);
  const [pickR, setPickR] = useState(null);
  const [matched, setMatched] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const startedAt = useRef(now());

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  useEffect(() => {
    if (pickL && pickR) {
      const ok = pairs.some(([a, b]) => a === pickL && b === pickR);
      if (ok) {
        setMatched((m) => [...m, pickL]);
        setPickL(null);
        setPickR(null);
      } else {
        setMistakes((m) => m + 1);
        setTimeout(() => {
          setPickL(null);
          setPickR(null);
        }, 450);
      }
    }
  }, [pickL, pickR]); // eslint-disable-line

  useEffect(() => {
    if (matched.length === pairs.length && !locked) {
      const seconds = Math.round((now() - startedAt.current) / 1000);
      onSolved({ seconds, mistakes });
    }
  }, [matched, locked]); // eslint-disable-line

  return (
    <div className="game">
      <div className="game-title">Food Match</div>
      <p className="game-q">Match each item with its description.</p>

      <div className="match">
        <div className="match-col">
          {L.map((x) => {
            const done = matched.includes(x);
            return (
              <button
                key={x}
                className={`matchbtn ${pickL === x ? "active" : ""}`}
                disabled={locked || done}
                onClick={() => setPickL(x)}
              >
                {x}
              </button>
            );
          })}
        </div>
        <div className="match-col">
          {R.map((x) => (
            <button
              key={x}
              className={`matchbtn ${pickR === x ? "active" : ""}`}
              disabled={locked}
              onClick={() => setPickR(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {!locked && mistakes > 0 && <div className="hint warn">Misses: {mistakes}</div>}
    </div>
  );
}

/** GAME 7: Pisa Tower Tic-Tac-Toe */
function TiltBalance({ locked, onSolved }) {
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [turn, setTurn] = useState("player");
  const [roundResult, setRoundResult] = useState("");
  const [winningLine, setWinningLine] = useState([]);
  const [roundsWon, setRoundsWon] = useState(0);
  const [roundsLost, setRoundsLost] = useState(0);
  const [draws, setDraws] = useState(0);
  const startedAt = useRef(now());
  const solvedRef = useRef(false);

  function getWinner(cells) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return { winner: cells[a], line };
      }
    }
    return null;
  }

  function chooseBotMove(cells) {
    const free = cells.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    if (!free.length) return -1;

    for (const i of free) {
      const next = [...cells];
      next[i] = "B";
      if (getWinner(next)?.winner === "B") return i;
    }

    for (const i of free) {
      const next = [...cells];
      next[i] = "P";
      if (getWinner(next)?.winner === "P") return i;
    }

    if (free.includes(4)) return 4;
    const corners = free.filter((i) => [0, 2, 6, 8].includes(i));
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return free[Math.floor(Math.random() * free.length)];
  }

  function finishRound(result, line = []) {
    setRoundResult(result);
    setWinningLine(line);
    setTurn("player");
    if (result === "player") setRoundsWon((x) => x + 1);
    else if (result === "bot") setRoundsLost((x) => x + 1);
    else setDraws((x) => x + 1);
  }

  function handlePlayerMove(i) {
    if (locked || turn !== "player" || roundResult || board[i]) return;
    const next = [...board];
    next[i] = "P";
    setBoard(next);
    setTurn("bot");
  }

  useEffect(() => {
    if (locked || roundResult) return;

    const result = getWinner(board);
    if (result) {
      finishRound(result.winner === "P" ? "player" : "bot", result.line);
      return;
    }

    if (board.every(Boolean)) {
      finishRound("draw");
      return;
    }

    if (turn === "bot") {
      const t = setTimeout(() => {
        setBoard((cells) => {
          const move = chooseBotMove(cells);
          if (move < 0) return cells;
          const next = [...cells];
          next[move] = "B";
          return next;
        });
        setTurn("player");
      }, 360);
      return () => clearTimeout(t);
    }
  }, [board, turn, locked, roundResult]); // eslint-disable-line

  useEffect(() => {
    if (locked || solvedRef.current) return;
    if (roundsWon >= 3) {
      solvedRef.current = true;
      onSolved({
        seconds: Math.round((now() - startedAt.current) / 1000),
        mistakes: roundsLost
      });
    }
  }, [roundsWon, roundsLost, locked]); // eslint-disable-line

  function nextRound() {
    if (locked || roundsWon >= 3) return;
    setBoard(Array(9).fill(null));
    setRoundResult("");
    setWinningLine([]);
    setTurn("player");
  }

  function cellLabel(value) {
    if (value === "P") return "Tower block";
    if (value === "B") return "Bot X";
    return "Empty";
  }

  return (
    <div className="game">
      <div className="game-title">Build the Pisa Tower</div>
      <p className="game-q">
        Beat the bot in Tic-Tac-Toe. Win 3 rounds to complete Pisa and unlock this location.
      </p>

      <div className="ttt-meta">
        <div className="hint muted">Tower built: {Math.min(roundsWon, 3)}/3</div>
        <div className="hint muted">Bot wins: {roundsLost} | Draws: {draws}</div>
      </div>

      <div className="ttt-grid" role="grid" aria-label="Tic-Tac-Toe board">
        {board.map((value, i) => {
          const isBotWinCell = roundResult === "bot" && winningLine.includes(i);
          return (
            <button
              key={i}
              role="gridcell"
              className={`ttt-cell ${isBotWinCell ? "bot-win" : ""}`}
              onClick={() => handlePlayerMove(i)}
              disabled={locked || !!roundResult || turn !== "player" || !!value || roundsWon >= 3}
              aria-label={`Cell ${i + 1}: ${cellLabel(value)}`}
            >
              {value === "P" && <span className="ttt-mark ttt-player">[]</span>}
              {value === "B" && <span className="ttt-mark ttt-bot">X</span>}
            </button>
          );
        })}
      </div>

      <div className="hint muted">
        {locked || roundsWon >= 3
          ? "Tower complete. Location unlocked."
          : roundResult
            ? roundResult === "player"
              ? "Round win. Start the next layer of the tower."
              : roundResult === "bot"
                ? "Bot took this round. Blacked-out red X marks its line."
                : "Draw round. Try again."
            : turn === "player"
              ? "Your move."
              : "Bot is thinking..."}
      </div>

      {!locked && !!roundResult && roundsWon < 3 && (
        <button className="btn" onClick={nextRound}>Next Round</button>
      )}
    </div>
  );
}
/** GAME 8: Phrase order */
function PhraseOrder({ locked, onSolved }) {
  const target = ["Buongiorno", "!", "Come", "stai", "?"]; // Good morning! How are you?
  const [pool, setPool] = useState(() => shuffle(target));
  const [built, setBuilt] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const startedAt = useRef(now());

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(tok) {
    if (locked) return;
    const want = target[built.length];
    if (tok === want) {
      setBuilt((b) => [...b, tok]);
      setPool((p) => p.filter((x) => x !== tok));
      if (built.length + 1 === target.length) {
        const seconds = Math.round((now() - startedAt.current) / 1000);
        onSolved({ seconds, mistakes });
      }
    } else {
      setMistakes((m) => m + 1);
    }
  }

  function reset() {
    if (locked) return;
    setPool(shuffle(target));
    setBuilt([]);
    setMistakes(0);
  }

  return (
    <div className="game">
      <div className="game-title">Italian Phrase Builder</div>
      <p className="game-q">Tap tokens to build the phrase in the correct order.</p>

      <div className="phraseBuilt mono">{built.join(" ") || "—"}</div>

      <div className="tokens">
        {pool.map((t) => (
          <button key={t} className="chipbtn" disabled={locked} onClick={() => pick(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="row">
        <button className="ghost-btn" disabled={locked} onClick={reset}>Reset</button>
        {!locked && mistakes > 0 && <div className="hint warn">Mistakes: {mistakes}</div>}
      </div>

      <div className="hint muted">
        Meaning: “Good morning! How are you?”
      </div>
    </div>
  );
}

/** GAME 9: Rhythm tap */
function RhythmTap({ locked, onSolved }) {
  // Player taps to a simple 4-beat loop; need 8 good taps within window
  const beatMs = 600;
  const [ticks, setTicks] = useState(0);
  const [good, setGood] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const startedAt = useRef(now());
  const lastBeat = useRef(now());

  useEffect(() => {
    if (locked) return;
    const t = setInterval(() => {
      setTicks((x) => x + 1);
    }, beatMs);
    return () => clearInterval(t);
  }, [locked]);

  function tap() {
    if (locked) return;
    const t = now();
    const delta = Math.abs((t - lastBeat.current) % beatMs);
    const window = Math.min(delta, beatMs - delta);
    const ok = window <= 120; // 120ms window
    if (ok) setGood((g) => g + 1);
    else setMistakes((m) => m + 1);
    if (ok && good + 1 >= 8) {
      const seconds = Math.round((now() - startedAt.current) / 1000);
      onSolved({ seconds, mistakes });
    }
  }

  useEffect(() => {
    lastBeat.current = now();
  }, [ticks]);

  return (
    <div className="game">
      <div className="game-title">Market Rhythm</div>
      <p className="game-q">Tap on the beat. Score 8 good taps to win.</p>

      <div className="rhythm">
        <div className={`pulse ${ticks % 2 === 0 ? "on" : ""}`} aria-hidden="true" />
        <button className="btn big" onClick={tap} disabled={locked}>
          {locked ? "Completed" : "TAP"}
        </button>
        <div className="hint muted">Good taps: {good}/8</div>
        {!locked && mistakes > 0 && <div className="hint warn">Off‑beat: {mistakes}</div>}
      </div>
    </div>
  );
}

/** GAME 10: Final code */
function FinalCode({ locked, onSolved, totalSolved }) {
  const [code, setCode] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const startedAt = useRef(now());

  // Final riddle gate: must have 9 solved already, then submit the poster answer.
  function submit() {
    if (locked) return;
    if (totalSolved < 9) {
      setMistakes((m) => m + 1);
      return;
    }

    const normalized = code
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const acceptedAnswers = new Set([
      "ethics and respect",
      "ethics respect",
      "respect and ethics",
      "respect ethics",
    ]);

    if (acceptedAnswers.has(normalized)) {
      const seconds = Math.round((now() - startedAt.current) / 1000);
      onSolved({ seconds, mistakes });
    } else {
      setMistakes((m) => m + 1);
    }
  }

  return (
    <div className="game">
      <div className="game-title">Final Checkpoint</div>
      <p className="game-q">
        Riddle: "Two words guide this quest: one keeps us fair, one keeps us kind."
        <br />
        If you’ve completed the other locations, enter the answer from the poster:
      </p>

      <div className="row">
        <input
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter riddle answer"
          disabled={locked}
          aria-label="Final code input"
        />
        <button className="btn" onClick={submit} disabled={locked}>
          {locked ? "Completed" : "Submit"}
        </button>
      </div>

      {totalSolved < 9 && !locked && (
        <div className="hint warn">
          You need the other 9 locations first. Current: {totalSolved}/10
        </div>
      )}

      {!locked && mistakes > 0 && <div className="hint warn">Attempts: {mistakes}</div>}

      <div className="hint muted">
        Tip: This last step keeps things fair for the live event.
      </div>
    </div>
  );
}
function GameRenderer({ loc, locked, onSolved, totalSolved }) {
  const t = loc.game?.type;

  if (t === "quiz") return <QuizGame locked={locked} onSolved={onSolved} />;
  if (t === "wordScramble") return <WordScramble locked={locked} onSolved={onSolved} word={loc.game.word} />;
  if (t === "pathTap") return <PathTap locked={locked} onSolved={onSolved} />;
  if (t === "patternMemory") return <PatternMemory locked={locked} onSolved={onSolved} />;
  if (t === "dragBuild") return <DragBuild locked={locked} onSolved={onSolved} />;
  if (t === "ingredientMatch") return <IngredientMatch locked={locked} onSolved={onSolved} />;
  if (t === "tiltBalance") return <TiltBalance locked={locked} onSolved={onSolved} />;
  if (t === "phraseOrder") return <PhraseOrder locked={locked} onSolved={onSolved} />;
  if (t === "rhythmTap") return <RhythmTap locked={locked} onSolved={onSolved} />;
  if (t === "finalCode") return <FinalCode locked={locked} onSolved={onSolved} totalSolved={totalSolved} />;
  return <div className="hint">Game missing.</div>;
}

export default function LocationPage({ state, setState, onToast }) {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = getLocationById(id);

  const solved = state.solved || {};
  const isDone = !!solved?.[Number(id)];
  const totalSolved = Object.keys(solved).length;

  const title = loc ? `${loc.city} • #${loc.id}` : "Unknown location";

  const lockedMsg = "Completed! You can revisit this page anytime, but scoring is locked.";

  function markSolved({ seconds, mistakes }) {
    if (!loc) return;
    if (isDone) {
      onToast?.("Already completed — scoring is locked.", "warn");
      return;
    }

    const points = computePoints({ base: 100, seconds, mistakes });
    setState((s) => {
      const nextSolved = { ...(s.solved || {}) };
      nextSolved[loc.id] = { solvedAt: Date.now(), points };
      const nextTotal = Object.values(nextSolved).reduce((a, x) => a + (x?.points || 0), 0);
      const unlocked = Object.keys(nextSolved).length === LOCATIONS.length;
      return {
        ...s,
        solved: nextSolved,
        totalPoints: nextTotal,
        achievementUnlocked: unlocked,
      };
    });

    onToast?.(`Location #${loc.id} completed (+${points} pts).`, "ok");
    setTimeout(() => {
      const nextSolvedCount = Object.keys((state.solved || {})).length + 1;
      if (nextSolvedCount === LOCATIONS.length) nav("/certificate");
    }, 600);
  }

  if (!loc) {
    return (
      <div className="stack">
        <Card title="Location not found" sub="This QR code may be incorrect.">
          <Link to="/" className="btn">Back Home</Link>
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
          <span className="crumb">{title}</span>
        </div>
        <div className="head-row">
          <h1 className="h1">{loc.city}</h1>
          <div className="head-badges">
            <span className="chip strong">#{loc.id}</span>
            <span className="chip">{loc.region}</span>
            {isDone ? <span className="chip ok">Found</span> : <span className="chip">Not found</span>}
          </div>
        </div>
      </section>

      <Card
        title="Italy Fact"
        sub={loc.fact}
        right={isDone ? <span className="chip ok">Unlocked</span> : <span className="chip strong">Play to unlock</span>}
      >
        <div className="ethics-note">
          <strong>Ethics & Respect:</strong> {loc.ethics}
        </div>
      </Card>

      <Card title="Mini‑Game" sub={isDone ? lockedMsg : "Finish once to score points and mark this location as found."}>
        <GameRenderer loc={loc} locked={isDone} onSolved={markSolved} totalSolved={totalSolved} />
      </Card>

      <Card title="Quick Watch" sub="Optional: short video (under ~3 minutes).">
        <YouTubeEmbed videoId={loc.video.id} title={loc.video.title} />
        <div className="hint muted">If your venue Wi‑Fi is limited, you can replace these with offline facts only.</div>
      </Card>

      <div className="row spread">
        <Link to="/" className="ghost-btn">Back</Link>
        <Link to="/leaderboard" className="ghost-btn">Leaderboard</Link>
      </div>

      <motion.div
        className="next-strip"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="next-strip-inner">
          <div className="muted">Tip:</div>
          <div>Place QR codes beside props or signs to pull people across the space.</div>
        </div>
      </motion.div>
    </div>
  );
}











