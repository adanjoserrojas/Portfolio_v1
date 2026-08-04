/**
 * Theme resolution — §4.1.
 *
 * "next-themes (or an equivalent ~2KB implementation) with an inline blocking
 *  script in <head> to set the class before paint — no flash of wrong theme.
 *  Default to system."
 *
 * This is the equivalent implementation: ~700 bytes minified, no dependency.
 */

export const THEME_KEY = "theme";

/**
 * Runs synchronously in <head>, before first paint. Reads the stored choice
 * (or falls back to the system preference) and stamps [data-theme] on <html>
 * so the correct tokens are already resolved when the body renders.
 *
 * Wrapped in try/catch because localStorage throws in some privacy modes —
 * and a theme preference is never worth a blank page.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=s==="light"||s==="dark"?s:(d?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})()`;

export type Theme = "light" | "dark";

export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Preference simply will not persist. Not worth surfacing.
  }
}
