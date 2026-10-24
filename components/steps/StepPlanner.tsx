// components/steps/StepPlanner.tsx
// Screen 3: make the style, see the pages, download the PDF.
"use client";
import { BookOpen } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { StyleCard } from "@/components/planner/StyleCard";
import { PagesGrid } from "@/components/planner/PagesGrid";
import { DownloadBox } from "@/components/planner/DownloadBox";
import { StepFooter } from "./StepFooter";

export function StepPlanner() {
  return (
    <>
      <Section icon={<BookOpen size={17} />} title="Your planner" subtitle="Designed around your images. Download it when you love it.">
        <StyleCard />
        <PagesGrid />
        <DownloadBox />
      </Section>
      <StepFooter />
    </>
  );
}