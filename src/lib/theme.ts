import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "nls-ai-theme-v1";

/** Only these three strings may come back from localStorage. */
export function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

/** An explicit light/dark choice always beats the OS setting; "system" follows the OS. */
export function resolveTheme(t: Theme, prefersDark: boolean): "light" | "dark" {
  return t === "system" ? (prefersDark ? "dark" : "light") : t;
}

export function loadTheme(): Theme {
  try {
    const s = localStorage.getItem(THEME_KEY);
    if (isTheme(s)) return s;
  } catch {}
  return "system";
}

function prefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Toggles the .dark class that all colour tokens hang off (see src/styles.css). */
export function applyTheme(t: Theme) {
  const dark = resolveTheme(t, prefersDark()) === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function useTheme() {
  // Starts as "system" so server and client markup match; the effect below reads
  // the stored choice and re-applies it (the pre-paint script already did this).
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = loadTheme();
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    setThemeState(t);
    applyTheme(t);
  }, []);

  return { theme, setTheme };
}
