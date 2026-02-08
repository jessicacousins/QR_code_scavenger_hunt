const KEY = "italy_qr_quest_v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function freshState() {
  return {
    profile: { firstName: "", department: "" },
    solved: {}, // { [locId]: { solvedAt, points } }
    totalPoints: 0,
    achievementUnlocked: false,
    submittedAchievement: false, // leaderboard submit guard (local)
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function updateState(updater) {
  const cur = loadState() || freshState();
  const next = typeof updater === "function" ? updater(cur) : updater;
  next.updatedAt = Date.now();
  saveState(next);
  return next;
}

export function resetAll() {
  localStorage.removeItem(KEY);
}
