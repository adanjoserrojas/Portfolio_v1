/**
 * Fonts for the Phase 2 prototypes.
 *
 * All load through next/font/google, which self-hosts and emits
 * `display: swap` automatically — so none of these reproduce the
 * render-blocking `@import` of Inter at app/globals.css:2 (AUDIT.md §6.5).
 *
 * Every argument is a literal: next/font resolves these at build time and
 * rejects spreads, variables, or anything it cannot statically analyse.
 *
 * Whichever direction wins at Gate 2 moves to next/font/local with explicit
 * subsetting at Phase 3 (§3.3). These prototypes are throwaway.
 */
import {
  JetBrains_Mono,
  Public_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Space_Grotesk,
  Newsreader,
  Archivo,
  DM_Sans,
  DM_Mono,
} from "next/font/google";

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
