// lib/planner/build.ts
// Turns the chosen template into a list of real, dated pages.
import type { Format, PageType, Theme } from "../types";
import { MONTHS, MONTH_SHORT, addDays, makeCtx, shortDate } from "./common";
import { pageCounts } from "../templates";
import { QUOTES } from "./quotes";
import { backCover, blank, cover, daily, dotgrid, habit, lined, monthly, todo, weekly } from "./pages";

export interface PageSpec {
  type: PageType;
  label: string; // shown under the thumbnail, like "March 2027"
  svg: string; // the page drawing
}

export function buildPages(theme: Theme, format: Format, title: string): PageSpec[] {
  let seed = 1;
  const ctx = () => ({ ...makeCtx(theme, format.size, seed++ * 7919, format.weekStart), cover: format.cover });
  // Same, plus a motivational line when quotes are switched on (a different one each page)
  let q = 0;
  const quoted = () => ({ ...ctx(), quote: format.quotes ? QUOTES[(q++ * 7) % QUOTES.length] : undefined });

  const [startYear, startMonthNum] = format.startMonth.split("-").map(Number);
  const firstDay = new Date(startYear, startMonthNum - 1, 1);
  const monthAt = (i: number) => {
    const d = new Date(startYear, startMonthNum - 1 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  };
  const c = pageCounts(format.template, format.months);
  const pages: PageSpec[] = [];

  // Cover
  if (c.cover) {
    const last = monthAt(format.months - 1);
    const period = `${MONTH_SHORT[startMonthNum - 1]} ${startYear} – ${MONTH_SHORT[last.month]} ${last.year}`;
    pages.push({ type: "cover", label: "Cover", svg: cover(ctx(), title, period) });
  }
  // Monthly calendars
  for (let i = 0; i < c.monthly; i++) {
    const { year, month } = monthAt(i);
    pages.push({ type: "monthly", label: `${MONTHS[month]} ${year}`, svg: monthly(quoted(), year, month) });
  }
  // Weekly pages: start on the Monday (or Sunday) on or before the 1st
  const weekStartDay = format.weekStart === "mon" ? 1 : 0;
  const firstWeek = addDays(firstDay, -((firstDay.getDay() - weekStartDay + 7) % 7));
  for (let i = 0; i < c.weekly; i++) {
    const d = addDays(firstWeek, i * 7);
    pages.push({ type: "weekly", label: `Week of ${shortDate(d)}`, svg: weekly(quoted(), d) });
  }
  // Daily pages
  for (let i = 0; i < c.daily; i++) {
    const d = addDays(firstDay, i);
    pages.push({ type: "daily", label: shortDate(d), svg: daily(quoted(), d) });
  }
  // Habit trackers, one per month
  for (let i = 0; i < c.habit; i++) {
    const { year, month } = monthAt(i);
    pages.push({ type: "habit", label: `Habits · ${MONTH_SHORT[month]}`, svg: habit(quoted(), year, month) });
  }
  // Simple repeated pages
  const repeat = (type: PageType, label: string, draw: typeof todo) => {
    for (let i = 0; i < c[type]; i++) pages.push({ type, label: `${label} ${i + 1}`, svg: draw(ctx()) });
  };
  for (let i = 0; i < c.todo; i++) pages.push({ type: "todo", label: `To-do ${i + 1}`, svg: todo(quoted()) });
  repeat("lined", "Lined notes", lined);
  repeat("dotgrid", "Dot grid", dotgrid);
  repeat("blank", "Blank", blank);
  // Back cover, always the last page
  if (c.back) pages.push({ type: "back", label: "Back cover", svg: backCover(ctx(), title) });
  return pages;
}