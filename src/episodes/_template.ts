import type { EpisodeConfig, SceneConfig } from "../config/types";
import { defaultTheme } from "./shared/theme";

/**
 * TEMPLATE EPISODE BARU
 * ---------------------
 * Cara tercepat: `npm run new-episode -- nabi-yunus "Kisah Nabi Yunus AS"`
 * (menyalin file ini, membuat folder aset, dan mendaftarkannya).
 *
 * Atau manual:
 *  1. Salin file ini → src/episodes/nabi-xxx.ts
 *  2. Buat folder public/episodes/nabi-xxx/ dan isi aset
 *  3. Daftarkan di src/episodes/index.ts
 *
 * Struktur aset yang disarankan per scene (hasil ChatGPT):
 *   bg-XX.webp     → langit/latar penuh 1080x1920 atau lebih besar (depth 0–0.1)
 *   mid-XX.png     → gunung/bangunan, PNG transparan (depth 0.3–0.6)
 *   char-XX.png    → karakter/objek utama, PNG transparan (depth 0.8–1, fit "width")
 *   fg-XX.png      → foreground (rumput, ombak, kerumunan) (depth 1.2–1.4)
 */

const A = "episodes/__SLUG__";

/** Helper agar scene sederhana cukup ditulis singkat */
const simpleScene = (
  n: number,
  narration: string,
  duration: SceneConfig["duration"] = 5.6,
  extra: Partial<SceneConfig> = {},
): SceneConfig => {
  const nn = String(n).padStart(2, "0");
  return {
    id: `s${nn}`,
    duration,
    layers: [
      { src: `${A}/bg-${nn}.webp`, depth: 0.05 },
      { src: `${A}/mid-${nn}.png`, depth: 0.45 },
      { src: `${A}/char-${nn}.png`, depth: 0.9, fit: "width", width: 760, anchor: "bottom", offset: { y: -80 } },
    ],
    camera: { preset: n % 2 === 0 ? "slowZoomIn" : "panRight" },
    particles: [{ preset: "dust" }],
    narration: { text: narration /* , audio: `${A}/audio/narasi-${nn}.mp3` */ },
    ...extra,
  };
};

export const templateEpisode: EpisodeConfig = {
  id: "__ID__",
  title: "__TITLE__",
  theme: defaultTheme,
  // music: { src: `${A}/audio/music.mp3`, volume: 0.35, duckTo: 0.4 },
  scenes: [
    simpleScene(1, "Kalimat pembuka episode.", 5, {
      overlay: { title: "__TITLE__", y: 26, style: "hero" },
      lights: [{ type: "godRays", origin: { x: 50, y: 20 } }],
    }),
    simpleScene(2, "Narasi scene dua."),
    simpleScene(3, "Narasi scene tiga."),
    simpleScene(4, "Narasi scene empat."),
    simpleScene(5, "Narasi scene lima."),
    simpleScene(6, "Narasi scene enam."),
    simpleScene(7, "Narasi scene tujuh."),
    simpleScene(8, "Narasi penutup dan pelajaran.", 6.4, {
      overlay: { title: "Ikuti untuk kisah berikutnya", y: 22, style: "cta", start: 3 },
    }),
  ],
};
