import React, { useEffect, useState } from "react";

export default function ThemeToggle({ onToggle }) {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.dataset.theme || localStorage.getItem("italy_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("italy_theme", theme);
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        onToggle?.(next);
      }}
      aria-label="Toggle light/dark theme"
      title="Toggle theme"
    >
      <span className="theme-dot" aria-hidden="true" />
      <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
