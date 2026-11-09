import type { EpisodeConfig, EpisodeTheme } from "../../config/types";

/**
 * Tema bawaan seri "Kisah Nabi". Semua episode bisa memakai tema ini,
 * atau membuat salinan untuk gaya berbeda.
 *
 * Font: taruh file font di public/fonts/ lalu isi `fontFile`.
 * Contoh rekomendasi (gratis, Google Fonts): "Lilita One", "Baloo 2",
 * "Poppins ExtraBold". Tanpa fontFile, dipakai font sistem.
 */
export const defaultTheme: EpisodeTheme = {
  accentColor: "#ffcf5a",
  titleFontFamily: "'Kisah Title', 'Poppins', 'Montserrat', 'Arial Black', sans-serif",
  // titleFontFile: "fonts/LilitaOne-Regular.ttf",
  subtitle: {
    fontFamily: "'Kisah Sub', 'Poppins', 'Montserrat', 'Arial Black', sans-serif",
    // fontFile: "fonts/Poppins-ExtraBold.ttf",
    fontWeight: 800,
    fontSize: 78,
    color: "#ffffff",
    activeColor: "#ffd54a",
    accentColor: "#7fe3ff",
    strokeColor: "#000000",
    strokeWidth: 12,
    y: 68,
    animation: "karaoke",
    background: "none",
    uppercase: false,
  },
  grade: {
    vignette: 0.55,
    grain: 0.25,
  },
  defaultTransition: { type: "crossfade", duration: 0.5 },
};

/**
 * Lengkapi episode hasil pipeline (JSON, tanpa tema) dengan tema seri.
 * `theme` di JSON boleh berisi sebagian nilai untuk menimpa tema bawaan.
 */
export const withDefaultTheme = (
  episode: Omit<EpisodeConfig, "theme"> & { theme?: Partial<EpisodeTheme> },
): EpisodeConfig => ({
  ...episode,
  theme: {
    ...defaultTheme,
    ...episode.theme,
    subtitle: { ...defaultTheme.subtitle, ...episode.theme?.subtitle },
  },
});
