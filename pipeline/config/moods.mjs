/**
 * PRESET SUASANA (mood)
 * ---------------------
 * Peta tetap dari "mood" di naskah → efek visual & audio scene.
 * Sengaja tidak diserahkan ke LLM agar semua episode konsisten.
 *
 * Setiap field memakai tipe dari src/config/types.ts (SceneConfig).
 * `sfx` memakai tag pustaka (library.json role "sfx"), bukan path.
 * `clouds` = layer awan (role "atmo") yang ditambahkan otomatis, null = tanpa awan.
 * `defaultSky` = tag langit bila naskah tidak menyebut "sky".
 *
 * @typedef {import("../../src/config/types").SceneConfig} SceneConfig
 * @typedef {{
 *   camera: SceneConfig["camera"],
 *   particles?: SceneConfig["particles"],
 *   lights?: SceneConfig["lights"],
 *   grade?: SceneConfig["grade"],
 *   transitionIn: SceneConfig["transitionIn"],
 *   background?: string,
 *   defaultSky: string,
 *   skyFilter?: string,
 *   clouds: null | { opacity?: number, drift?: { x?: number }, filter?: string },
 *   sfx?: { tag: string, at?: number, volume?: number, loop?: boolean, fadeIn?: number, fadeOut?: number, duration?: number }[],
 *   seaSfx?: boolean,
 * }} MoodPreset
 */

/** @type {Record<string, MoodPreset>} */
export const MOODS = {
  calm: {
    camera: { preset: "slowZoomIn", easing: "easeInOutSine" },
    particles: [{ preset: "dust", count: 50 }],
    lights: [{ type: "godRays", origin: { x: 50, y: 22 }, intensity: 0.4, rays: 14 }],
    grade: { tint: "#ffb070", tintOpacity: 0.12, tintBlend: "soft-light" },
    transitionIn: { type: "crossfade", duration: 0.6 },
    defaultSky: "dusk",
    clouds: { opacity: 0.7, drift: { x: -15 } },
    sfx: [{ tag: "wind", at: 0, volume: 0.25, fadeIn: 0.5, fadeOut: 1 }],
  },

  storm: {
    camera: {
      preset: "orbitDrift",
      shake: { intensity: 8, speed: 1.2, rotation: 0.5 },
      bursts: [{ at: 1.2, intensity: 38, duration: 0.8 }],
    },
    particles: [
      { preset: "heavyRain", angle: 8 },
      { preset: "rain", count: 80, layer: "back", seed: "rain-back" },
    ],
    lights: [{ type: "flash", at: [1.2], intensity: 0.8 }],
    grade: { tint: "#1f3d6b", tintOpacity: 0.35, tintBlend: "multiply", vignette: 0.75 },
    transitionIn: { type: "fadeBlack", duration: 0.6 },
    background: "#05080f",
    defaultSky: "storm",
    clouds: { drift: { x: -60 }, filter: "brightness(0.45)" },
    sfx: [
      { tag: "rain", at: 0, volume: 0.5, loop: true, fadeIn: 0.4, fadeOut: 0.6 },
      { tag: "thunder", at: 1.15, volume: 0.85 },
    ],
    seaSfx: true,
  },

  tense: {
    camera: { preset: "dramaticPush", shake: { intensity: 5, speed: 1.5, rotation: 0.3 } },
    particles: [{ preset: "embers", count: 45 }],
    lights: [{ type: "glow", position: { x: 50, y: 85 }, radius: 600, color: "rgba(255,120,40,1)", intensity: 0.45 }],
    grade: { tint: "#ff5a1f", tintOpacity: 0.18, tintBlend: "soft-light" },
    transitionIn: { type: "zoomBlur", duration: 0.5 },
    background: "#120a10",
    defaultSky: "storm",
    skyFilter: "hue-rotate(-15deg) brightness(0.8)",
    clouds: null,
    sfx: [{ tag: "whoosh", at: 0, volume: 0.5 }],
  },

  sad: {
    camera: { preset: "slowZoomOut" },
    particles: [{ preset: "dust", count: 30, opacity: 0.5 }],
    grade: { tint: "#203a5c", tintOpacity: 0.28, tintBlend: "multiply", vignette: 0.7, filter: "saturate(0.7)" },
    transitionIn: { type: "fade", duration: 0.8 },
    defaultSky: "dusk",
    skyFilter: "brightness(0.8) saturate(0.7)",
    clouds: { opacity: 0.5, drift: { x: -10 } },
    sfx: [{ tag: "wind", at: 0, volume: 0.2, fadeIn: 0.8, fadeOut: 1 }],
  },

  dark: {
    camera: { preset: "slowZoomIn", strength: 0.6, shake: { intensity: 2, speed: 0.4 } },
    particles: [
      { preset: "bubbles", count: 18, opacity: 0.35, layer: "back" },
      { preset: "dust", count: 20, opacity: 0.35, color: "#9fb8ff" },
    ],
    lights: [{ type: "glow", position: { x: 50, y: 55 }, radius: 340, intensity: 0.35, pulse: 0.3, pulseSpeed: 0.5 }],
    grade: { tint: "#0b1530", tintOpacity: 0.5, tintBlend: "multiply", vignette: 0.9, filter: "brightness(0.65)" },
    transitionIn: { type: "fadeBlack", duration: 0.8 },
    background: "#02040a",
    defaultSky: "night",
    skyFilter: "brightness(0.35) saturate(0.6)",
    clouds: null,
  },

  divine: {
    camera: { preset: "riseReveal", easing: "easeInOutSine" },
    particles: [{ preset: "sparkles", count: 40 }],
    lights: [
      { type: "godRays", origin: { x: 50, y: 12 }, intensity: 0.6, rays: 18, rotateSpeed: 2 },
      { type: "glow", position: { x: 50, y: 12 }, radius: 520, intensity: 0.5 },
    ],
    grade: { tint: "#fff1c4", tintOpacity: 0.12, tintBlend: "screen" },
    transitionIn: { type: "flashWhite", duration: 0.6 },
    defaultSky: "dawn",
    clouds: { opacity: 0.5, drift: { x: 10 } },
    sfx: [{ tag: "chime", at: 0.2, volume: 0.55 }],
  },

  hope: {
    camera: { preset: "panUp", strength: 0.8 },
    particles: [
      { preset: "fireflies", count: 26 },
      { preset: "dust", count: 35, seed: "hope-dust" },
    ],
    lights: [
      { type: "godRays", origin: { x: 50, y: 15 }, intensity: 0.45 },
      { type: "lensFlare", position: { x: 50, y: 15 }, intensity: 0.3 },
    ],
    grade: { tint: "#ffcf8a", tintOpacity: 0.15, tintBlend: "soft-light" },
    transitionIn: { type: "circleReveal", duration: 0.8 },
    defaultSky: "dawn",
    clouds: { opacity: 0.5, drift: { x: 10 } },
    sfx: [{ tag: "chime", at: 0.3, volume: 0.45 }],
  },
};

export const MOOD_NAMES = Object.keys(MOODS);
