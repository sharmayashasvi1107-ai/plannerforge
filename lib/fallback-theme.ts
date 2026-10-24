// lib/fallback-theme.ts
// Plan B when the AI is unavailable: take the colors straight from the image.
import { extractColors } from "extract-colors";
import { DEFAULT_THEME } from "./options";
import { fixTheme, mix } from "./theme-schema";
import type { Theme } from "./types";

export async function fallbackTheme(imageUrl: string, planName: string): Promise<Theme> {
  const colors = await extractColors(imageUrl, { pixels: 20000, distance: 0.18 });
  if (!colors.length) return { ...DEFAULT_THEME };

  const byArea = [...colors].sort((a, b) => b.area - a.area); // most common first
  const byLight = [...colors].sort((a, b) => a.lightness - b.lightness); // darkest first
  const byColorful = [...colors].sort((a, b) => b.saturation - a.saturation); // most colorful first
  const darkest = byLight[0].hex;
  const lightest = byLight[byLight.length - 1].hex;
  const main = byArea.find((c) => c.lightness < 0.7)?.hex ?? darkest;

  return fixTheme({
    ...DEFAULT_THEME,
    name: planName || "My Moodboard",
    mood: "Colors taken straight from your images.",
    coverBackground: byArea[0].lightness < 0.35 ? "dark" : "color",
    coverScene: byArea[0].lightness < 0.35 ? "celestial" : "geometric",
    palette: {
      paper: mix(lightest, "#FFFFFF", 0.75),
      ink: mix(darkest, "#000000", 0.5),
      primary: main,
      secondary: mix(byArea[1]?.hex ?? lightest, "#FFFFFF", 0.75),
      accent: byColorful[0].hex,
      line: mix(darkest, "#FFFFFF", 0.75),
    },
  });
}