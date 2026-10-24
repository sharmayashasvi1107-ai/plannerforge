// lib/templates.ts
// The ready-made planner templates (like templates in Canva).
// Each one decides which pages go in, and how many, based on the length chosen.
import type { Months, PageType, TemplateId } from "./types";

export const TEMPLATES: { id: TemplateId; name: string; description: string; includes: string }[] = [
  {
    id: "student",
    name: "Student",
    description: "Stay on top of classes and deadlines.",
    includes: "Monthly calendars · weekly pages · habit trackers · to-do lists · notes",
  },
  {
    id: "wellness",
    name: "Wellness",
    description: "Gentle days, healthy habits.",
    includes: "Monthly calendars · 30 daily pages · habit trackers · notes",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Plan the week, own the day.",
    includes: "Monthly calendars · weekly pages · 14 daily pages · to-do lists",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Calendars and space to think.",
    includes: "Monthly calendars · lined notes · dot grid · blank pages",
  },
];

export const LENGTHS: Months[] = [3, 6, 12];

// How many of each page type a template gets for a given number of months
export function pageCounts(template: TemplateId, months: Months): Record<PageType, number> {
  const weeks = Math.round(months * 4.35); // about 4.35 weeks in a month
  const none = { cover: 1, monthly: 0, weekly: 0, daily: 0, habit: 0, todo: 0, lined: 0, dotgrid: 0, blank: 0, back: 1 };

  if (template === "student") {
    return { ...none, monthly: months, weekly: weeks, habit: months, todo: Math.ceil(months / 2), lined: months };
  }
  if (template === "wellness") {
    return { ...none, monthly: months, daily: 30, habit: months, lined: Math.ceil(months / 2) };
  }
  if (template === "productivity") {
    return { ...none, monthly: months, weekly: weeks, daily: 14, todo: months };
  }
  // minimal
  return { ...none, monthly: months, lined: months * 2, dotgrid: months * 2, blank: 4 };
}

// Total number of pages, for showing "about 64 pages"
export function totalPages(template: TemplateId, months: Months) {
  return Object.values(pageCounts(template, months)).reduce((a, b) => a + b, 0);
}