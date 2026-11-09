import { createContext, useContext } from "react";
import { interpolate } from "remotion";
import { noise2D } from "@remotion/noise";
import { CAMERA_PRESETS } from "../../config/presets";
import type { CameraConfig, CameraKeyframe } from "../../config/types";
import { getEasing } from "../../lib/easing";

export type CameraState = {
  zoom: number;
  x: number;
  y: number;
  rotate: number;
};

export const NEUTRAL_CAMERA: CameraState = { zoom: 1, x: 0, y: 0, rotate: 0 };

/** Context: layer parallax membaca posisi kamera dari sini. */
export const CameraContext = createContext<CameraState>(NEUTRAL_CAMERA);
export const useCamera = () => useContext(CameraContext);

const scaleKeyframe = (k: CameraKeyframe, strength: number): Required<CameraKeyframe> => ({
  at: k.at,
  zoom: 1 + ((k.zoom ?? 1) - 1) * strength,
  x: (k.x ?? 0) * strength,
  y: (k.y ?? 0) * strength,
  rotate: (k.rotate ?? 0) * strength,
});

/**
 * Hitung posisi kamera (tanpa shake) pada progres tertentu.
 * @param progress 0..1 progres scene
 */
export const computeCamera = (config: CameraConfig | undefined, progress: number): CameraState => {
  if (!config) return { ...NEUTRAL_CAMERA, zoom: 1.02 };
  const raw = config.keyframes ?? CAMERA_PRESETS[config.preset ?? "slowZoomIn"];
  const strength = config.keyframes ? 1 : config.strength ?? 1;
  const kfs = raw.map((k) => scaleKeyframe(k, strength));

  if (kfs.length === 1) {
    const k = kfs[0];
    return { zoom: k.zoom, x: k.x, y: k.y, rotate: k.rotate };
  }

  const ats = kfs.map((k) => k.at);
  const easing = getEasing(config.easing ?? "easeInOutSine");
  const opts = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing,
  };
  return {
    zoom: interpolate(progress, ats, kfs.map((k) => k.zoom), opts),
    x: interpolate(progress, ats, kfs.map((k) => k.x), opts),
    y: interpolate(progress, ats, kfs.map((k) => k.y), opts),
    rotate: interpolate(progress, ats, kfs.map((k) => k.rotate), opts),
  };
};

/**
 * Hitung offset getaran (shake + bursts) pada detik `t` dalam scene.
 * Memakai Perlin noise sehingga getaran halus & deterministik saat render.
 */
export const computeShake = (
  config: CameraConfig | undefined,
  t: number,
  seed: string,
): CameraState => {
  const out = { zoom: 0, x: 0, y: 0, rotate: 0 };
  if (!config) return out;

  const { shake, bursts } = config;
  if (shake && shake.intensity > 0) {
    const start = shake.start ?? 0;
    const end = shake.end ?? Number.POSITIVE_INFINITY;
    // fade in/out 0.3 detik agar tidak patah
    const envelope =
      t < start || t > end
        ? 0
        : Math.min(1, (t - start) / 0.3, Number.isFinite(end) ? (end - t) / 0.3 : 1);
    const speed = (shake.speed ?? 1) * 2.2;
    out.x += noise2D(`${seed}-sx`, t * speed, 0) * shake.intensity * envelope;
    out.y += noise2D(`${seed}-sy`, 0, t * speed) * shake.intensity * envelope;
    out.rotate += noise2D(`${seed}-sr`, t * speed, t) * (shake.rotation ?? 0) * envelope;
  }

  bursts?.forEach((b, i) => {
    const dt = t - b.at;
    const dur = b.duration ?? 0.6;
    if (dt < 0 || dt > dur) return;
    const decay = Math.pow(1 - dt / dur, 2);
    const amp = (b.intensity ?? 30) * decay;
    const f = 18; // frekuensi tinggi untuk impact
    out.x += noise2D(`${seed}-b${i}x`, dt * f, 0) * amp;
    out.y += noise2D(`${seed}-b${i}y`, 0, dt * f) * amp;
    out.rotate += noise2D(`${seed}-b${i}r`, dt * f, dt) * amp * 0.03;
    out.zoom += 0.02 * decay;
  });

  return out;
};
