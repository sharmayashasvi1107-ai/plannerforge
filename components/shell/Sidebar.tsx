// components/shell/Sidebar.tsx
// The list of 3 steps on the left. Clicking one jumps to that step.
"use client";
import { Heart } from "lucide-react";
import { useStudio } from "@/lib/store";

export const STEPS = ["Upload", "Template", "Your planner"];

export function Sidebar() {
  const step = useStudio((s) => s.step);
  const setStep = useStudio((s) => s.setStep);

  return (
    <aside className="sticky top-[70px] hidden h-[calc(100vh-70px)] w-[220px] shrink-0 py-10 lg:block">
      <p className="mb-4 px-3 text-[11px] font-semibold tracking-[0.12em] text-muted">YOUR STUDIO</p>
      <nav className="space-y-1">
        {STEPS.map((label, i) => {
          const number = i + 1;
          const active = number === step;
          return (
            <button
              key={label}
              onClick={() => setStep(number)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                active ? "bg-sage-50 font-semibold text-ink" : "text-body hover:bg-sage-50/60"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${
                  active ? "bg-sage text-white" : "border border-line text-muted"
                }`}
              >
                {String(number).padStart(2, "0")}
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* The little "Made with care" card */}
      <div className="mt-10 rounded-xl border border-line bg-warm p-4">
        <Heart size={16} className="text-muted" />
        <p className="mt-3 font-serif text-xl text-ink">Made with care.</p>
        <p className="mt-2 text-xs leading-5 text-muted">
          Your references only inspire the style. They never appear in your planner.
        </p>
      </div>
    </aside>
  );
}

// On small screens the sidebar is hidden, and this row of pills shows instead.
export function MobileSteps() {
  const step = useStudio((s) => s.step);
  const setStep = useStudio((s) => s.setStep);
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden">
      {STEPS.map((label, i) => (
        <button
          key={label}
          onClick={() => setStep(i + 1)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
            step === i + 1 ? "border-sage bg-sage text-white" : "border-line text-body"
          }`}
        >
          {i + 1}. {label}
        </button>
      ))}
    </div>
  );
}