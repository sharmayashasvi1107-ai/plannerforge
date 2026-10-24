// components/ui/Section.tsx
// A block with an icon, a big serif title, a subtitle and a line above it.
type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode; // optional thing on the right (a counter or a button)
  children: React.ReactNode;
};

export function Section({ icon, title, subtitle, right, children }: Props) {
  return (
    <section className="border-t border-line py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-sage-50 text-sage">
            {icon}
          </div>
          <div>
            <h2 className="font-serif text-[28px] leading-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}