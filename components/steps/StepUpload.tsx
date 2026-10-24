// components/steps/StepUpload.tsx
// Screen 1: upload 1-10 inspiration images + an optional planner name.
"use client";
import { useRef, useState } from "react";
import { ImagePlus, Plus, Trash, Upload } from "lucide-react";
import { useStudio } from "@/lib/store";
import { ACCEPTED, MAX_IMAGES, saveImage, useImageUrl } from "@/lib/images";
import type { MoodImage } from "@/lib/types";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { Field } from "@/components/ui/Field";
import { StepFooter } from "./StepFooter";

export function StepUpload() {
  const name = useStudio((s) => s.name);
  const update = useStudio((s) => s.update);
  const images = useStudio((s) => s.images);
  const addImages = useStudio((s) => s.addImages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Runs when files are dropped or chosen
  async function handleFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const files = Array.from(list);
    const good = files.filter((f) => ACCEPTED.includes(f.type));
    const bad = files.filter((f) => !ACCEPTED.includes(f.type));
    const room = MAX_IMAGES - images.length;

    const problems: string[] = [];
    if (bad.length) problems.push(`${bad.map((f) => f.name).join(", ")}: only JPG, PNG or WEBP please.`);
    if (good.length > room) problems.push(`You can add ${MAX_IMAGES} images max, so ${good.length - room} were skipped.`);
    if (problems.length) setError(problems.join(" "));

    const toSave = good.slice(0, room);
    if (!toSave.length) return;
    setBusy(true);
    try {
      const saved = await Promise.all(toSave.map(saveImage));
      addImages(saved);
    } catch {
      setError("Couldn't save one of the images. Try a smaller file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Section
        icon={<ImagePlus size={17} />}
        title="Add your inspiration"
        subtitle="Up to 10 images. PlannerForge reads their mood to design your planner."
        right={<span className="text-xs font-semibold text-body">{images.length} / {MAX_IMAGES} images</span>}
      >
        {/* The drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed p-4 ${
            dragging ? "border-sage bg-sage-50" : "border-line bg-surface"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-sage-50 text-sage">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Drop your images here</p>
              <p className="text-xs text-muted">JPG, PNG or WEBP from your computer</p>
            </div>
          </div>
          <Button
            variant="secondary"
            icon={<Plus size={15} />}
            loading={busy}
            disabled={images.length >= MAX_IMAGES}
            onClick={() => fileInput.current?.click()}
          >
            Choose files
          </Button>
          {/* Hidden file picker, opened by the button above */}
          <input
            ref={fileInput}
            type="file"
            hidden
            multiple
            accept={ACCEPTED.join(",")}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div className="mt-4 space-y-4">
          {error && <Banner tone="error">{error}</Banner>}
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((img) => (
              <ImageCard key={img.id} img={img} />
            ))}
          </div>
          <Banner title="Inspiration only.">
            Your images are only used to pick colors, fonts and decorations. They never appear in the planner, and they
            stay on your computer.
          </Banner>
        </div>

        {/* Optional planner name */}
        <div className="mt-6 max-w-md">
          <Field
            label="Planner name (optional)"
            placeholder="Sage & Starlight Planner"
            maxLength={60}
            value={name}
            onChange={(e) => update({ name: e.target.value })}
            hint="Printed on the cover."
          />
        </div>
      </Section>
      <StepFooter canContinue={images.length > 0} hint="Add at least one image." />
    </>
  );
}

// One small card per uploaded image
function ImageCard({ img }: { img: MoodImage }) {
  const url = useImageUrl(img.id);
  const removeImage = useStudio((s) => s.removeImage);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={img.name} className="h-16 w-14 rounded-md object-cover" />
      ) : (
        <div className="h-16 w-14 animate-pulse rounded-md bg-line" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{img.name}</p>
        <p className="text-xs text-muted">✓ Ready</p>
      </div>
      <button aria-label={`Remove ${img.name}`} onClick={() => removeImage(img.id)} className="text-muted hover:text-red-700">
        <Trash size={16} />
      </button>
    </div>
  );
}