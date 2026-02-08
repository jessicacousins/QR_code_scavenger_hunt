export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function computePoints({ base = 100, seconds = 60, mistakes = 0 }) {
  // Simple, fair scoring:
  // - base points
  // - faster = more points (up to +40)
  // - mistakes reduce points
  const speedBonus = clamp(Math.round((60 - seconds) * 0.7), 0, 40);
  const mistakePenalty = clamp(mistakes * 12, 0, 80);
  return clamp(base + speedBonus - mistakePenalty, 30, 140);
}
