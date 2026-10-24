// components/steps/StepFooter.tsx
// The "Back" and "Continue" buttons at the bottom of every screen.
"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LAST_STEP, useStudio } from "@/lib/store";
import { Button } from "@/components/ui/Button";

type Props = {
  canContinue?: boolean; // false = Continue is greyed out
  hint?: string; // shown when Continue is greyed out
};

export function StepFooter({ canContinue = true, hint }: Props) {
  const step = useStudio((s) => s.step);
  const setStep = useStudio((s) => s.setStep);

  return (
    <div className="flex items-center justify-between border-t border-line pt-6">
      {step > 1 ? (
        <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => setStep(step - 1)}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        {hint && !canContinue && <span className="text-xs text-muted">{hint}</span>}
        {step < LAST_STEP && (
          <Button disabled={!canContinue} onClick={() => setStep(step + 1)}>
            Continue <ArrowRight size={15} />
          </Button>
        )}
      </div>
    </div>
  );
}