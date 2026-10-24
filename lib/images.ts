// lib/images.ts
// Saves uploaded images inside the browser (IndexedDB), and loads them back.
import imageCompression from "browser-image-compression";
import { createStore, get, set, del, clear, type UseStore } from "idb-keyval";
import { useEffect, useState } from "react";
import type { MoodImage } from "./types";

export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGES = 10;

// The browser "drawer" where images are kept. Created the first time we need it.
let drawer: UseStore | null = null;
function getDrawer() {
  if (!drawer) drawer = createStore("plannerforge", "images");
  return drawer;
}

// Shrink an image, save it, and return a small record { id, name }
export async function saveImage(file: File): Promise<MoodImage> {
  const small = await imageCompression(file, { maxWidthOrHeight: 1600, maxSizeMB: 1, useWebWorker: true });
  const id = crypto.randomUUID();
  await set(id, small, getDrawer());
  return { id, name: file.name };
}

export const loadImage = (id: string) => get<Blob>(id, getDrawer());
export const deleteImage = (id: string) => del(id, getDrawer());
export const clearImages = () => clear(getDrawer());

// Makes a small JPEG version as text (base64), ready to send to the AI
export async function imageForAi(id: string) {
  const blob = await loadImage(id);
  if (!blob) return null;
  const file = new File([blob], "image", { type: blob.type });
  const small = await imageCompression(file, { maxWidthOrHeight: 1024, maxSizeMB: 0.4, fileType: "image/jpeg" });
  const dataUrl = await imageCompression.getDataUrlFromFile(small);
  return { mimeType: "image/jpeg", data: dataUrl.split(",")[1] };
}

// For showing a thumbnail: gives a temporary URL for an <img> tag
export function useImageUrl(id: string) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let temp: string | undefined;
    loadImage(id).then((blob) => {
      if (blob) {
        temp = URL.createObjectURL(blob);
        setUrl(temp);
      }
    });
    return () => {
      if (temp) URL.revokeObjectURL(temp);
    };
  }, [id]);
  return url;
}