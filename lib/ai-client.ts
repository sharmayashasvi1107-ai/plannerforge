// lib/ai-client.ts
// The one function screen 3 calls. It asks our server for a theme,
// and if anything goes wrong it builds one from the image colors instead.
import { useStudio } from "./store";
import { imageForAi, loadImage } from "./images";
import { fixTheme } from "./theme-schema";
import { fallbackTheme } from "./fallback-theme";
import type { Theme } from "./types";

type Result = { theme: Theme; source: "ai" | "fallback"; problem?: string };

export async function generateTheme(): Promise<Result> {
  const { images, name } = useStudio.getState();
  if (!images.length) throw new Error("Add an image first.");
  const ids = images.slice(0, 4).map((img) => img.id); // send at most 4 images

  try {
    const parts = (await Promise.all(ids.map(imageForAi))).filter(Boolean);
    const res = await fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, images: parts }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
    const theme = fixTheme(json.theme);
    // Second AI: paint the cover, only when "AI painting" was chosen (if it fails, the drawn cover is used)
    const { format } = useStudio.getState();
    const coverImage = format.cover === "ai" ? await paintCover(theme.coverArt, format.size) : undefined;
    return { theme: { ...theme, coverImage }, source: "ai" };
  } catch (err) {
    // Plan B: colors from the first image
    const blob = await loadImage(ids[0]);
    const url = URL.createObjectURL(blob!);
    try {
      const theme = await fallbackTheme(url, name);
      return { theme, source: "fallback", problem: err instanceof Error ? err.message : String(err) };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

// Asks our server to paint the cover. Returns the picture, or undefined if it couldn't.
async function paintCover(description: string, size: string): Promise<string | undefined> {
  if (!description) return undefined;
  try {
    const res = await fetch("/api/cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: description, size }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || typeof json.image !== "string") throw new Error(json.error ?? `Error ${res.status}`);
    return json.image;
  } catch (err) {
    console.warn("Cover painter problem:", err instanceof Error ? err.message : err);
    return undefined;
  }
}