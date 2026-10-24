// lib/planner/covers.ts
// The front and back covers: a colorful background + a picture ("scene") the AI picked.
import { type Ctx, box, circle, page, seededRandom, text } from "./common";
import { MOTIF_PATHS } from "./motifs";
import { brightness, contrast, mix } from "../theme-schema";
import type { MotifId } from "../types";

// ---------- cover colors, worked out from the palette ----------
type CoverColors = {
  bg: string; // main background
  sky: string; // lighter top of the background
  near: string; // shapes in front
  far: string; // shapes behind
  soft: string; // gentle shapes
  glow: string; // lights, stars, flowers
};

function coverColors(ctx: Ctx): CoverColors {
  const P = ctx.theme.palette;
  const style = ctx.theme.coverBackground;
  const bg = style === "dark" ? mix(P.ink, P.primary, 0.35) : style === "color" ? P.primary : mix(P.secondary, P.paper, 0.3);
  const dark = brightness(bg) < 0.3;
  const toward = dark ? "#FFFFFF" : P.ink; // the direction that stands out from the background
  // Light covers use the main color for highlights; others use the bright accent
  const pop = style === "light" ? P.primary : P.accent;
  const glow = contrast(pop, bg) < 2 ? mix(pop, toward, 0.4) : pop;
  return {
    bg,
    sky: mix(bg, toward, 0.12),
    near: dark ? mix(bg, "#000000", 0.45) : mix(bg, P.ink, 0.45),
    far: dark ? mix(bg, "#000000", 0.25) : mix(bg, P.ink, 0.22),
    soft: mix(bg, toward, 0.3),
    glow,
  };
}

// A motif shape placed at (x, y), size in points, optionally turned
function shape(motif: MotifId, x: number, y: number, size: number, color: string, turn = 0) {
  const s = size / 24;
  return `<path d="${MOTIF_PATHS[motif]}" fill="${color}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(0)}) scale(${s.toFixed(3)}) translate(-12 -12)"/>`;
}

// ---------- the 7 scenes ----------
type Scene = (ctx: Ctx, c: CoverColors, random: () => number) => string;

// City at night: stars, a moon, two rows of buildings with lit windows
const skyline: Scene = ({ w, h }, c, random) => {
  const u = w / 600; // scale everything with the page width
  let out = "";
  for (let i = 0; i < 45; i++) out += circle(random() * w, random() * h * 0.5, (0.6 + random() * 1.3) * u, mix(c.glow, c.bg, 0.3));
  out += circle(w * 0.82, h * 0.12, 26 * u, mix(c.glow, "#FFFFFF", 0.5));
  const rows = [
    { color: c.far, min: 0.2, max: 0.38, windows: false },
    { color: c.near, min: 0.09, max: 0.26, windows: true },
  ];
  for (const row of rows) {
    let x = -8 * u;
    while (x < w) {
      const bw = (30 + random() * 44) * u;
      const bh = h * (row.min + random() * (row.max - row.min));
      const top = h - bh;
      out += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${row.color}"/>`;
      if (row.windows) {
        for (let wy = top + 8 * u; wy < h - 12 * u; wy += 13 * u) {
          for (let wx = x + 5 * u; wx < x + bw - 8 * u; wx += 10 * u) {
            if (random() < 0.35) out += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${(4 * u).toFixed(1)}" height="${(6 * u).toFixed(1)}" fill="${c.glow}"/>`;
          }
        }
      }
      x += bw + 2 * u;
    }
  }
  return out;
};

// Plants: big leaves growing from the bottom corners, with flowers
const botanical: Scene = ({ w, h }, c, random) => {
  const u = Math.min(w, h) / 600;
  const colors = [c.near, c.far, c.soft];
  let out = "";
  for (const side of [0, 1]) {
    const baseX = side === 0 ? 0 : w;
    for (let i = 0; i < 9; i++) {
      const turn = side === 0 ? -60 + i * 14 + random() * 8 : 60 - i * 14 - random() * 8;
      out += shape("leaf", baseX + (side === 0 ? 1 : -1) * (40 + random() * 90) * u, h - (30 + random() * 120) * u, (120 + random() * 80) * u, colors[i % 3], turn + (side === 0 ? 0 : 180));
    }
    for (let i = 0; i < 4; i++) {
      out += shape("flower", baseX + (side === 0 ? 1 : -1) * (60 + random() * 150) * u, h - (60 + random() * 160) * u, (34 + random() * 22) * u, c.glow, random() * 90);
    }
  }
  return out;
};

// Night sky: a big moon, sparkles everywhere, clouds along the bottom
const celestial: Scene = ({ w, h }, c, random) => {
  const u = Math.min(w, h) / 600;
  let out = "";
  for (let i = 0; i < 60; i++) {
    const big = random() < 0.2;
    out += shape(big ? "sparkle" : "dot", random() * w, random() * h * 0.8, (big ? 14 + random() * 14 : 3 + random() * 4) * u, mix(c.glow, c.bg, random() * 0.4));
  }
  out += shape("moon", w * 0.78, h * 0.13, 150 * u, mix(c.glow, "#FFFFFF", 0.4), -20);
  for (let i = 0; i < 7; i++) out += shape("cloud", (i / 6) * w, h - (40 + random() * 40) * u, (190 + random() * 80) * u, i % 2 ? c.soft : c.far);
  return out;
};

// Sea: layered waves along the bottom and a low sun
const waves: Scene = ({ w, h }, c) => {
  let out = circle(w * 0.7, h * 0.6, Math.min(w, h) * 0.14, c.glow);
  const layers = [c.soft, c.far, mix(c.far, c.near, 0.5), c.near];
  layers.forEach((color, i) => {
    const base = h * (0.62 + i * 0.09);
    const amp = h * 0.018;
    let d = `M0 ${h} L0 ${base.toFixed(1)}`;
    for (let x = 0; x <= w; x += w / 40) d += ` L${x.toFixed(1)} ${(base + Math.sin((x / w) * Math.PI * 4 + i) * amp).toFixed(1)}`;
    out += `<path d="${d} L${w} ${h} Z" fill="${color}"/>`;
  });
  return out;
};

// Nature: a sun behind three mountain ranges
const mountains: Scene = ({ w, h }, c, random) => {
  let out = circle(w * 0.66, h * 0.62, Math.min(w, h) * 0.13, c.glow);
  const ranges = [
    { color: c.soft, top: 0.5 },
    { color: c.far, top: 0.62 },
    { color: c.near, top: 0.74 },
  ];
  for (const r of ranges) {
    let d = `M0 ${h}`;
    for (let x = 0; x < w; x += 60 + random() * 80) {
      d += ` L${x.toFixed(1)} ${(h * (r.top + random() * 0.12)).toFixed(1)}`;
    }
    d += ` L${w} ${(h * (r.top + random() * 0.12)).toFixed(1)}`; // finish exactly at the right edge
    out += `<path d="${d} L${w} ${h} Z" fill="${r.color}"/>`;
  }
  return out;
};

// Party: colorful shapes scattered over the whole cover
const confetti: Scene = ({ w, h }, c, random) => {
  const u = Math.min(w, h) / 600;
  const kinds: MotifId[] = ["dot", "diamond", "heart", "star", "sparkle"];
  const colors = [c.glow, c.soft, c.far, mix(c.glow, "#FFFFFF", 0.4)];
  let out = "";
  for (let i = 0; i < 70; i++) {
    out += shape(kinds[i % kinds.length], random() * w, random() * h, (16 + random() * 30) * u, colors[i % colors.length], random() * 360);
  }
  return out;
};

// Modern: big circles and rainbow-like arches
const geometric: Scene = ({ w, h }, c) => {
  const u = Math.min(w, h) / 600;
  let out = circle(w * 0.85, h * 0.1, 110 * u, c.far);
  out += circle(w * 0.12, h * 0.55, 40 * u, c.glow);
  const arch = (cx: number, size: number) => {
    let s = "";
    [c.near, c.glow, c.soft, c.far].forEach((color, i) => {
      const r = size - i * size * 0.22;
      s += `<path d="M${(cx - r).toFixed(1)} ${h} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(cx + r).toFixed(1)} ${h} Z" fill="${color}"/>`;
    });
    return s;
  };
  out += arch(w * 0.25, 190 * u) + arch(w * 0.8, 140 * u);
  return out;
};

const SCENES = { skyline, botanical, celestial, waves, mountains, confetti, geometric };

// Is there an AI painting to show? (only when "AI painting" was chosen on screen 2)
const painted = (ctx: Ctx) => ctx.cover === "ai" && !!ctx.theme.coverImage;

// "Solid color": one rich color, a fine double frame, and a small shape in each corner
function solid(ctx: Ctx, c: CoverColors) {
  const { w, h, theme } = ctx;
  const gap = Math.min(w, h) * 0.05;
  const motif = theme.motifs[0] ?? "sparkle";
  let out = `<rect width="${w}" height="${h}" fill="${c.bg}"/>`;
  out += `<rect x="${gap}" y="${gap}" width="${w - 2 * gap}" height="${h - 2 * gap}" fill="none" stroke="${c.glow}" stroke-width="1.5"/>`;
  out += `<rect x="${gap + 6}" y="${gap + 6}" width="${w - 2 * gap - 12}" height="${h - 2 * gap - 12}" fill="none" stroke="${c.soft}" stroke-width="0.6"/>`;
  for (const [x, y] of [[gap, gap], [w - gap, gap], [gap, h - gap], [w - gap, h - gap]]) {
    out += shape(motif, x, y, gap * 0.9, c.glow);
  }
  return out;
}

// The background for the chosen cover style:
// AI painting (if there is one) -> solid color -> otherwise the colorful drawn scene
function backdrop(ctx: Ctx, c: CoverColors) {
  const { w, h } = ctx;
  if (painted(ctx)) {
    return `<image href="${ctx.theme.coverImage}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
  }
  if (ctx.cover === "solid") return solid(ctx, c);
  const id = `fade${ctx.seed}`;
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky}"/><stop offset="1" stop-color="${c.bg}"/></linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#${id})"/>` +
    (SCENES[ctx.theme.coverScene] ?? geometric)(ctx, c, seededRandom(ctx.seed)) // older saved themes have no scene
  );
}

// Splits a long title into up to 3 lines
function wrapTitle(title: string, maxChars: number) {
  const lines = [""];
  for (const word of title.split(/\s+/)) {
    const current = lines[lines.length - 1];
    if (current && (current + " " + word).length > maxChars) lines.push(word);
    else lines[lines.length - 1] = (current + " " + word).trim();
  }
  return lines.slice(0, 3);
}

// ---------- FRONT COVER ----------
export function frontCover(ctx: Ctx, title: string, period: string) {
  const { w, h, theme } = ctx;
  const P = theme.palette;
  const c = coverColors(ctx);
  const big = Math.min(w, h) * 0.075;

  // Work out where each line goes first, then size the paper-colored label to fit
  const tagSize = Math.max(11, big * 0.3);
  const art = painted(ctx); // on a painting, the label is smaller and higher so the art shows
  const lw = w * (w > h ? (art ? 0.42 : 0.5) : art ? 0.62 : 0.72);
  const lx = (w - lw) / 2;
  const ly = h * (art ? 0.07 : w > h ? 0.14 : 0.17);
  const lines = wrapTitle(title, Math.max(8, Math.floor((lw - 30) / (big * 0.52)))); // as many letters as fit the label
  const titleY = ly + 52 + big * 0.85; // first title line
  const tagY = titleY + (lines.length - 1) * big * 1.1 + tagSize + 14;
  const periodY = tagY + 26;
  const lh = periodY - ly + 22;

  let label = box(ctx, lx, ly, lw, lh, { fill: P.paper, stroke: c.glow, width: 2 });
  label += box(ctx, lx + 7, ly + 7, lw - 14, lh - 14, { stroke: P.line, width: 0.75 });
  label += `<path d="${MOTIF_PATHS[theme.motifs[0] ?? "sparkle"]}" fill="${P.accent}" transform="translate(${w / 2 - 12} ${ly + 22})"/>`;
  lines.forEach((l, i) => {
    label += text(ctx, w / 2, titleY + i * big * 1.1, l, { size: big, heading: true, color: P.primary, align: "middle" });
  });
  label += text(ctx, w / 2, tagY, theme.coverTagline, { size: tagSize, align: "middle" });
  label += text(ctx, w / 2, periodY, period.toUpperCase(), { size: 9, bold: true, color: P.primary, align: "middle" });

  return wrap(ctx, backdrop(ctx, c) + label);
}

// ---------- BACK COVER ----------
export function backCover(ctx: Ctx, title: string) {
  const { w, h, theme } = ctx;
  const P = theme.palette;
  const c = coverColors(ctx);
  const lw = Math.min(w * 0.5, 300);
  const lh = 96;
  const lx = (w - lw) / 2;
  const ly = h * 0.36;
  let label = box(ctx, lx, ly, lw, lh, { fill: P.paper, stroke: c.glow, width: 1.5 });
  label += `<path d="${MOTIF_PATHS[theme.motifs[0] ?? "sparkle"]}" fill="${P.accent}" transform="translate(${w / 2 - 12} ${ly + 14})"/>`;
  label += text(ctx, w / 2, ly + 60, title, { size: 15, heading: true, color: P.primary, align: "middle" });
  label += text(ctx, w / 2, ly + 78, "Designed with PlannerForge", { size: 8, color: P.ink, align: "middle" });
  return wrap(ctx, backdrop(ctx, c) + label);
}

// Covers draw their own background, so they skip the normal page() paper and corners
function wrap(ctx: Ctx, inner: string) {
  return page(ctx, inner, { plain: true });
}