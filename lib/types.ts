// lib/types.ts
// The "shapes" of our data. TypeScript uses these to catch typos for you.

// One uploaded reference image (the file itself is stored separately, see images.ts)
export interface MoodImage {
  id: string; // a random unique id
  name: string; // the original file name, e.g. "sky.jpg"
}

// The fonts and decorations the AI is allowed to choose from
export type HeadingFont = "Cormorant" | "Playfair" | "DMSerif";
export type BodyFont = "DMSans" | "Lora" | "Nunito";
export type MotifId =
  | "star" | "moon" | "sparkle" | "sun" | "cloud" | "leaf"
  | "flower" | "branch" | "wave" | "heart" | "dot" | "diamond";

// The big picture drawn on the front and back covers
export type CoverScene = "skyline" | "botanical" | "celestial" | "waves" | "mountains" | "confetti" | "geometric";

// 6 colors used on every planner page
export interface Palette {
  paper: string; // page background (always light, because it gets printed)
  ink: string; // main text (dark)
  primary: string; // headers and banners
  secondary: string; // soft fills for boxes
  accent: string; // small highlights and decorations
  line: string; // grid and ruling lines
}

// The full design the AI returns
export interface Theme {
  name: string; // e.g. "Midnight Watercolor"
  mood: string; // one sentence about the vibe
  palette: Palette;
  headingFont: HeadingFont;
  bodyFont: BodyFont;
  motifs: MotifId[]; // 1 to 4 decorations
  density: "minimal" | "balanced" | "rich"; // how many decorations
  headerStyle: "banner" | "underline" | "boxed";
  corners: "round" | "square";
  coverTagline: string; // short line on the cover
  coverScene: CoverScene; // the picture on the front and back covers
  coverBackground: "dark" | "color" | "light"; // how bold the cover background is
  coverArt: string; // the AI's description of a cover painting (sent to the image AI)
  coverImage?: string; // the painted cover itself, as a data URL (missing = draw the scene instead)
}

// The page types a planner can contain
export type PageType =
  | "cover" | "monthly" | "weekly" | "daily" | "habit"
  | "todo" | "lined" | "dotgrid" | "blank" | "back";

export type SizeId = "a4" | "letter" | "tablet";
export type TemplateId = "student" | "wellness" | "productivity" | "minimal";
export type Months = 3 | 6 | 12;

// How the front and back covers look (chosen on screen 2)
export type CoverStyle = "solid" | "multi" | "ai";

// The user's choices on screen 2
export interface Format {
  template: TemplateId;
  months: Months; // how long the planner lasts
  size: SizeId;
  startMonth: string; // like "2026-11"
  weekStart: "mon" | "sun";
  cover: CoverStyle; // plain color, colorful drawing, or AI painting
  quotes: boolean; // a motivational line at the bottom of some pages
}