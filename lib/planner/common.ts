
// lib/planner/common.ts
// The toolbox every planner page uses: page sizes, dates, and small drawing helpers.
// All sizes are in "points" (1 point = 1/72 inch), the unit PDFs use.
import type { CoverStyle, SizeId, Theme } from "../types";
import { MOTIF_PATHS } from "./motifs";
import { mix, textOn } from "../theme-schema";

// ---------- page sizes ----------
export const SIZES: Record<SizeId, { w: number; h: number; label: string }> = {
  a4: { w: 595.28, h: 841.89, label: "A4" },
  letter: { w: 612, h: 792, label: "US Letter" },
  tablet: { w: 1024, h: 768, label: "Tablet" },
};

// Everything a page needs to know to draw itself
export interface Ctx {
  theme: Theme;
  w: number; // page width
  h: number; // page height
  m: number; // margin (empty space around the edge)
  seed: number; // makes the decorations the same every time
  weekStart: "mon" | "sun";
  cover?: CoverStyle; //how the covers look
quote?: string; //a line for bottom
}

export function makeCtx(theme: Theme, size: SizeId, seed: number, weekStart: "mon" | "sun"): Ctx {
  const { w, h } = SIZES[size];
  return { theme, w, h, m: Math.round(Math.min(w, h) * 0.07), seed, weekStart };
}

// ---------- dates ----------
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH_SHORT = MONTHS.map((x) => x.slice(0, 3));
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_SHORT = DAY_LONG.map((x) => x.slice(0, 3));
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
export const shortDate = (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;

// ---------- "random" numbers that are the same every time for the same seed ----------
export function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- drawing helpers (each returns a piece of SVG text) ----------
// Makes text safe to put inside SVG (so "&" or "<" in a name can't break the page)
export const safe = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r2 = (v: number) => +v.toFixed(2); // round to keep files small

type TextOptions = { size?: number; heading?: boolean; bold?: boolean; color?: string; align?: "start" | "middle" | "end" };

// Words on the page
export function text(ctx: Ctx, x: number, y: number, words: string, o: TextOptions = {}) {
  const font = o.heading ? ctx.theme.headingFont : ctx.theme.bodyFont;
  return `<text x="${r2(x)}" y="${r2(y)}" font-family="${font}" font-size="${o.size ?? 11}" font-weight="${o.bold ? "bold" : "normal"}" fill="${o.color ?? ctx.theme.palette.ink}" text-anchor="${o.align ?? "start"}">${safe(words)}</text>`;
}

type BoxOptions = { fill?: string; stroke?: string; width?: number; radius?: number };

// A rectangle (box)
export function box(ctx: Ctx, x: number, y: number, w: number, h: number, o: BoxOptions = {}) {
  const radius = o.radius ?? (ctx.theme.corners === "round" ? 8 : 0);
  return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${radius}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.width ?? 0.75}"/>`;
}

// A straight line
export function line(x1: number, y1: number, x2: number, y2: number, color: string, width = 0.6) {
  return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${color}" stroke-width="${width}"/>`;
}

// A circle
export function circle(cx: number, cy: number, r: number, fill: string, stroke = "none", width = 0.6) {
  return `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
}

// A small empty tick box
export function checkbox(ctx: Ctx, x: number, y: number, size = 9) {
  return box(ctx, x, y, size, size, { stroke: ctx.theme.palette.primary, width: 0.8, radius: ctx.theme.corners === "round" ? 2 : 0 });
}

// The page title at the top. Returns the drawing AND the y where content can start.
export function header(ctx: Ctx, title: string, subtitle?: string) {
  const { w, m, theme } = ctx;
  const P = theme.palette;
  const width = w - 2 * m;

  if (theme.headerStyle === "banner") {
    const fg = textOn(P.primary, P.ink);
    return {
      y: m + 76,
      svg:
        box(ctx, m, m, width, 58, { fill: P.primary }) +
        text(ctx, m + 18, m + 37, title, { size: 24, heading: true, color: fg }) +
        (subtitle ? text(ctx, w - m - 18, m + 35, subtitle, { size: 10, color: fg, align: "end" }) : ""),
    };
  }
  if (theme.headerStyle === "boxed") {
    return {
      y: m + 68,
      svg:
        box(ctx, m, m, width, 50, { stroke: P.primary, width: 1.2 }) +
        text(ctx, w / 2, m + 33, title, { size: 22, heading: true, color: P.primary, align: "middle" }) +
        (subtitle ? text(ctx, w - m - 14, m + 30, subtitle, { size: 9, align: "end" }) : ""),
    };
  }
  // "underline"
  return {
    y: m + 58,
    svg:
      text(ctx, m, m + 28, title, { size: 28, heading: true, color: P.primary }) +
      (subtitle ? text(ctx, w - m, m + 26, subtitle, { size: 10, align: "end" }) : "") +
      line(m, m + 40, w - m, m + 40, P.accent, 1.2),
  };
}

// Little shapes scattered in the side and bottom margins (kept away from the corners)
const HOW_MANY = { minimal: 2, balanced: 5, rich: 9 };
function decorations(ctx: Ctx) {
  const { w, h, m, theme } = ctx;
  const random = seededRandom(ctx.seed);
  let out = "";
  for (let i = 0; i < HOW_MANY[theme.density]; i++) {
    const motif = theme.motifs[i % theme.motifs.length];
    const scale = (0.4 + random() * 0.35) * (m / 24); // fits inside the margin
    const size = 24 * scale;
    // 0 = bottom, 1 = left, 2 = right (no bottom when a quote sits there)
    const side = ctx.quote ? 1 + Math.floor(random() * 2) : Math.floor(random() * 3);
    const x = side === 0 ? 1.4 * m + random() * (w - 2.8 * m - size) : side === 1 ? (m - size) / 2 : w - m + (m - size) / 2;
    const y = side === 0 ? h - m + (m - size) / 2 : m + 80 + random() * (h - 2.4 * m - 80 - size);
    // Slightly softened color so decorations stay gentle but visible
    const color = mix(i % 2 ? theme.palette.accent : theme.palette.primary, theme.palette.paper, 0.25);
    out += `<path d="${MOTIF_PATHS[motif]}" fill="${color}" transform="translate(${r2(x)} ${r2(y)}) scale(${r2(scale)})"/>`;
  }
  return out;
}

// Corner decorations: an L-shaped double line in each corner with a small shape on it
function corners(ctx: Ctx) {
  const { w, h, m, theme } = ctx;
  const P = theme.palette;
  const gap = 0.35 * m; // distance from the paper edge
  const arm = 0.9 * m; // length of each line
  const size = 0.42 * m; // size of the corner shape
  const motif = theme.motifs[0] ?? "sparkle";
  let out = "";
  for (const [cx, cy, dx, dy] of [
    [gap, gap, 1, 1],
    [w - gap, gap, -1, 1],
    [gap, h - gap, 1, -1],
    [w - gap, h - gap, -1, -1],
  ]) {
    for (const [inset, color, width] of [
      [0, P.primary, 1.2],
      [5, P.accent, 0.6],
    ] as const) {
      const x = cx + dx * inset;
      const y = cy + dy * inset;
      out += `<path d="M${r2(x + dx * arm)} ${r2(y)} L${r2(x)} ${r2(y)} L${r2(x)} ${r2(y + dy * arm)}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
    }
    out += `<path d="${MOTIF_PATHS[motif]}" fill="${P.accent}" transform="translate(${r2(cx - size / 2)} ${r2(cy - size / 2)}) scale(${r2(size / 24)})"/>`;
  }
  return out;
}

// The motivational line, centered in the bottom margin, between the corner decorations
function quoteLine(ctx: Ctx, quote: string) {
  const { w, h, m, theme } = ctx;
  const P = theme.palette;
  const y = h - m * 0.42;
  return (
    text(ctx, w / 2, y, `“${quote}”`, { size: Math.max(8, m * 0.22), heading: true, color: P.primary, align: "middle" }) +
    line(w / 2 - 14, y - m * 0.36, w / 2 + 14, y - m * 0.36, P.accent, 0.8)
  );
}

// Wraps a page's drawing into a complete SVG.
// Normal pages get the paper color, decorations and corners; covers ask for "plain" and draw their own background.
export function page(ctx: Ctx, inner: string, o: { plain?: boolean } = {}) {
  const { w, h, theme } = ctx;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    (o.plain ? "" : `<rect width="${w}" height="${h}" fill="${theme.palette.paper}"/>` + decorations(ctx) + corners(ctx)) +
    inner +
    (ctx.quote && !o.plain ? quoteLine(ctx, ctx.quote) : "") +
    `</svg>`
  );
}