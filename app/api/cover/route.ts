// app/api/cover/route.ts
// Runs on the SERVER. Sends the AI's cover description to a Cloudflare image model
// and returns the painting. Your Cloudflare keys stay here, never in the browser.

// Which painter to use. Leonardo "Lucid Origin" = best quality (about 3 covers a day on the free plan).
// For lots of quick tests, put CLOUDFLARE_IMAGE_MODEL=@cf/black-forest-labs/flux-1-schnell in .env.local.
const MODEL = process.env.CLOUDFLARE_IMAGE_MODEL || "@cf/leonardo/lucid-origin";

// Added to every request so the painting suits a planner cover
const STYLE =
  " Premium planner cover art, highly detailed, professional quality, beautiful composition, soft natural light." +
  " No text, no letters, no words, no watermark, no logo, no border.";

// Painting size in pixels: portrait for paper, landscape for tablets (kept small to save free credits)
const SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 768, height: 1024 },
  letter: { width: 768, height: 1024 },
  tablet: { width: 1024, height: 768 },
};

// The two kinds of model want slightly different settings
function requestBody(prompt: string, size: string) {
  if (MODEL.includes("flux-1-schnell")) {
    return { prompt, steps: 8, seed: Math.floor(Math.random() * 1_000_000) }; // fast model: square, random seed = new painting
  }
  // Lucid Origin refuses a "seed" setting; it already picks a random one itself
  return { prompt, ...(SIZES[size] ?? SIZES.a4), steps: 25, guidance: 4.5 };
}

// The model sends the picture as base64 text; find out if it is a JPEG or a PNG
const mimeOf = (b64: string) => (b64.startsWith("iVBOR") ? "image/png" : b64.startsWith("UklGR") ? "image/webp" : "image/jpeg");

export async function POST(req: Request) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) {
    return Response.json({ error: "Cloudflare keys are missing from .env.local" }, { status: 500 });
  }
  try {
    const body = await req.json();
    const prompt = String(body.prompt ?? "").replace(/[<>]/g, "").slice(0, 1500).trim();
    if (!prompt) return Response.json({ error: "No cover description." }, { status: 400 });

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody(prompt + STYLE, String(body.size ?? "a4"))),
    });
    const json = await res.json().catch(() => ({}));
    const image: unknown = json?.result?.image;
    if (!res.ok || typeof image !== "string") {
      const why = json?.errors?.[0]?.message ?? `Cloudflare error ${res.status}`;
      throw new Error(why);
    }
    return Response.json({ image: `data:${mimeOf(image)};base64,${image}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Cover painter failed:", message); // shows in your terminal
    return Response.json({ error: "The cover painter is unavailable." }, { status: 500 });
  }
}