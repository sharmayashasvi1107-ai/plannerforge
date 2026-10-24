// components/ui/Field.tsx
// A label + text box + small hint underneath.
export const labelCls = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-body";
export const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none focus:border-sage focus:ring-2 focus:ring-sage/20";

type Props = { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, hint, ...input }: Props) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={inputCls} {...input} />
      {hint && <span className="mt-2 block text-xs text-muted">{hint}</span>}
    </label>
  );
}