// components/ui/Hero.tsx
// The big welcome text at the top of screen 1.
export function Hero() {
  return (
    <div className="flex items-end justify-between gap-6 pb-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted">A LITTLE STUDIO FOR BIG IDEAS</p>
        <h1 className="mt-3 font-serif text-[44px] font-semibold leading-[1.02] text-ink md:text-[56px]">
          Make a planner
          <br />
          that feels like you.
        </h1>
        <p className="mt-4 max-w-[440px] text-[15px] leading-6 text-body">
          Upload a few images you love, pick your pages, and download a planner designed in that style.
        </p>
      </div>
      <p className="hidden text-xs text-muted md:block">✓ Saved in this browser</p>
    </div>
  );
}