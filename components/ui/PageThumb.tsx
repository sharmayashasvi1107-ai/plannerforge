// components/ui/PageThumb.tsx
// Shows one planner page (SVG text) on screen, scaled to fit its box.
export function PageThumb({ svg, className = "" }: { svg: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-line bg-white shadow-sm [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}