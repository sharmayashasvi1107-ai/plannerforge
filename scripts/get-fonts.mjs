// scripts/get-fonts.mjs
// Copies the planner fonts from node_modules into public/fonts with simple names.
// Run once with:  node scripts/get-fonts.mjs
import { copyFileSync, mkdirSync } from "node:fs";

const from = "node_modules/@expo-google-fonts/";
const files = [
  ["cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf", "Cormorant-Regular.ttf"],
  ["cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf", "Cormorant-SemiBold.ttf"],
  ["playfair-display/400Regular/PlayfairDisplay_400Regular.ttf", "Playfair-Regular.ttf"],
  ["playfair-display/600SemiBold/PlayfairDisplay_600SemiBold.ttf", "Playfair-SemiBold.ttf"],
  ["dm-serif-display/400Regular/DMSerifDisplay_400Regular.ttf", "DMSerif-Regular.ttf"],
  ["dm-sans/400Regular/DMSans_400Regular.ttf", "DMSans-Regular.ttf"],
  ["dm-sans/600SemiBold/DMSans_600SemiBold.ttf", "DMSans-SemiBold.ttf"],
  ["lora/400Regular/Lora_400Regular.ttf", "Lora-Regular.ttf"],
  ["lora/600SemiBold/Lora_600SemiBold.ttf", "Lora-SemiBold.ttf"],
  ["nunito/400Regular/Nunito_400Regular.ttf", "Nunito-Regular.ttf"],
  ["nunito/600SemiBold/Nunito_600SemiBold.ttf", "Nunito-SemiBold.ttf"],
];

mkdirSync("public/fonts", { recursive: true });
for (const [src, name] of files) {
  copyFileSync(from + src, "public/fonts/" + name);
  console.log("copied", name);
}
console.log("Done! 11 font files are in public/fonts");