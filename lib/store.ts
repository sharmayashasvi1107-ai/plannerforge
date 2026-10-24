// lib/store.ts
// The app's memory. Every screen reads from and writes to this one place,
// and it is saved in the browser automatically (so a refresh loses nothing).
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { Format, MoodImage, Theme } from "./types";
import { clearImages, deleteImage } from "./images";

export const LAST_STEP = 3;

// "2026-10" for the current month
function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// What a brand-new project looks like
function freshProject() {
  return {
    step: 1,
    name: "",
    images: [] as MoodImage[],
    theme: null as Theme | null,
    themeSource: null as "ai" | "fallback" | null,
    format: {
      template: "student",
      months: 6,
      size: "a4",
      startMonth: thisMonth(),
      weekStart: "mon",
      cover: "multi",
      quotes: false,
    } as Format,
  };
}

type Data = ReturnType<typeof freshProject>;

// Every way the app is allowed to change the memory
type Actions = {
  setStep: (n: number) => void;
  update: (changes: Partial<Data>) => void;
  addImages: (imgs: MoodImage[]) => void;
  removeImage: (id: string) => void;
  setTheme: (theme: Theme, source: "ai" | "fallback") => void;
  setFormat: (changes: Partial<Format>) => void;
  reset: () => void;
};

export const useStudio = create<Data & Actions>()(
  persist(
    (set) => ({
      ...freshProject(),

      setStep: (n) => {
        set({ step: Math.min(Math.max(n, 1), LAST_STEP) });
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      update: (changes) => set(changes),
      addImages: (imgs) => set((s) => ({ images: [...s.images, ...imgs].slice(0, 10), theme: null })),
      removeImage: (id) => {
        deleteImage(id);
        set((s) => ({ images: s.images.filter((img) => img.id !== id), theme: null }));
      },
      setTheme: (theme, source) => set({ theme, themeSource: source }),
      setFormat: (changes) => set((s) => ({ format: { ...s.format, ...changes } })),
      reset: () => {
        clearImages();
        set(freshProject());
      },
    }),
    {
      name: "plannerforge-v1", // the name it is saved under in the browser
      // Projects saved before an update may miss new format choices: fill them with the defaults
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<Data>;
        return { ...current, ...s, format: { ...current.format, ...s.format } };
      },
    }
  )
);

// True once the saved project has been loaded from the browser.
// We wait for this so the screens never flash empty data.
export function useHydrated() {
  return useSyncExternalStore(
    (onDone) => useStudio.persist.onFinishHydration(onDone),
    () => useStudio.persist.hasHydrated(),
    () => false // on the server there is nothing saved yet
  );
}