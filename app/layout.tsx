// app/layout.tsx: replace the whole file
// Wraps every page. Loads the two website fonts from public/fonts.
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const serif = localFont({
  src: [
    { path: "../public/fonts/Cormorant-Regular.ttf", weight: "400" },
    { path: "../public/fonts/Cormorant-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-cormorant",
});
const sans = localFont({
  src: [
    { path: "../public/fonts/DMSans-Regular.ttf", weight: "400" },
    { path: "../public/fonts/DMSans-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-dmsans",
});

export const metadata: Metadata = {
  title: "PlannerForge",
  description: "Make a planner that feels like you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}