// components/steps/StepTemplate.tsx
// Screen 2: pick a template, how long the planner lasts, and the page size.
"use client";

import { BookHeart, Brush, Check, Crown, Feather, GraduationCap, LayoutTemplate, Leaf, ListChecks, Palette, Quote, Ruler, Square } from "lucide-react";
import { useStudio } from "@/lib/store";
import { LENGTHS, TEMPLATES, totalPages } from "@/lib/templates";
import { COVER_STYLES } from "@/lib/options";
import type { CoverStyle, SizeId, TemplateId } from "@/lib/types";
import { Section } from "@/components/ui/Section";
import { inputCls, labelCls } from "@/components/ui/Field";
import { StepFooter } from "./StepFooter";

// One icon per template card
const ICONS: Record<TemplateId, React.ReactNode> = {
  student: <GraduationCap size={20} />,
  wellness: <Leaf size={20} />,
  productivity: <ListChecks size={20} />,
  minimal: <Feather size={20} />,
};
// One icon per cover style
const COVER_ICONS: Record<CoverStyle, React.ReactNode> = {
  solid: <Square size={18} />,
  multi: <Palette size={18} />,
  ai: <Brush size={18} />,
};

const SIZES: { id: SizeId; name: string; note: string }[] = [
  { id: "a4", name: "A4", note: "For printing" },
  { id: "letter", name: "US Letter", note: "For printing (USA)" },
  { id: "tablet", name: "Tablet", note: "For GoodNotes, Notability" },
];

// Small helper: green when chosen, white when not
const choice = (selected: boolean) =>
  `rounded-xl border p-4 text-left transition ${
    selected ? "border-sage bg-sage-50 ring-2 ring-sage/20" : "border-line bg-surface hover:border-sage"
  }`;

export function StepTemplate() {
  const format = useStudio((s) => s.format);
  const setFormat = useStudio((s) => s.setFormat);
  const pages = totalPages(format.template, format.months);

  return (
    <>
      <Section
        icon={<LayoutTemplate size={17} />}
        title="Choose a template"
        subtitle="Each template is a ready-made mix of pages. The style will come from your images."
      >
        {/* Template cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => setFormat({ template: t.id })} className={choice(format.template === t.id)}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-sage">{ICONS[t.id]}</div>
                <div>
                  <p className="font-serif text-xl text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.description}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-body">{t.includes}</p>
            </button>
          ))}
        </div>

        {/* Length */}
        <div className="mt-6">
          <span className={labelCls}>How long?</span>
          <div className="flex flex-wrap gap-2">
            {LENGTHS.map((m) => (
              <button
                key={m}
                onClick={() => setFormat({ months: m })}
                className={`rounded-full border px-5 py-2 text-sm ${
                  format.months === m ? "border-sage bg-sage text-white" : "border-line bg-surface text-ink hover:border-sage"
                }`}
              >
                {m} months
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Your planner will have {pages} pages.</p>
        </div>
      </Section>

      <Section icon={<Ruler size={17} />} title="Size and dates" subtitle="Where will you use it, and when does it start?">
        {/* Size cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {SIZES.map((s) => (
            <button key={s.id} onClick={() => setFormat({ size: s.id })} className={choice(format.size === s.id)}>
              <p className="font-serif text-xl text-ink">{s.name}</p>
              <p className="mt-1 text-xs text-muted">{s.note}</p>
            </button>
          ))}
        </div>

        {/* Start month + week start */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className={labelCls}>Start month</span>
            <input
              type="month"
              className={inputCls}
              value={format.startMonth}
              onChange={(e) => e.target.value && setFormat({ startMonth: e.target.value })}
            />
          </label>
          <label>
            <span className={labelCls}>Weeks start on</span>
            <select
              className={inputCls}
              value={format.weekStart}
              onChange={(e) => setFormat({ weekStart: e.target.value as "mon" | "sun" })}
            >
              <option value="mon">Monday</option>
              <option value="sun">Sunday</option>
            </select>
          </label>
        </div>
      </Section>
        <Section icon={<BookHeart size={17} />} title="Cover and extras" subtitle="Choose how your covers look, and add a little motivation.">
        {/* Cover style cards */}
        <span className={labelCls}>Cover style</span>
        <div className="grid gap-3 sm:grid-cols-3">
          {COVER_STYLES.map((c) => (
            <button key={c.id} onClick={() => setFormat({ cover: c.id })} className={choice(format.cover === c.id)}>
              <div className="flex items-center justify-between">
                <span className="text-sage">{COVER_ICONS[c.id]}</span>
                {c.premium && (
                  <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                    <Crown size={11} /> Premium
                  </span>
                )}
              </div>
              <p className="mt-2 font-serif text-xl text-ink">{c.name}</p>
              <p className="mt-1 text-xs text-muted">{c.note}</p>
            </button>
          ))}
        </div>
        {format.cover === "ai" && (
          <p className="mt-2 text-xs text-muted">
            Premium preview: the painting is made when you click &ldquo;Make my planner&rdquo; or &ldquo;Try another style&rdquo;.
          </p>
        )}

        {/* Quotes on/off */}
        <button
          onClick={() => setFormat({ quotes: !format.quotes })}
          className={`mt-6 flex w-full items-start gap-3 ${choice(format.quotes)}`}
        >
          <span className="mt-0.5 text-sage">
            <Quote size={18} />
          </span>
          <span className="flex-1">
            <span className="block font-serif text-xl text-ink">Motivational quotes</span>
            <span className="block text-xs text-muted">A short, uplifting line at the bottom of calendar, weekly, daily, habit and to-do pages.</span>
          </span>
          <span
            className={`mt-1 grid h-5 w-5 place-items-center rounded border ${
              format.quotes ? "border-sage bg-sage text-white" : "border-line bg-white"
            }`}
          >
            {format.quotes && <Check size={13} />}
          </span>
        </button>
      </Section>
    <StepFooter />
    </>
  );
}