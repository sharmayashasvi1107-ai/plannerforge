// lib/theme-schema.ts
// Checks whatever the AI sends back and repairs anything missing or unreadable.
// Also has small color helpers used by the page drawings.
import type { Palette, Theme } from "./types";
import { BODY_FONTS, COVER_SCENES, DEFAULT_THEME, HEADING_FONTS, MOTIFS } from "./options";

// ---------- color helpers ----------
const HEX = /^#[0-9a-fA-F]{6}$/;
const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Blend color a toward color b (t = 0 means all a, t = 1 means all b)
export function mix(a: string, b: string, t: number) {
  const A = toRgb(a);
  const B = toRgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("").toUpperCase();
}

// How bright a color is (0 = black, 1 = white)
export function brightness(hex: string) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// How readable two colors are together (1 = invisible, 21 = black on white)
export function contrast(a: string, b: string) {
  const [hi, lo] = [brightness(a), brightness(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// White or dark text, whichever reads better on a colored background
export function textOn(background: string, dark: string) {
  return contrast("#FFFFFF", background) > contrast(dark, background) ? "#FFFFFF" : dark;
}

// ---------- repair ----------
type Loose = Record<string, unknown>;
const text = (v: unknown, fallback: string, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback;
const color = (v: unknown, fallback: string) => (typeof v === "string" && HEX.test(v) ? v.toUpperCase() : fallback);
function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export function fixTheme(raw: unknown): Theme {
  const d = DEFAULT_THEME;
  const r = (raw && typeof raw === "object" ? raw : {}) as Loose;
  const p = (r.palette && typeof r.palette === "object" ? r.palette : {}) as Loose;

  const palette: Palette = {
    paper: color(p.paper, d.palette.paper),
    ink: color(p.ink, d.palette.ink),
    primary: color(p.primary, d.palette.primary),
    secondary: color(p.secondary, d.palette.secondary),
    accent: color(p.accent, d.palette.accent),
    line: color(p.line, d.palette.line),
  };
  // Printing rules: paper must be light and text must be readable
  if (brightness(palette.paper) < 0.8) palette.paper = mix(palette.paper, "#FFFFFF", 0.85);
  if (contrast(palette.ink, palette.paper) < 7) palette.ink = mix(palette.ink, "#000000", 0.6);
  if (contrast(palette.primary, palette.paper) < 3) palette.primary = mix(palette.primary, palette.ink, 0.5);
  if (contrast(palette.line, palette.paper) < 1.3) palette.line = mix(palette.paper, palette.ink, 0.2);
  if (brightness(palette.secondary) < 0.6) palette.secondary = mix(palette.secondary, "#FFFFFF", 0.7);

  const motifs = Array.isArray(r.motifs)
    ? [...new Set(r.motifs.filter((m) => MOTIFS.includes(m)))].slice(0, 4)
    : [];

  return {
    name: text(r.name, d.name, 40),
    mood: text(r.mood, d.mood, 160),
    palette,
    headingFont: oneOf(r.headingFont, HEADING_FONTS, d.headingFont),
    bodyFont: oneOf(r.bodyFont, BODY_FONTS, d.bodyFont),
    motifs: motifs.length ? motifs : d.motifs,
    density: oneOf(r.density, ["minimal", "balanced", "rich"] as const, d.density),
    headerStyle: oneOf(r.headerStyle, ["banner", "underline", "boxed"] as const, d.headerStyle),
    corners: oneOf(r.corners, ["round", "square"] as const, d.corners),
    coverTagline: text(r.coverTagline, d.coverTagline, 48),
    coverScene: oneOf(r.coverScene, COVER_SCENES, d.coverScene),
    coverBackground: oneOf(r.coverBackground, ["dark", "color", "light"] as const, d.coverBackground),
        coverArt: text(r.coverArt, "", 700),
  };
}