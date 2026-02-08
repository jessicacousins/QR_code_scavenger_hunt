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
  const stages = [
    {
      title: "Foundation Ring",
      fact: "Roman builders started with a massive elliptical foundation to distribute weight evenly.",
      correct: "Travertine stone foundation",
      options: ["Travertine stone foundation", "Wooden scaffolding", "Clay roof tiles"],
      visual: "Base"
    },
    {
      title: "Outer Arches",
      fact: "The exterior arcades used repeating arches to create strength and fast crowd flow.",
      correct: "Three tiers of arches",
      options: ["Three tiers of arches", "Glass curtain wall", "Single solid wall"],
      visual: "Arches"
    },
    {
      title: "Seating Tiers",
      fact: "Seating was organized in levels, showing Roman engineering and social structure.",
      correct: "Tiered stone seating",
      options: ["Tiered stone seating", "Floating platforms", "Underground benches"],
      visual: "Seating"
    },
    {
      title: "Arena Systems",
      fact: "Below the arena, rooms and passages supported events with lifts and moving scenery.",
      correct: "Underground chambers",
      options: ["Underground chambers", "Waterfall tunnels", "Bronze mirrors"],
      visual: "Arena"
    },
    {
      title: "Shade and Spectacle",
      fact: "A retractable canopy called the velarium helped shield spectators from sun.",
      correct: "Velarium canopy",
      options: ["Velarium canopy", "Marble dome", "Iron skylight"],
      visual: "Canopy"
    },
  ];

  const [stageIdx, setStageIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");
  const startedAt = useRef(now());
  const solvedRef = useRef(false);

  const doneCount = Math.min(stageIdx, stages.length);
  const current = stageIdx < stages.length ? stages[stageIdx] : null;

  useEffect(() => {
    if (locked || solvedRef.current) return;
    if (stageIdx >= stages.length) {
      solvedRef.current = true;
      const seconds = Math.round((now() - startedAt.current) / 1000);
      onSolved({ seconds, mistakes });
    }
  }, [stageIdx, locked, mistakes]); // eslint-disable-line

  function choose(option) {
    if (locked || !current) return;
    if (option === current.correct) {
      setFeedback("Correct piece added.");
      setStageIdx((i) => i + 1);
    } else {
      setMistakes((m) => m + 1);
      setFeedback("Not quite. Try another piece.");
    }
  }

  function restart() {
    if (locked) return;
    startedAt.current = now();
    solvedRef.current = false;
    setStageIdx(0);
    setMistakes(0);
    setFeedback("");
  }

  return (
    <div className="game">
      <div className="game-title">Build the Colosseum</div>
      <p className="game-q">
        Complete 5 construction stages. Pick the correct element each round to finish the Rome challenge.
      </p>

      <div className="hint muted">
        Stage {Math.min(stageIdx + 1, stages.length)}/{stages.length} | Built: {doneCount}/5 | Misses: {mistakes}
      </div>

      <div className="colosseum-stack" aria-label="Colosseum build progress">
        {stages.map((s, i) => (
          <div key={s.title} className={`colosseum-layer ${i < doneCount ? "done" : ""}`}>
            <span className="mono">{i < doneCount ? "[X]" : "[ ]"}</span>
            <span>{s.visual}</span>
          </div>
        ))}
      </div>

      {current ? (
        <div className="colosseum-panel">
          <div className="colosseum-stage">{current.title}</div>
          <p className="game-q">{current.fact}</p>

          <div className="choice-grid">
            {current.options.map((option) => (
              <button key={option} className="opt" onClick={() => choose(option)} disabled={locked}>
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="hint muted">Colosseum complete. Rome unlocked.</div>
      )}

      {!!feedback && !locked && <div className="hint muted">{feedback}</div>}

      {!locked && <button className="ghost-btn" onClick={restart}>Restart Build</button>}
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
  const [seq, setSeq] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const startedAt = useRef(now());

  function tap(i) {
    if (locked) return;
    const nextIndex = seq.length;
    if (i === path[nextIndex]) {
      const n = [...seq, i];
      setSeq(n);
      if (n.length === path.length) {
        const seconds = Math.round((now() - startedAt.current) / 1000);
        onSolved({ seconds, mistakes });
      }
    } else {
      setMistakes((m) => m + 1);
      setSeq([]);
    }
  }

  return (
    <div className="game">
      <div className="game-title">Canal Navigation</div>
      <p className="game-q">
        Tap the tiles to guide your boat from start → finish. Wrong tile resets.
      </p>
      <div className="grid3">
        {Array.from({ length: 9 }).map((_, i) => {
          const isIn = seq.includes(i);
          const isStart = i === path[0];
          const isEnd = i === path[path.length - 1];
          return (
            <button
              key={i}
              className={`gridcell ${isIn ? "on" : ""} ${isStart ? "start" : ""} ${isEnd ? "end" : ""}`}
              onClick={() => tap(i)}
              disabled={locked}
              aria-label={`Tile ${i + 1}`}
            >
              {isStart ? "S" : isEnd ? "F" : ""}
            </button>
          );
        })}
      </div>
      <div className="hint muted">Progress: {seq.length}/{path.length}</div>
      {!locked && mistakes > 0 && <div className="hint warn">Resets: {mistakes}</div>}
      <button className="btn" disabled={locked} onClick={() => setSeq([])}>
        Reset
      </button>
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







