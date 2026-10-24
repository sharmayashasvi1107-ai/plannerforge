// app/page.tsx: replace the whole file
// The whole website is this one page. It shows the screen for the current step.
"use client";
import { useHydrated, useStudio } from "@/lib/store";
import { Header } from "@/components/shell/Header";
import { Sidebar, MobileSteps } from "@/components/shell/Sidebar";
import { Hero } from "@/components/ui/Hero";
import { StepUpload } from "@/components/steps/StepUpload";
import { StepTemplate } from "@/components/steps/StepTemplate";
import { StepPlanner } from "@/components/steps/StepPlanner";

// The screens, in order (same order as the sidebar)
const SCREENS = [StepUpload, StepTemplate, StepPlanner];

export default function Home() {
  const ready = useHydrated();
  const step = useStudio((s) => s.step);

  // Wait one moment so the saved project can load from the browser
  if (!ready) return <div className="min-h-screen bg-bg" />;

  const CurrentScreen = SCREENS[step - 1] ?? StepUpload;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto flex max-w-[1280px] gap-11 px-6 lg:px-12">
        <Sidebar />
        <main className="min-w-0 flex-1 py-10">
          <MobileSteps />
                    {/* "key" makes React redraw this box on every step change, so the slide-in animation plays */}
          <div key={step} className="animate-screen">
            {step === 1 && <Hero />}
            <CurrentScreen />
          </div>
        </main>
      </div>
    </div>
  );
}