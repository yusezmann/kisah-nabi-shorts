import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import type { LightConfig } from "../../config/types";
import { useSceneTime } from "../scene/SceneContext";

/* ----------------------------- God rays ----------------------------- */
const GodRays: React.FC<{ light: Extract<LightConfig, { type: "godRays" }> }> = ({ light }) => {
  const { t } = useSceneTime();
  const origin = light.origin ?? { x: 50, y: -5 };
  const color = light.color ?? "rgba(255, 236, 190, 1)";
  const intensity = light.intensity ?? 0.5;
  const rays = light.rays ?? 14;
  const spread = light.spread ?? 70; // derajat lebar kipas
  const rotation = (light.rotateSpeed ?? 1.5) * t;
  const breathe = 0.85 + 0.15 * Math.sin(t * 1.3);

  const step = 360 / rays;
  const beam = step * 0.35;

  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          background: `repeating-conic-gradient(from ${rotation - spread / 2}deg at ${50 + (origin.x - 50) / 2}% ${50 + (origin.y - 50) / 2}%, ${color} 0deg, transparent ${beam}deg, transparent ${step}deg)`,
          WebkitMaskImage: `radial-gradient(circle at ${50 + (origin.x - 50) / 2}% ${50 + (origin.y - 50) / 2}%, black 0%, rgba(0,0,0,0.6) 25%, transparent 55%)`,
          maskImage: `radial-gradient(circle at ${50 + (origin.x - 50) / 2}% ${50 + (origin.y - 50) / 2}%, black 0%, rgba(0,0,0,0.6) 25%, transparent 55%)`,
          filter: "blur(18px)",
          opacity: intensity * breathe,
        }}
      />
      {/* inti cahaya */}
      <div
        style={{
          position: "absolute",
          left: `${origin.x}%`,
          top: `${origin.y}%`,
          width: 900,
          height: 900,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
          opacity: intensity * 0.8,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------- Glow -------------------------------- */
const Glow: React.FC<{ light: Extract<LightConfig, { type: "glow" }> }> = ({ light }) => {
  const { t } = useSceneTime();
  const pos = light.position ?? { x: 50, y: 50 };
  const radius = light.radius ?? 500;
  const pulse = light.pulse ?? 0.15;
  const k = 1 - pulse + pulse * Math.sin(t * (light.pulseSpeed ?? 1.5) * Math.PI);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: radius * 2,
          height: radius * 2,
          transform: `translate(-50%, -50%) scale(${0.95 + 0.05 * k})`,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${light.color ?? "rgba(255,240,200,1)"} 0%, transparent 65%)`,
          opacity: (light.intensity ?? 0.6) * k,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------ Kilat -------------------------------- */
const Flash: React.FC<{ light: Extract<LightConfig, { type: "flash" }> }> = ({ light }) => {
  const { t } = useSceneTime();
  const dur = light.duration ?? 0.5;
  let o = 0;
  for (const at of light.at) {
    const dt = t - at;
    if (dt < 0 || dt > dur) continue;
    // pola kilat ganda: terang - redup - terang - pudar
    const v = interpolate(
      dt / dur,
      [0, 0.06, 0.16, 0.24, 0.34, 1],
      [0, 1, 0.25, 0.85, 0.5, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    o = Math.max(o, v);
  }
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: light.color ?? "rgba(220,235,255,1)",
        opacity: o * (light.intensity ?? 0.75),
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

/* ---------------------------- Lens flare ----------------------------- */
const LensFlare: React.FC<{ light: Extract<LightConfig, { type: "lensFlare" }> }> = ({ light }) => {
  const { t } = useSceneTime();
  const { width, height } = useVideoConfig();
  const pos = light.position ?? { x: 75, y: 15 };
  const px = (pos.x / 100) * width;
  const py = (pos.y / 100) * height;
  const cx = width / 2;
  const cy = height / 2;
  const color = light.color ?? "rgba(255,220,160,1)";
  const intensity = (light.intensity ?? 0.5) * (0.9 + 0.1 * Math.sin(t * 2));
  const ghosts = [
    { k: 0.0, r: 260, o: 0.9 },
    { k: 0.5, r: 60, o: 0.35 },
    { k: 0.9, r: 120, o: 0.2 },
    { k: 1.3, r: 40, o: 0.35 },
    { k: 1.7, r: 180, o: 0.12 },
  ];
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {ghosts.map((g, i) => {
        const x = px + (cx - px) * g.k;
        const y = py + (cy - py) * g.k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - g.r,
              top: y - g.r,
              width: g.r * 2,
              height: g.r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              opacity: g.o * intensity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Lights: React.FC<{ lights: LightConfig[] }> = ({ lights }) => (
  <>
    {lights.map((light, i) => {
      switch (light.type) {
        case "godRays":
          return <GodRays key={i} light={light} />;
        case "glow":
          return <Glow key={i} light={light} />;
        case "flash":
          return <Flash key={i} light={light} />;
        case "lensFlare":
          return <LensFlare key={i} light={light} />;
        default:
          return null;
      }
    })}
  </>
);
