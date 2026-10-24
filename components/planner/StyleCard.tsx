// components/planner/StyleCard.tsx
// Top of screen 3. Before: a "Make my planner" button. While working: a friendly loading card.
// After: the style the AI chose, with a burst of confetti in your planner's colors.
"use client";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { RefreshCw, Sparkles } from "lucide-react";
import { useStudio } from "@/lib/store";
import { generateTheme } from "@/lib/ai-client";
import { FONT_LABELS } from "@/lib/options";
import type { Theme } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

// Confetti in the planner's own colors
function celebrate(theme: Theme) {
  const P = theme.palette;
  const colors = [P.primary, P.accent, P.secondary, P.paper];
  confetti({ particleCount: 110, spread: 75, startVelocity: 42, origin: { x: 0.3, y: 0.35 }, colors, disableForReducedMotion: true });
  confetti({ particleCount: 110, spread: 75, startVelocity: 42, origin: { x: 0.7, y: 0.35 }, colors, disableForReducedMotion: true });
}

// The card shown while the AI works. The message changes every 2 seconds.
function LoadingCard({ painting }: { painting: boolean }) {
  const steps = [
    "Reading your images…",
    "Picking colors from your moodboard…",
    "Pairing the fonts…",
    painting ? "Painting your cover… (this one takes a few seconds)" : "Drawing your covers…",
    "Adding the finishing touches…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), 2000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="animate-pop rounded-xl border border-line bg-surface p-10 text-center">
      <Sparkles className="mx-auto animate-pulse text-gold" size={28} />
      <p key={i} className="animate-fade mt-3 font-serif text-2xl text-ink">
        {steps[i]}
      </p>
      <div className="mx-auto mt-5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-sage-50">
        <div className="loading-bar h-full w-full rounded-full" />
      </div>
      <p className="mt-3 text-xs text-muted">Step {i + 1} of {steps.length}</p>
    </div>
  );
}

export function StyleCard() {
  const theme = useStudio((s) => s.theme);
  const source = useStudio((s) => s.themeSource);
  const cover = useStudio((s) => s.format.cover);
  const setTheme = useStudio((s) => s.setTheme);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Asks the AI for a style (or uses Plan B if the AI can't be reached)
  async function makeStyle() {
    setLoading(true);
    setError(null);
    try {
      const result = await generateTheme();
      setTheme(result.theme, result.source);
      celebrate(result.theme);
      if (result.problem) console.warn("AI problem:", result.problem);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // WORKING: the AI is busy
  if (loading) return <LoadingCard painting={cover === "ai"} />;

  // BEFORE: nothing made yet
  if (!theme) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
        <p className="font-serif text-2xl text-ink">Ready when you are.</p>
        <p className="mt-2 text-sm text-body">PlannerForge will read your images and design every page to match.</p>
        <Button className="mt-5" icon={<Sparkles size={15} />} onClick={makeStyle}>
          Make my planner
        </Button>
        {error && (
          <div className="mt-4 text-left">
            <Banner tone="error">{error}</Banner>
          </div>
        )}
      </div>
    );
  }

  // AFTER: show what the AI chose
  const P = theme.palette;
  const needsPainting = cover === "ai" && !theme.coverImage && source === "ai";
  return (
    <div className="animate-pop space-y-4">
      {source === "fallback" && (
        <Banner title="Made from your image's colors.">
          The style AI couldn&apos;t be reached, so we used the colors straight from your image. Try another style later.
        </Banner>
      )}
      {needsPainting && (
        <Banner title="No AI painting yet.">
          You chose the AI painting cover. Click &ldquo;Try another style&rdquo; to paint it (or the painter is busy, so we drew one for now).
        </Banner>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Your style</p>
          <p className="mt-1 font-serif text-2xl text-ink">{theme.name}</p>
          <p className="text-sm text-muted">{theme.mood}</p>
          <p className="mt-2 text-xs text-body">
            {FONT_LABELS[theme.headingFont]} + {FONT_LABELS[theme.bodyFont]}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* the 6 colors as little circles */}
          <div className="flex -space-x-2">
            {[P.paper, P.ink, P.primary, P.secondary, P.accent, P.line].map((c, i) => (
              <span key={i} className="h-8 w-8 rounded-full border-2 border-surface shadow-sm" style={{ background: c }} />
            ))}
          </div>
          <Button variant="secondary" icon={<RefreshCw size={15} />} onClick={makeStyle}>
            Try another style
          </Button>
        </div>
      </div>
    </div>
  );
}