// components/planner/PagesGrid.tsx
// Shows every planner page as a thumbnail. Click one to see it bigger.
"use client";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useStudio } from "@/lib/store";
import { buildPages } from "@/lib/planner/build";
import { Button } from "@/components/ui/Button";
import { PageThumb } from "@/components/ui/PageThumb";

export function PagesGrid() {
  const theme = useStudio((s) => s.theme);
  const format = useStudio((s) => s.format);
  const name = useStudio((s) => s.name);
  const [shown, setShown] = useState(24); // how many thumbnails are visible
  const [openPage, setOpenPage] = useState<number | null>(null); // page shown large

  // Rebuild the pages whenever the style, format or name changes
  const pages = useMemo(() => (theme ? buildPages(theme, format, name || theme.name) : []), [theme, format, name]);
  if (!pages.length) return null;

  return (
    <div className="mt-8">
      <p className="mb-4 text-sm text-body">
        <strong className="text-ink">{pages.length} pages</strong>, exactly as they will look in your PDF.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {pages.slice(0, shown).map((p, i) => (
                    <button
            key={i}
            onClick={() => setOpenPage(i)}
            className="animate-pop text-left"
            style={{ animationDelay: `${Math.min(i, 24) * 40}ms` }} // one after another
          >
            <PageThumb svg={p.svg} className="transition hover:ring-2 hover:ring-sage/40" />
            <p className="mt-1.5 truncate text-xs text-muted">
              {i + 1}. {p.label}
            </p>
          </button>
        ))}
      </div>
      {shown < pages.length && (
        <Button variant="secondary" className="mt-6" onClick={() => setShown(pages.length)}>
          Show all {pages.length} pages
        </Button>
      )}

      {/* One page shown large, on top of everything. Click outside to close. */}
      {openPage !== null && (
        <div onClick={() => setOpenPage(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-6">
          <div className="relative max-h-full w-full max-w-[640px] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close"
              onClick={() => setOpenPage(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 shadow"
            >
              <X size={16} />
            </button>
            <PageThumb svg={pages[openPage].svg} />
          </div>
        </div>
      )}
    </div>
  );
}