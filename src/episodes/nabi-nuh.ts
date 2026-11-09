import type { EpisodeConfig } from "../config/types";
import { defaultTheme } from "./shared/theme";

/**
 * ============================================================
 *  EPISODE: Kisah Nabi Nuh AS — 8 scene, total 45 detik
 * ============================================================
 * Aset ada di public/episodes/nabi-nuh/. Gambar di folder itu adalah
 * PLACEHOLDER — ganti dengan gambar dari ChatGPT dengan NAMA FILE SAMA,
 * atau ubah path di bawah.
 *
 * Narasi audio: rekam / TTS tiap scene, simpan di
 * public/episodes/nabi-nuh/audio/narasi-01.mp3 dst, lalu aktifkan
 * baris `audio:` pada tiap scene. Jika ingin durasi mengikuti panjang
 * audio, ganti `duration: 5` menjadi `duration: "auto"`.
 *
 * Catatan adab: sesuai konvensi umum konten Islami, sosok nabi tidak
 * ditampilkan wajahnya — hanya siluet dari belakang + cahaya.
 */

const A = "episodes/nabi-nuh"; // folder aset (relatif ke /public)

export const nabiNuh: EpisodeConfig = {
  id: "NabiNuh",
  title: "Kisah Nabi Nuh AS",
  subtitle: "Bahtera Penyelamat",
  theme: defaultTheme,
  showSafeArea: false,

  music: {
    src: `${A}/audio/music-ambient.mp3`,
    volume: 0.4,
    fadeIn: 1.5,
    fadeOut: 2.5,
    duckTo: 0.4,
  },

  scenes: [
    /* ---------------------------------------------------------- 1 */
    {
      id: "s01-pembuka",
      label: "Pembuka",
      duration: 5,
      background: "#1b0f24",
      transitionIn: { type: "fade", duration: 0.8 },
      layers: [
        { src: `${A}/sky-dusk.webp`, depth: 0.05 },
        { src: `${A}/clouds.png`, depth: 0.15, drift: { x: -18 }, opacity: 0.8 },
        { src: `${A}/mountains-far.png`, depth: 0.35, fit: "cover" },
        { src: `${A}/village.png`, depth: 0.7, fit: "cover" },
      ],
      camera: { preset: "riseReveal", easing: "easeInOutSine" },
      particles: [{ preset: "dust", count: 50 }],
      lights: [
        { type: "godRays", origin: { x: 50, y: 30 }, intensity: 0.45, rays: 16 },
        { type: "lensFlare", position: { x: 50, y: 30 }, intensity: 0.35 },
      ],
      overlay: { title: "Kisah Nabi Nuh AS", subtitle: "BAHTERA PENYELAMAT", y: 26, style: "hero", start: 0.3 },
      narration: {
        text: "Inilah kisah Nabi Nuh *alaihissalam*, rasul yang sabar luar biasa.",
        // audio: `${A}/audio/narasi-01.mp3`,
      },
      sfx: [{ src: `${A}/audio/wind.mp3`, at: 0, volume: 0.35, fadeIn: 0.5, fadeOut: 1, duration: 5 }],
    },

    /* ---------------------------------------------------------- 2 */
    {
      id: "s02-dakwah",
      label: "Dakwah 950 tahun",
      duration: 6,
      transitionIn: { type: "crossfade", duration: 0.6 },
      layers: [
        { src: `${A}/sky-dusk.webp`, depth: 0.05, filter: "brightness(0.85)" },
        { src: `${A}/mountains-far.png`, depth: 0.3 },
        { src: `${A}/village.png`, depth: 0.55 },
        {
          src: `${A}/prophet-silhouette.png`,
          depth: 0.9,
          fit: "width",
          width: 520,
          anchor: "bottom",
          offset: { x: -140, y: -60 },
          float: { amplitude: 4, speed: 0.25 },
          enter: { type: "fade", duration: 1 },
        },
        {
          src: `${A}/crowd.png`,
          depth: 1.25,
          fit: "width",
          width: 1300,
          anchor: "bottom",
          offset: { y: 40 },
          enter: { type: "rise", duration: 1, delay: 0.4 },
        },
      ],
      camera: { preset: "slowZoomIn", strength: 1.2 },
      particles: [{ preset: "sparkles", count: 25, layer: "back" }],
      lights: [
        // cahaya lembut di sekitar siluet nabi
        { type: "glow", position: { x: 37, y: 66 }, radius: 380, intensity: 0.55, pulse: 0.2 },
      ],
      narration: {
        text: "Selama *950 tahun*, beliau mengajak kaumnya menyembah Allah semata.",
        // audio: `${A}/audio/narasi-02.mp3`,
      },
    },

    /* ---------------------------------------------------------- 3 */
    {
      id: "s03-ejekan",
      label: "Kaum mengejek",
      duration: 5,
      background: "#120a10",
      transitionIn: { type: "zoomBlur", duration: 0.5 },
      layers: [
        { src: `${A}/sky-storm.webp`, depth: 0.05, filter: "hue-rotate(-15deg) brightness(0.8)" },
        { src: `${A}/village.png`, depth: 0.4 },
        {
          src: `${A}/crowd.png`,
          depth: 1.1,
          fit: "width",
          width: 1500,
          anchor: "bottom",
          offset: { y: 20 },
          float: { amplitude: 6, speed: 1.2 },
        },
      ],
      camera: {
        preset: "dramaticPush",
        shake: { intensity: 5, speed: 1.5, rotation: 0.3 },
      },
      particles: [{ preset: "embers", count: 45 }],
      lights: [{ type: "glow", position: { x: 50, y: 85 }, radius: 600, color: "rgba(255,120,40,1)", intensity: 0.45 }],
      grade: { tint: "#ff5a1f", tintOpacity: 0.18, tintBlend: "soft-light" },
      narration: {
        text: "Namun mereka *mengejek*, menutup telinga, dan menolak kebenaran.",
        // audio: `${A}/audio/narasi-03.mp3`,
      },
      sfx: [{ src: `${A}/audio/whoosh.mp3`, at: 0, volume: 0.5 }],
    },

    /* ---------------------------------------------------------- 4 */
    {
      id: "s04-bahtera",
      label: "Membuat bahtera",
      duration: 6,
      transitionIn: { type: "flashWhite", duration: 0.6 },
      layers: [
        { src: `${A}/sky-dawn.webp`, depth: 0.05 },
        { src: `${A}/clouds.png`, depth: 0.12, drift: { x: 12 }, opacity: 0.6 },
        { src: `${A}/mountains-far.png`, depth: 0.3 },
        {
          src: `${A}/ark-frame.png`,
          depth: 0.8,
          fit: "width",
          width: 1000,
          anchor: "bottom",
          offset: { y: -260 },
          enter: { type: "zoom", duration: 1.2 },
        },
      ],
      camera: {
        preset: "panRight",
        bursts: [
          { at: 1.6, intensity: 10, duration: 0.3 },
          { at: 2.4, intensity: 10, duration: 0.3 },
          { at: 3.2, intensity: 10, duration: 0.3 },
        ],
      },
      particles: [{ preset: "dust", count: 70, color: "#ffe0a8" }],
      lights: [{ type: "godRays", origin: { x: 80, y: 5 }, intensity: 0.5, rotateSpeed: 1 }],
      narration: {
        text: "Allah lalu memerintahkan Nuh membuat sebuah *bahtera* besar di daratan.",
        // audio: `${A}/audio/narasi-04.mp3`,
      },
      sfx: [
        { src: `${A}/audio/hammer.mp3`, at: 1.6, volume: 0.6 },
        { src: `${A}/audio/hammer.mp3`, at: 2.4, volume: 0.6 },
        { src: `${A}/audio/hammer.mp3`, at: 3.2, volume: 0.6 },
      ],
    },

    /* ---------------------------------------------------------- 5 */
    {
      id: "s05-hewan",
      label: "Hewan berpasangan",
      duration: 5,
      transitionIn: { type: "slideLeft", duration: 0.5 },
      layers: [
        { src: `${A}/sky-storm.webp`, depth: 0.05, filter: "brightness(1.15) saturate(0.8)" },
        { src: `${A}/clouds.png`, depth: 0.15, drift: { x: -30 }, opacity: 0.9, filter: "brightness(0.6)" },
        {
          src: `${A}/ark.png`,
          depth: 0.6,
          fit: "width",
          width: 1100,
          anchor: "bottom",
          offset: { x: 120, y: -330 },
        },
        {
          src: `${A}/animals.png`,
          depth: 1.2,
          fit: "width",
          width: 1250,
          anchor: "bottom",
          offset: { y: -40 },
          drift: { x: 45 },
          enter: { type: "slideRight", duration: 1 },
        },
      ],
      camera: { preset: "panLeft", strength: 0.8 },
      particles: [{ preset: "sand", count: 70, angle: 0, opacity: 0.6 }],
      narration: {
        text: "Hewan-hewan masuk *berpasangan*, bersama orang-orang yang beriman.",
        // audio: `${A}/audio/narasi-05.mp3`,
      },
      sfx: [{ src: `${A}/audio/wind.mp3`, at: 0, volume: 0.5, fadeIn: 0.5, fadeOut: 0.8, duration: 5 }],
    },

    /* ---------------------------------------------------------- 6 */
    {
      id: "s06-banjir",
      label: "Banjir besar",
      duration: 7,
      background: "#05080f",
      transitionIn: { type: "fadeBlack", duration: 0.6 },
      layers: [
        { src: `${A}/sky-storm.webp`, depth: 0.05 },
        { src: `${A}/clouds.png`, depth: 0.2, drift: { x: -60 }, filter: "brightness(0.45)" },
        { src: `${A}/waves-back.png`, depth: 0.5, drift: { x: -40 }, float: { amplitude: 18, speed: 0.35 } },
        {
          src: `${A}/ark.png`,
          depth: 0.8,
          fit: "width",
          width: 900,
          anchor: "center",
          offset: { y: 230 },
          float: { amplitude: 30, speed: 0.3, rotate: 4 },
        },
        { src: `${A}/waves-front.png`, depth: 1.3, drift: { x: -90 }, float: { amplitude: 26, speed: 0.45 } },
      ],
      camera: {
        preset: "orbitDrift",
        shake: { intensity: 9, speed: 1.2, rotation: 0.6 },
        bursts: [
          { at: 1.2, intensity: 40, duration: 0.8 },
          { at: 4.5, intensity: 34, duration: 0.8 },
        ],
      },
      particles: [
        { preset: "heavyRain", angle: 8 },
        { preset: "rain", count: 80, layer: "back", seed: "rain-back" },
      ],
      lights: [{ type: "flash", at: [1.2, 4.5], intensity: 0.8 }],
      grade: { tint: "#1f3d6b", tintOpacity: 0.35, tintBlend: "multiply", vignette: 0.75 },
      narration: {
        text: "Langit menumpahkan hujan, bumi memancarkan air. *Banjir besar* pun datang.",
        // audio: `${A}/audio/narasi-06.mp3`,
      },
      sfx: [
        { src: `${A}/audio/rain-loop.mp3`, at: 0, volume: 0.55, fadeIn: 0.4, fadeOut: 0.6, loop: true },
        { src: `${A}/audio/thunder.mp3`, at: 1.15, volume: 0.9 },
        { src: `${A}/audio/thunder.mp3`, at: 4.45, volume: 0.8 },
        { src: `${A}/audio/waves.mp3`, at: 0, volume: 0.5, loop: true, fadeOut: 0.6 },
      ],
    },

    /* ---------------------------------------------------------- 7 */
    {
      id: "s07-putra",
      label: "Putra yang menolak",
      duration: 6,
      background: "#05080f",
      transitionIn: { type: "crossfade", duration: 0.6 },
      layers: [
        { src: `${A}/sky-storm.webp`, depth: 0.05, filter: "brightness(0.8)" },
        { src: `${A}/mountain-peak.png`, depth: 0.45 },
        { src: `${A}/waves-back.png`, depth: 0.7, drift: { x: 30 }, float: { amplitude: 22, speed: 0.4 } },
        {
          src: `${A}/ark.png`,
          depth: 1,
          fit: "width",
          width: 620,
          anchor: "center",
          offset: { x: -230, y: 420 },
          float: { amplitude: 24, speed: 0.32, rotate: 5 },
          flipX: true,
        },
        { src: `${A}/waves-front.png`, depth: 1.35, drift: { x: 60 }, float: { amplitude: 30, speed: 0.5 } },
      ],
      camera: {
        keyframes: [
          { at: 0, zoom: 1.05, x: -60, y: 60 },
          { at: 0.6, zoom: 1.25, x: 60, y: -120 },
          { at: 1, zoom: 1.32, x: 70, y: -140 },
        ],
        easing: "easeInOutCubic",
        shake: { intensity: 6, speed: 1 },
      },
      particles: [{ preset: "rain", angle: -6 }],
      lights: [{ type: "flash", at: [3.8], intensity: 0.6 }],
      grade: { tint: "#203a5c", tintOpacity: 0.35, tintBlend: "multiply", vignette: 0.8 },
      narration: {
        text: "Putranya menolak naik, berlindung ke gunung, lalu ditelan *gelombang*.",
        // audio: `${A}/audio/narasi-07.mp3`,
      },
      sfx: [
        { src: `${A}/audio/rain-loop.mp3`, at: 0, volume: 0.45, loop: true, fadeOut: 0.8 },
        { src: `${A}/audio/waves.mp3`, at: 3.6, volume: 0.8, fadeOut: 1 },
        { src: `${A}/audio/thunder.mp3`, at: 3.75, volume: 0.6 },
      ],
    },

    /* ---------------------------------------------------------- 8 */
    {
      id: "s08-judi",
      label: "Berlabuh di Bukit Judi",
      duration: 5,
      transitionIn: { type: "circleReveal", duration: 0.8 },
      layers: [
        { src: `${A}/sky-dawn.webp`, depth: 0.05 },
        { src: `${A}/clouds.png`, depth: 0.12, drift: { x: 10 }, opacity: 0.5 },
        { src: `${A}/mount-judi.png`, depth: 0.5 },
      ],
      camera: { preset: "slowZoomOut" },
      particles: [
        { preset: "sparkles", count: 40 },
        { preset: "dust", count: 40, seed: "dawn-dust" },
      ],
      lights: [
        { type: "godRays", origin: { x: 50, y: 12 }, intensity: 0.6, rays: 18, rotateSpeed: 2 },
        { type: "glow", position: { x: 50, y: 12 }, radius: 520, intensity: 0.5 },
      ],
      overlay: { title: "Ikuti untuk kisah berikutnya", y: 22, style: "cta", start: 2.6 },
      narration: {
        text: "Bahtera berlabuh di *Bukit Judi*. Kesabaran selalu berbuah keselamatan.",
        // audio: `${A}/audio/narasi-08.mp3`,
      },
      sfx: [
        { src: `${A}/audio/chime.mp3`, at: 0.2, volume: 0.6 },
        { src: `${A}/audio/chime.mp3`, at: 2.6, volume: 0.4 },
      ],
    },
  ],
};
