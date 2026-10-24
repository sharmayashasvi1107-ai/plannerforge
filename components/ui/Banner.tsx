// components/ui/Banner.tsx
// A message box. tone="info" = beige, tone="error" = red.
import { Info, TriangleAlert } from "lucide-react";

type Props = { tone?: "info" | "error"; title?: string; children: React.ReactNode };

export function Banner({ tone = "info", title, children }: Props) {
  const isError = tone === "error";
  const look = isError ? "border-red-200 bg-red-50 text-red-800" : "border-line bg-warm text-body";
  const Icon = isError ? TriangleAlert : Info;
  return (
    <div role={isError ? "alert" : undefined} className={`flex gap-3 rounded-lg border p-4 text-[13px] leading-5 ${look}`}>
      <Icon size={17} className={isError ? "shrink-0" : "shrink-0 text-gold"} />
      <p>
        {title && <strong className="text-ink">{title} </strong>}
        {children}
      </p>
    </div>
  );
}