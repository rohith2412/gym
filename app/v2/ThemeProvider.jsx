"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * v2's own dark/light state -- separate from v1's OS-preference-only
 * approach. Persisted to localStorage, toggled from the Profile page,
 * applied via a `data-v2-theme` attribute the `dark:` variant in
 * globals.css keys off (see the @custom-variant rule there).
 *
 * Known simplification: theme is read from localStorage in an effect
 * (client-only), so a fresh page load briefly renders the default
 * ("dark") before correcting. Fine for now; fixable later with a
 * blocking inline script in the head if the flash becomes annoying.
 */

const STORAGE_KEY = "v2-theme";
const ThemeContext = createContext({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setThemeState(stored);
  }, []);

  const setTheme = (next) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-v2-theme={theme} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useV2Theme() {
  return useContext(ThemeContext);
}
