// app/api/theme/route.ts
// Runs on the SERVER (your laptop's Next.js), never in the browser.
// It adds our hidden prompt, sends the images to Gemini, and returns a theme.
import { GoogleGenAI, Type } from "@google/genai";
import { fixTheme } from "@/lib/theme-schema";
import { BODY_FONTS, COVER_SCENES, HEADING_FONTS, MOTIFS } from "@/lib/options";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

// The exact shape we want back. Gemini is forced to follow it.
const hexColor = (what: string) => ({ type: Type.STRING, description: `${what}. A 6-digit hex color like #3A4B5C` });
const THEME_SHAPE = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "2-4 word theme name" },
    mood: { type: Type.STRING, description: "One sentence describing the vibe" },
    palette: {
      type: Type.OBJECT,
      properties: {
        paper: hexColor("Page background, very light, printable"),
        ink: hexColor("Body text, dark"),
        primary: hexColor("Headers and banners, the signature color"),
        secondary: hexColor("Soft light fill for boxes"),
        accent: hexColor("Small highlights and decorations"),
        line: hexColor("Subtle grid and ruling lines"),
      },
      required: ["paper", "ink", "primary", "secondary", "accent", "line"],
    },
    headingFont: { type: Type.STRING, enum: HEADING_FONTS },
    bodyFont: { type: Type.STRING, enum: BODY_FONTS },
    motifs: { type: Type.ARRAY, items: { type: Type.STRING, enum: MOTIFS } },
    density: { type: Type.STRING, enum: ["minimal", "balanced", "rich"] },
    headerStyle: { type: Type.STRING, enum: ["banner", "underline", "boxed"] },
    corners: { type: Type.STRING, enum: ["round", "square"] },
    coverTagline: { type: Type.STRING, description: "At most 6 words, for the cover" },
    coverScene: { type: Type.STRING, enum: COVER_SCENES },
    coverBackground: { type: Type.STRING, enum: ["dark", "color", "light"] },
           coverArt: { type: Type.STRING, description: "Art-director prompt for an image AI that creates the cover art, 50-90 words" },
  },
  required: ["name", "mood", "palette", "headingFont", "bodyFont", "motifs", "density", "headerStyle", "corners", "coverTagline", "coverScene", "coverBackground", "coverArt"],
};

// The hidden prompt. The user never sees or types this.
function buildPrompt(name: string) {
  return `You are the art director for PlannerForge, which designs printable and digital planners.

Study the attached images. They are STYLE REFERENCES ONLY: capture their colors, mood and recurring shapes, but never copy them.
Planner name: "${name || "not given"}"

Design ONE matching planner theme.
Rules:
- palette.paper is printed on every inside page: make it a very light, soft tint of the images' main color (not plain white).
- palette.ink must be easy to read on paper. palette.secondary is a pale fill. palette.line is subtle.
- palette.primary is the strongest, most memorable color in the images. It fills the cover, so make it rich, not grey.
- palette.accent is a bright contrasting pop (lights, flowers, highlights in the images).
- Heading fonts: Cormorant (elegant, airy), Playfair (bold magazine), DMSerif (chunky, playful).
- Body fonts: DMSans (clean modern), Lora (bookish, warm), Nunito (soft, friendly).
- Choose 1-4 motifs that echo shapes in the images. density = how decorated the pages feel.
- headerStyle: banner = solid color bar, underline = elegant line, boxed = framed title.
- coverScene is the picture on the front and back covers. Pick what matches the images best:
  skyline (cities, streets, buildings, night lights), botanical (plants, flowers, gardens), celestial (night sky, moon, stars),
  waves (sea, beach, water), mountains (nature, hills, travel), confetti (fun, bright, party, pop), geometric (modern, minimal, abstract).
- coverBackground: dark (moody or night images), color (bold, colorful images), light (soft, pastel, airy images).
- coverArt is a prompt for a high-end image AI that will create the planner's cover art. Write it like a professional art director, 50-90 English words:
  the subject and scene (inspired by the images, not a copy), the medium (for example realistic photograph, cinematic photo, detailed watercolor,
  oil painting, soft 3D render), camera or composition (close-up, wide view, from above), the lighting (golden hour, neon glow, soft daylight),
  the mood, and the colors by name (like "dusty rose", "deep plum", "warm gold"). Match the realism of the images: photos -> photographic style.
  Keep the top quarter of the picture calm and simple (sky, wall, soft blur) because a title label goes there.
  No text, letters, logos, watermarks or people's faces in the picture.
  - Never repeat words that appear inside the images.
- name: 2-4 words. coverTagline: at most 6 words, no quotation marks.`;
}

// Removes characters that could confuse the prompt, and limits length
const clean = (v: unknown) => String(v ?? "").replace(/["<>]/g, "").slice(0, 80);

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "GEMINI_API_KEY is missing from .env.local" }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const body = await req.json();
    const images: { mimeType: string; data: string }[] = Array.isArray(body.images) ? body.images.slice(0, 4) : [];
    if (!images.length) return Response.json({ error: "Add at least one image." }, { status: 400 });

    const result = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: buildPrompt(clean(body.name)) },
            ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
          ],
        },
      ],
      config: { responseMimeType: "application/json", responseSchema: THEME_SHAPE, temperature: 0.9 },
    });

    const raw = JSON.parse(result.text ?? "{}");
    return Response.json({ theme: fixTheme(raw) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Theme AI failed:", message); // shows in your terminal
    const busy = /429|RESOURCE_EXHAUSTED/i.test(message);
    return Response.json(
      { error: busy ? "The style AI is busy. Try again in a minute." : "The style AI is unavailable." },
      { status: busy ? 429 : 500 }
    );
  }
}