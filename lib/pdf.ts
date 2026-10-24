// lib/pdf.ts
// Turns the SVG pages into one PDF file and downloads it.
import { jsPDF } from "jspdf";
import "svg2pdf.js"; // adds doc.svg() to jsPDF
import { useStudio } from "./store";
import { SIZES } from "./planner/common";
import type { PageSpec } from "./planner/build";
import type { SizeId, Theme } from "./types";

type Progress = (done: number, total: number) => void;

// Which font file belongs to which name. "bold" = the SemiBold file.
const FONT_FILES: [string, string, "normal" | "bold"][] = [
  ["Cormorant", "Cormorant-Regular.ttf", "normal"],
  ["Cormorant", "Cormorant-SemiBold.ttf", "bold"],
  ["Playfair", "Playfair-Regular.ttf", "normal"],
  ["Playfair", "Playfair-SemiBold.ttf", "bold"],
  ["DMSerif", "DMSerif-Regular.ttf", "normal"],
  ["DMSerif", "DMSerif-Regular.ttf", "bold"],
  ["DMSans", "DMSans-Regular.ttf", "normal"],
  ["DMSans", "DMSans-SemiBold.ttf", "bold"],
  ["Lora", "Lora-Regular.ttf", "normal"],
  ["Lora", "Lora-SemiBold.ttf", "bold"],
  ["Nunito", "Nunito-Regular.ttf", "normal"],
  ["Nunito", "Nunito-SemiBold.ttf", "bold"],
];

// Font file -> text the PDF library can read
function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// Load only the 2 fonts this theme uses into the PDF
async function addFonts(doc: jsPDF, theme: Theme) {
  const needed: string[] = [theme.headingFont, theme.bodyFont];
  for (const [family, file, style] of FONT_FILES) {
    if (!needed.includes(family)) continue;
    const res = await fetch(`/fonts/${file}`);
    if (!res.ok) throw new Error(`Missing font file: public/fonts/${file}`);
    const name = `${file}-${style}`;
    doc.addFileToVFS(name, toBase64(await res.arrayBuffer()));
    doc.addFont(name, family, style);
  }
}

// Gives the screen a moment to update the progress bar
const pause = () => new Promise((resolve) => setTimeout(resolve, 0));

// Plan A: sharp "vector" PDF (small file, crisp at any zoom)
async function vectorPdf(svgs: string[], size: SizeId, theme: Theme, onProgress: Progress) {
  const { w, h } = SIZES[size];
  const orientation = w > h ? "landscape" : "portrait";
  const doc = new jsPDF({ unit: "pt", format: [w, h], orientation, compress: true });
  await addFonts(doc, theme);

  // svg2pdf needs a real SVG element, so we place each page in a hidden box
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-99999px;top:0;";
  document.body.appendChild(holder);
  try {
    for (let i = 0; i < svgs.length; i++) {
      if (i > 0) doc.addPage([w, h], orientation);
      holder.innerHTML = svgs[i];
      await doc.svg(holder.firstElementChild as Element, { x: 0, y: 0, width: w, height: h });
      onProgress(i + 1, svgs.length);
      await pause();
    }
  } finally {
    holder.remove();
  }
  return doc.output("blob");
}

// Plan B: each page as a picture. Always works, but the file is bigger.
async function svgToJpeg(svg: string, width: number, height: number) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function imagePdf(svgs: string[], size: SizeId, onProgress: Progress) {
  const { w, h } = SIZES[size];
  const orientation = w > h ? "landscape" : "portrait";
  const doc = new jsPDF({ unit: "pt", format: [w, h], orientation, compress: true });
  for (let i = 0; i < svgs.length; i++) {
    if (i > 0) doc.addPage([w, h], orientation);
    doc.addImage(await svgToJpeg(svgs[i], w * 2, h * 2), "JPEG", 0, 0, w, h);
    onProgress(i + 1, svgs.length);
    await pause();
  }
  return doc.output("blob");
}

// "my planner!" -> "my-planner"
const fileName = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50) || "planner";

// The function the Download button calls
export async function downloadPlanner(pages: PageSpec[], onProgress: Progress) {
  const { theme, format, name } = useStudio.getState();
  if (!theme) throw new Error("Generate a style first.");
  const svgs = pages.map((p) => p.svg);

  let pdf: Blob;
  try {
    pdf = await vectorPdf(svgs, format.size, theme, onProgress);
  } catch (err) {
    console.warn("Sharp PDF failed, using the picture version instead:", err);
    pdf = await imagePdf(svgs, format.size, onProgress);
  }

  // Make the browser download the file
  const url = URL.createObjectURL(pdf);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName(name || theme.name)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}