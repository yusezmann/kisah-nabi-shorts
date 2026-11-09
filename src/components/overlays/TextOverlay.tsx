import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import type { TextOverlayConfig } from "../../config/types";
import { SAFE_AREA } from "../../config/video";
import { useSceneTime } from "../scene/SceneContext";

type Props = {
  overlay: TextOverlayConfig;
  fontFamily: string;
  accentColor: string;
};

const STYLES = {
  hero: { title: 120, subtitle: 50, weight: 900, letter: 2 },
  chapter: { title: 84, subtitle: 44, weight: 800, letter: 6 },
  cta: { title: 72, subtitle: 46, weight: 800, letter: 1 },
  arabic: { title: 110, subtitle: 44, weight: 700, letter: 0 },
} as const;

/** Judul episode, judul bab, ayat/teks Arab, atau call-to-action. */
export const TextOverlay: React.FC<Props> = ({ overlay, fontFamily, accentColor }) => {
  const { t, sceneSeconds } = useSceneTime();
  const { fps, width, height } = useVideoConfig();
  const start = overlay.start ?? 0.2;
  const end = overlay.end ?? sceneSeconds;
  if (t < start || t > end) return null;

  const style = STYLES[overlay.style ?? "hero"];
  const enter = spring({ frame: (t - start) * fps, fps, config: { damping: 14, stiffness: 120 } });
  const sub = spring({ frame: (t - start - 0.35) * fps, fps, config: { damping: 16, stiffness: 120 } });
  const exit = interpolate(t, [end - 0.35, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(enter, [0, 1], [0, 320]);
  const isCta = overlay.style === "cta";

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_AREA.left,
        width: width - SAFE_AREA.left - SAFE_AREA.right,
        top: ((overlay.y ?? 30) / 100) * height,
        transform: "translateY(-50%)",
        textAlign: "center",
        opacity: exit,
        fontFamily,
        direction: overlay.style === "arabic" ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          display: "inline-block",
          fontSize: style.title,
          fontWeight: style.weight,
          letterSpacing: style.letter,
          lineHeight: 1.05,
          color: "#fff",
          transform: `scale(${0.6 + 0.4 * enter}) translateY(${(1 - enter) * 60}px)`,
          opacity: enter,
          textShadow: `0 0 40px ${accentColor}, 0 8px 24px rgba(0,0,0,0.7)`,
          padding: isCta ? "22px 44px" : 0,
          borderRadius: isCta ? 999 : 0,
          background: isCta ? `linear-gradient(135deg, ${accentColor}, #ff8a3d)` : undefined,
        }}
      >
        {overlay.title}
      </div>
      {!isCta ? (
        <div
          style={{
            height: 6,
            width: lineWidth,
            margin: "26px auto",
            borderRadius: 3,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
        />
      ) : (
        <div style={{ height: 28 }} />
      )}
      {overlay.subtitle ? (
        <div
          style={{
            fontSize: style.subtitle,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: 3,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 30}px)`,
            textShadow: "0 4px 16px rgba(0,0,0,0.8)",
          }}
        >
          {overlay.subtitle}
        </div>
      ) : null}
    </div>
  );
};
