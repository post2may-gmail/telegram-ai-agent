"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { color, shadow, space } from "./theme";

export type ThemeName = "light" | "dark";

const STORAGE_KEY = "theme";

function readTheme(): ThemeName {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(next: ThemeName) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage may be blocked */
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const dark = theme === "dark";

  function toggle() {
    const next: ThemeName = dark ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-switch"
      role="switch"
      aria-checked={dark}
      aria-label="Тема оформления"
      onClick={toggle}
      style={switchBtn}
    >
      {dark ? <IconMoon /> : <IconSun />}
      <span>{dark ? "Тёмная" : "Светлая"}</span>
      <span aria-hidden="true" style={track(dark)}>
        <span style={thumb(dark)} />
      </span>
    </button>
  );
}

const switchBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: space.sm,
  minHeight: 44,
  padding: "8px 12px 8px 10px",
  border: `1px solid ${color.border}`,
  borderRadius: 999,
  background: color.card,
  color: color.foreground,
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  boxShadow: shadow.sm,
  transition: "background 200ms ease, border-color 200ms ease",
};

function track(dark: boolean): CSSProperties {
  return {
    position: "relative",
    width: 44,
    height: 24,
    borderRadius: 999,
    background: dark ? color.primary : color.muted,
    border: `1px solid ${color.border}`,
    flexShrink: 0,
    transition: "background 200ms ease",
  };
}

function thumb(dark: boolean): CSSProperties {
  return {
    position: "absolute",
    top: 2,
    left: 2,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: color.card,
    boxShadow: shadow.sm,
    transform: dark ? "translateX(20px)" : "translateX(0)",
    transition: "transform 200ms ease",
  };
}

function IconSun() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.5 13A6.5 6.5 0 0 1 11 6.5 7 7 0 1 0 16.5 13Z" />
    </svg>
  );
}
