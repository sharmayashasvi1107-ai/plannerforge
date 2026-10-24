// lib/planner/pages.ts
// The 9 planner page designs. Each function returns one page as SVG text.
// Recipe for every page: draw the header -> get the y where content starts -> fill the space below.
import {
  type Ctx, DAY_LONG, DAY_SHORT, MONTHS, addDays, box, checkbox, circle, daysInMonth,
  header, line, page, shortDate, text,
} from "./common";
import { mix } from "../theme-schema";

// ---------- 1. FRONT + BACK COVER ----------
// The covers have their own file (covers.ts) because they draw colorful scenes.
export { frontCover as cover, backCover } from "./covers";

// ---------- 2. MONTHLY CALENDAR ----------
export function monthly(ctx: Ctx, year: number, month: number) {
  const { w, h, m, theme } = ctx;
  const P = theme.palette;
  const top = header(ctx, MONTHS[month], String(year));
  let out = top.svg;

  // Day names across the top (Mon..Sun or Sun..Sat)
  const dayNames = ctx.weekStart === "mon" ? [...DAY_SHORT.slice(1), DAY_SHORT[0]] : DAY_SHORT;
  const cellW = (w - 2 * m) / 7;
  dayNames.forEach((d, i) => {
    out += text(ctx, m + cellW * i + cellW / 2, top.y + 4, d.toUpperCase(), { size: 8.5, bold: true, color: P.primary, align: "middle" });
  });

  // 6 rows x 7 columns of boxes
  const gridTop = top.y + 14;
  const cellH = (h - m - gridTop) / 6;
  const firstDay = new Date(year, month, 1).getDay();
  const offset = ctx.weekStart === "mon" ? (firstDay + 6) % 7 : firstDay;
  const total = daysInMonth(year, month);
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const x = m + col * cellW;
      const y = gridTop + row * cellH;
      const day = row * 7 + col - offset + 1;
      const weekend = ctx.weekStart === "mon" ? col >= 5 : col === 0 || col === 6;
      out += box(ctx, x, y, cellW, cellH, { stroke: P.line, fill: weekend ? P.secondary : "none", radius: 0 });
      if (day >= 1 && day <= total) out += text(ctx, x + 6, y + 14, String(day), { size: 10 });
    }
  }
  return page(ctx, out);
}

// ---------- 3. WEEKLY (7 day boxes + a notes box) ----------
export function weekly(ctx: Ctx, start: Date) {
  const { w, h, m, theme } = ctx;
  const P = theme.palette;
  const top = header(ctx, "This week", `${shortDate(start)} – ${shortDate(addDays(start, 6))}`);
  let out = top.svg;

  const wide = w > h; // tablet pages are wider than tall
  const cols = wide ? 4 : 2;
  const rows = wide ? 2 : 4;
  const gap = 10;
  const boxW = (w - 2 * m - gap * (cols - 1)) / cols;
  const boxH = (h - m - top.y - gap * (rows - 1)) / rows;

  for (let i = 0; i < 8; i++) {
    const x = m + (i % cols) * (boxW + gap);
    const y = top.y + Math.floor(i / cols) * (boxH + gap);
    const d = addDays(start, i);
    const label = i < 7 ? `${DAY_SHORT[d.getDay()]} ${d.getDate()}` : "Notes";
    out += box(ctx, x, y, boxW, boxH, { stroke: P.line });
    out += box(ctx, x, y, boxW, 22, { fill: P.secondary });
    out += text(ctx, x + 10, y + 15, label.toUpperCase(), { size: 9, bold: true, color: P.primary });
    for (let ly = y + 42; ly < y + boxH - 8; ly += 18) out += line(x + 10, ly, x + boxW - 10, ly, P.line, 0.5);
  }
  return page(ctx, out);
}

// ---------- 4. DAILY ----------
export function daily(ctx: Ctx, d: Date) {
  const { w, h, m, theme } = ctx;
  const P = theme.palette;
  const top = header(ctx, DAY_LONG[d.getDay()], `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
  let out = top.svg;
  const leftW = (w - 2 * m) * 0.55;
  const rightX = m + leftW + 18;
  const rightW = w - m - rightX;
  const bottom = h - m;

  // Left: hourly schedule, 6am to 9pm
  out += text(ctx, m, top.y + 4, "SCHEDULE", { size: 9, bold: true, color: P.primary });
  const hours = 16;
  const rowH = (bottom - top.y - 16) / hours;
  for (let i = 0; i < hours; i++) {
    const y = top.y + 16 + i * rowH;
    const hour = 6 + i;
    out += text(ctx, m, y + 12, `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`, { size: 8 });
    out += line(m + 34, y + rowH, m + leftW, y + rowH, P.line, 0.5);
  }

  // Right: Top 3, To do, Notes
  let y = top.y + 4;
  const block = (title: string, count: number, withBoxes: boolean) => {
    out += text(ctx, rightX, y, title, { size: 9, bold: true, color: P.primary });
    y += 14;
    for (let i = 0; i < count && y < bottom - 10; i++) {
      if (withBoxes) out += checkbox(ctx, rightX, y + 4);
      out += line(rightX + (withBoxes ? 16 : 0), y + 14, rightX + rightW, y + 14, P.line, 0.5);
      y += 22;
    }
    y += 12;
  };
  block("TOP 3", 3, true);
  block("TO DO", 6, true);
  block("NOTES", 40, false);
  return page(ctx, out);
}

// ---------- 5. HABIT TRACKER (one month) ----------
export function habit(ctx: Ctx, year: number, month: number) {
  const { w, h, m, theme } = ctx;
  const P = theme.palette;
  const top = header(ctx, "Habit tracker", `${MONTHS[month]} ${year}`);
  let out = top.svg;
  const days = daysInMonth(year, month);
  const nameW = (w - 2 * m) * 0.26; // space on the left to write the habit
  const colW = (w - 2 * m - nameW) / days;
  const gridTop = top.y + 16;
  const rows = 12;
  const rowH = Math.min(30, (h - m - gridTop) / rows);

  out += text(ctx, m, gridTop - 4, "HABIT", { size: 8, bold: true, color: P.primary });
  for (let day = 1; day <= days; day++) {
    out += text(ctx, m + nameW + colW * (day - 0.5), gridTop - 4, String(day), { size: 6.5, align: "middle" });
  }
  for (let r = 0; r < rows; r++) {
    const y = gridTop + r * rowH;
    out += line(m, y + rowH, m + nameW - 8, y + rowH, P.line, 0.5);
    for (let day = 0; day < days; day++) {
      out += circle(m + nameW + colW * (day + 0.5), y + rowH / 2, Math.min(colW, rowH) * 0.32, "none", P.line);
    }
  }
  return page(ctx, out);
}

// ---------- 6. TO-DO LIST ----------
export function todo(ctx: Ctx) {
  const { w, h, m, theme } = ctx;
  const top = header(ctx, "To do");
  let out = top.svg;
  const gap = 20;
  const colW = (w - 2 * m - gap) / 2;
  for (let c = 0; c < 2; c++) {
    const x = m + c * (colW + gap);
    for (let y = top.y; y < h - m - 16; y += 24) {
      out += checkbox(ctx, x, y + 4);
      out += line(x + 16, y + 14, x + colW, y + 14, theme.palette.line, 0.5);
    }
  }
  return page(ctx, out);
}

// ---------- 7. LINED NOTES ----------
export function lined(ctx: Ctx) {
  const { w, h, m, theme } = ctx;
  const top = header(ctx, "Notes");
  let out = top.svg;
  for (let y = top.y + 10; y < h - m; y += 22) out += line(m, y, w - m, y, theme.palette.line, 0.5);
  return page(ctx, out);
}

// ---------- 8. DOT GRID ----------
export function dotgrid(ctx: Ctx) {
  const { w, h, m, theme } = ctx;
  const top = header(ctx, "Notes");
  const dotColor = mix(theme.palette.line, theme.palette.ink, 0.3);
  let out = top.svg;
  for (let y = top.y + 8; y < h - m; y += 18) {
    for (let x = m; x <= w - m; x += 18) out += circle(x, y, 0.9, dotColor);
  }
  return page(ctx, out);
}

// ---------- 9. BLANK ----------
export function blank(ctx: Ctx) {
  const { w, h, m, theme } = ctx;
  return page(ctx, box(ctx, m, m, w - 2 * m, h - 2 * m, { stroke: theme.palette.line }));
}