import React, { useMemo } from "react";
import { AbsoluteFill, random, useVideoConfig } from "remotion";
import { PARTICLE_PRESETS } from "../../config/presets";
import type { ParticleConfig } from "../../config/types";
import { useSceneTime } from "../scene/SceneContext";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (n: number, m: number) => ((n % m) + m) % m;

type Particle = {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  size: number;
  length: number;
  opacity: number;
  phase: number;
  twinkleSpeed: number;
  swayAmp: number;
};

/**
 * Sistem partikel deterministik (aman untuk render paralel Remotion):
 * posisi dihitung murni dari waktu + seed, tanpa state.
 */
export const Particles: React.FC<{ config: ParticleConfig }> = ({ config }) => {
  const { width, height } = useVideoConfig();
  const { t, sceneId } = useSceneTime();
  const preset = PARTICLE_PRESETS[config.preset];
  const count = config.count ?? preset.count;
  const speedMul = config.speed ?? 1;
  const sizeMul = config.size ?? 1;
  const seed = config.seed ?? `${sceneId}-${config.preset}`;
  const color = config.color ?? preset.color;
  const margin = 150;

  const particles = useMemo<Particle[]>(() => {
    const angleRad = ((config.angle ?? 0) * Math.PI) / 180;
    return new Array(count).fill(0).map((_, i) => {
      const r = (k: string) => random(`${seed}-${i}-${k}`);
      let vx = lerp(preset.velocity.x[0], preset.velocity.x[1], r("vx")) * speedMul;
      let vy = lerp(preset.velocity.y[0], preset.velocity.y[1], r("vy")) * speedMul;
      if (angleRad !== 0) {
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        [vx, vy] = [vx * cos - vy * sin, vx * sin + vy * cos];
      }
      return {
        x0: r("x") * (width + margin * 2),
        y0: r("y") * (height + margin * 2),
        vx,
        vy,
        size: lerp(preset.size[0], preset.size[1], r("s")) * sizeMul,
        length: preset.streakLength ? lerp(preset.streakLength[0], preset.streakLength[1], r("l")) : 0,
        opacity: lerp(preset.opacity[0], preset.opacity[1], r("o")),
        phase: r("p") * Math.PI * 2,
        twinkleSpeed: lerp(1.5, 4, r("tw")),
        swayAmp: (preset.sway ?? 0) * lerp(0.4, 1, r("sw")),
      };
    });
  }, [count, seed, preset, speedMul, sizeMul, width, height, config.angle]);

  // offset waktu agar partikel sudah tersebar sejak frame pertama
  const time = t + 20;
  const baseOpacity = config.opacity ?? 1;

  return (
    <AbsoluteFill style={{ mixBlendMode: preset.blend ?? "normal", pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const sway = p.swayAmp ? Math.sin(time * 0.8 + p.phase) * p.swayAmp : 0;
        const x = mod(p.x0 + p.vx * time + sway, width + margin * 2) - margin;
        const y = mod(p.y0 + p.vy * time, height + margin * 2) - margin;
        const twinkle = preset.twinkle
          ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * p.twinkleSpeed + p.phase))
          : 1;
        const opacity = p.opacity * twinkle * baseOpacity;

        if (preset.shape === "streak") {
          const angle = (Math.atan2(p.vy, p.vx) * 180) / Math.PI - 90;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: p.size,
                height: p.length,
                borderRadius: p.size,
                background: `linear-gradient(to bottom, transparent, ${color})`,
                opacity,
                transform: `rotate(${angle}deg)`,
              }}
            />
          );
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: preset.shape === "square" ? 2 : "50%",
              background: preset.shape === "ring" ? "transparent" : color,
              border: preset.shape === "ring" ? `2px solid ${color}` : undefined,
              boxShadow: preset.glow ? `0 0 ${preset.glow}px ${preset.glow / 2}px ${color}` : undefined,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
