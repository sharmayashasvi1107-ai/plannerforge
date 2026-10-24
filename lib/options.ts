// lib/options.ts
// The "menu" the AI picks from, plus a safe default theme.
import type { BodyFont, CoverScene, CoverStyle, HeadingFont, MotifId, Theme } from "./types";

export const HEADING_FONTS: HeadingFont[] = ["Cormorant", "Playfair", "DMSerif"];
export const BODY_FONTS: BodyFont[] = ["DMSans", "Lora", "Nunito"];
export const MOTIFS: MotifId[] = [
  "star", "moon", "sparkle", "sun", "cloud", "leaf",
  "flower", "branch", "wave", "heart", "dot", "diamond",
];

// The cover pictures the AI can choose from
export const COVER_SCENES: CoverScene[] = ["skyline", "botanical", "celestial", "waves", "mountains", "confetti", "geometric"];

// The cover choices on screen 2
export const COVER_STYLES: { id: CoverStyle; name: string; note: string; premium?: boolean }[] = [
  { id: "solid", name: "Solid color", note: "One rich color from your images, with a fine frame." },
  { id: "multi", name: "Multicolor", note: "A colorful drawn scene that matches your images." },
  { id: "ai", name: "AI painting", note: "A one-of-a-kind cover painted by AI from your images.", premium: true },
];

// Friendly font names shown on screen 3
export const FONT_LABELS: Record<string, string> = {
  Cormorant: "Cormorant · elegant serif",
  Playfair: "Playfair · bold magazine style",
  DMSerif: "DM Serif · chunky and playful",
  DMSans: "DM Sans · clean and modern",
  Lora: "Lora · bookish and warm",
  Nunito: "Nunito · soft and rounded",
};

// Used when something is missing or the AI is unavailable
export const DEFAULT_THEME: Theme = {
  name: "Quiet Sage",
  mood: "Calm, airy and grounded.",
  palette: {
    paper: "#FBFAF6",
    ink: "#2F3B45",
    primary: "#56695B",
    secondary: "#E7EBE5",
    accent: "#B38B4D",
    line: "#D9D6CE",
  },
  headingFont: "Cormorant",
  bodyFont: "DMSans",
  motifs: ["leaf", "dot"],
  density: "balanced",
  headerStyle: "underline",
  corners: "round",
  coverTagline: "Plan gently, live fully",
  coverScene: "botanical",
  coverBackground: "color",
  coverArt: "",
};