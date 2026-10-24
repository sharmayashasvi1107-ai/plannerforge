// lib/planner/motifs.ts
// 12 simple decoration shapes. Each is drawn inside a 24 x 24 box.
import type { MotifId } from "../types";

export const MOTIF_PATHS: Record<MotifId, string> = {
  star: "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z",
  moon: "M15 3a9 9 0 1 0 6 15.5A8 8 0 0 1 15 3z",
  sparkle: "M12 2C12.8 8 16 11.2 22 12C16 12.8 12.8 16 12 22C11.2 16 8 12.8 2 12C8 11.2 11.2 8 12 2Z",
  sun: "M12 7a5 5 0 1 1 0 10a5 5 0 1 1 0-10zM12 0l1.2 3.5h-2.4zM12 24l-1.2-3.5h2.4zM0 12l3.5-1.2v2.4zM24 12l-3.5 1.2v-2.4z",
  cloud: "M7 18h11a4 4 0 0 0 .4-8A6 6 0 0 0 6.6 9 4.5 4.5 0 0 0 7 18z",
  leaf: "M4 20C4 9 10 4 21 3C20 14 15 20 4 20Z",
  flower: "M12 2a4 4 0 0 1 0 8a4 4 0 0 1 0-8zM12 14a4 4 0 0 1 0 8a4 4 0 0 1 0-8zM2 12a4 4 0 0 1 8 0a4 4 0 0 1-8 0zM14 12a4 4 0 0 1 8 0a4 4 0 0 1-8 0z",
  branch: "M12 4c3 1 4 3 4 6-3-1-4-3-4-6zM12 9c-3 1-4 3-4 6 3-1 4-3 4-6zM12 14c3 1 4 3 4 6-3-1-4-3-4-6zM11.5 4h1v18h-1z",
  wave: "M2 12c3-4 7-4 10 0s7 4 10 0v3c-3 4-7 4-10 0s-7-4-10 0z",
  heart: "M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z",
  dot: "M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8z",
  diamond: "M12 2l7 10-7 10-7-10z",
};