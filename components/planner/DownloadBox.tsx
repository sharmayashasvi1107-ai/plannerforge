// components/planner/DownloadBox.tsx
// The "Download planner" button with a progress bar.
"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { useStudio } from "@/lib/store";
import { buildPages } from "@/lib/planner/build";
import { downloadPlanner } from "@/lib/pdf";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

export function DownloadBox() {
  const theme = useStudio((s) => s.theme);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!theme) return null;

  async function download() {
    const { theme, format, name } = useStudio.getState();
    if (!theme) return;
    const pages = buildPages(theme, format, name || theme.name);
    setError(null);
    setProgress({ done: 0, total: pages.length });
    try {
      await downloadPlanner(pages, (done, total) => setProgress({ done, total }));
    } catch (e) {
      console.error(e);
      setError("Something went wrong building the PDF. Try fewer pages or refresh the page.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-line bg-warm p-5">
      {error && (
        <div className="mb-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      {progress ? (
        <div>
          <p className="text-sm text-ink">
            Drawing page {progress.done} of {progress.total}…
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-sage transition-all"
              style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-body">Your planner as one PDF, ready to print or use on a tablet.</p>
          <Button icon={<Download size={15} />} onClick={download}>
            Download planner
          </Button>
        </div>
      )}
    </div>
  );
}