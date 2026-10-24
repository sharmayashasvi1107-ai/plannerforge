// components/ui/Button.tsx
// One button used everywhere. variant="primary" = green, "secondary" = white with border.
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  loading?: boolean;
};

export function Button({ variant = "primary", icon, loading, children, className = "", disabled, ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const look =
    variant === "primary"
      ? "bg-sage text-white shadow-sm hover:bg-sage-dark"
      : "border border-line bg-surface text-ink hover:border-sage";
  return (
    <button className={`${base} ${look} ${className}`} disabled={loading || disabled} {...rest}>
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon}
      {children}
    </button>
  );
}