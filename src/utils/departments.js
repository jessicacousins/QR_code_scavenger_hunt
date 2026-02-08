export const DEPARTMENTS = [
  "Admin",
  "Clinical",
  "Day Services",
  "Residential",
  "Vanway",
  "LARE",
];

export function normalizeDept(v) {
  const s = String(v || "").trim().toLowerCase();
  const found = DEPARTMENTS.find((d) => d.toLowerCase() === s);
  return found || "";
}
