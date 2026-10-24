// components/shell/Header.tsx
// The bar across the top: logo, tagline, "Start over" and "Download planner".
"use client";
import { Download, Flower2, RotateCcw } from "lucide-react";
import { useStudio, LAST_STEP } from "@/lib/store";
import { Button } from "@/components/ui/Button";

export function Header() {
  const reset = useStudio((s) => s.reset);
  const setStep = useStudio((s) => s.setStep);

  function startOver() {
    if (confirm("Start over? This clears your project.")) reset();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sage text-white">
            <Flower2 size={18} />
          </div>
          <span className="font-serif text-[26px] font-semibold text-ink">PlannerForge</span>
        </div>

        {/* Tagline (hidden on small screens) */}
        <p className="hidden items-center gap-2 text-[13px] text-muted md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-sage/60" />
          Your quiet corner to make something lovely
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={startOver} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink hover:text-sage">
            <RotateCcw size={15} /> Start over
          </button>
          <Button onClick={() => setStep(LAST_STEP)} icon={<Download size={15} />}>
            Download planner
          </Button>
        </div>
      </div>
    </header>
  );
}