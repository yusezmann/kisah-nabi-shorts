import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import type { ColorGradeConfig } from "../../config/types";

/** Tint warna, vignette, film grain, dan letterbox. Diletakkan di atas stage. */
export const ColorGrade: React.FC<{ grade?: ColorGradeConfig }> = ({ grade }) => {
  const frame = useCurrentFrame();
  if (!grade) return null;
  const { tint, tintOpacity = 0.25, tintBlend = "soft-light", vignette = 0, grain = 0, letterbox = 0 } = grade;

  // grain: pola noise SVG yang offset-nya berganti tiap frame (deterministik)
  const gx = Math.floor(random(`grain-x-${frame}`) * 200);
  const gy = Math.floor(random(`grain-y-${frame}`) * 200);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {tint ? (
        <AbsoluteFill style={{ background: tint, opacity: tintOpacity, mixBlendMode: tintBlend }} />
      ) : null}
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,${vignette}) 100%)`,
          }}
        />
      ) : null}
      {grain > 0 ? (
        <AbsoluteFill
          style={{
            opacity: grain * 0.35,
            mixBlendMode: "overlay",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
            backgroundPosition: `${gx}px ${gy}px`,
          }}
        />
      ) : null}
      {letterbox > 0 ? (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: letterbox, background: "#000" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: letterbox, background: "#000" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
