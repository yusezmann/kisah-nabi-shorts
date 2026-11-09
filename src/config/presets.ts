import type {
  CameraKeyframe,
  CameraPresetName,
  ParticlePresetName,
} from "./types";

/* ------------------------------------------------------------------ */
/*  PRESET KAMERA                                                      */
/* ------------------------------------------------------------------ */
/** Nilai dasar untuk strength = 1. Nilai x/y dalam px. */
export const CAMERA_PRESETS: Record<CameraPresetName, CameraKeyframe[]> = {
  static: [
    { at: 0, zoom: 1.02 },
    { at: 1, zoom: 1.02 },
  ],
  slowZoomIn: [
    { at: 0, zoom: 1.0 },
    { at: 1, zoom: 1.15 },
  ],
  slowZoomOut: [
    { at: 0, zoom: 1.18 },
    { at: 1, zoom: 1.0 },
  ],
  dramaticPush: [
    { at: 0, zoom: 1.0, y: 0 },
    { at: 0.7, zoom: 1.22, y: -20 },
    { at: 1, zoom: 1.3, y: -30 },
  ],
  panLeft: [
    { at: 0, zoom: 1.1, x: 90 },
    { at: 1, zoom: 1.1, x: -90 },
  ],
  panRight: [
    { at: 0, zoom: 1.1, x: -90 },
    { at: 1, zoom: 1.1, x: 90 },
  ],
  panUp: [
    { at: 0, zoom: 1.1, y: 120 },
    { at: 1, zoom: 1.1, y: -120 },
  ],
  panDown: [
    { at: 0, zoom: 1.1, y: -120 },
    { at: 1, zoom: 1.1, y: 120 },
  ],
  riseReveal: [
    { at: 0, zoom: 1.25, y: 160 },
    { at: 1, zoom: 1.05, y: -40 },
  ],
  orbitDrift: [
    { at: 0, zoom: 1.08, x: -40, rotate: -1.2 },
    { at: 0.5, zoom: 1.14, x: 0, rotate: 0 },
    { at: 1, zoom: 1.08, x: 40, rotate: 1.2 },
  ],
};

/* ------------------------------------------------------------------ */
/*  PRESET PARTIKEL                                                    */
/* ------------------------------------------------------------------ */
export type ParticlePreset = {
  count: number;
  color: string;
  /** rentang ukuran px */
  size: [number, number];
  /** kecepatan px/detik (sumbu y positif = turun) */
  velocity: { x: [number, number]; y: [number, number] };
  /** bentuk partikel */
  shape: "circle" | "streak" | "ring" | "square";
  /** panjang streak (px) untuk hujan */
  streakLength?: [number, number];
  /** goyangan horizontal (px) */
  sway?: number;
  /** kedip */
  twinkle?: boolean;
  glow?: number; // blur glow px
  opacity: [number, number];
  /** blend mode */
  blend?: "screen" | "normal" | "lighten";
};

export const PARTICLE_PRESETS: Record<ParticlePresetName, ParticlePreset> = {
  dust: {
    count: 60,
    color: "#fff3d6",
    size: [2, 6],
    velocity: { x: [-8, 8], y: [-14, -4] },
    shape: "circle",
    sway: 18,
    twinkle: true,
    glow: 4,
    opacity: [0.25, 0.7],
    blend: "screen",
  },
  embers: {
    count: 55,
    color: "#ffae42",
    size: [3, 8],
    velocity: { x: [-20, 20], y: [-120, -50] },
    shape: "circle",
    sway: 30,
    twinkle: true,
    glow: 10,
    opacity: [0.5, 1],
    blend: "screen",
  },
  rain: {
    count: 140,
    color: "#cfe3ff",
    size: [1.5, 2.5],
    velocity: { x: [-80, -40], y: [1300, 1700] },
    shape: "streak",
    streakLength: [40, 80],
    opacity: [0.25, 0.55],
  },
  heavyRain: {
    count: 260,
    color: "#d8e8ff",
    size: [2, 3.5],
    velocity: { x: [-260, -160], y: [1900, 2500] },
    shape: "streak",
    streakLength: [70, 130],
    opacity: [0.3, 0.7],
  },
  sparkles: {
    count: 45,
    color: "#fff7c2",
    size: [3, 9],
    velocity: { x: [-6, 6], y: [-20, -6] },
    shape: "circle",
    twinkle: true,
    glow: 14,
    opacity: [0.4, 1],
    blend: "screen",
  },
  fireflies: {
    count: 30,
    color: "#d9ff8a",
    size: [4, 8],
    velocity: { x: [-15, 15], y: [-15, 15] },
    shape: "circle",
    sway: 60,
    twinkle: true,
    glow: 16,
    opacity: [0.3, 0.95],
    blend: "screen",
  },
  snow: {
    count: 90,
    color: "#ffffff",
    size: [3, 9],
    velocity: { x: [-20, 20], y: [60, 140] },
    shape: "circle",
    sway: 40,
    opacity: [0.5, 0.95],
  },
  bubbles: {
    count: 35,
    color: "#bff4ff",
    size: [8, 26],
    velocity: { x: [-10, 10], y: [-140, -60] },
    shape: "ring",
    sway: 25,
    opacity: [0.3, 0.7],
  },
  sand: {
    count: 120,
    color: "#e9c27a",
    size: [1.5, 4],
    velocity: { x: [250, 450], y: [-20, 30] },
    shape: "circle",
    sway: 10,
    opacity: [0.3, 0.75],
  },
};
