import React, { useMemo } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import type { NarrationConfig, SubtitleTheme } from "../../config/types";
import { SAFE_AREA } from "../../config/video";
import { buildSubtitleChunks } from "../../lib/subtitles";
import { useSceneTime } from "../scene/SceneContext";

type Props = {
  narration: NarrationConfig;
  theme: SubtitleTheme;
  /** panjang audio narasi (detik) bila diketahui — untuk sinkron otomatis */
  narrationSeconds?: number | null;
};

/**
 * Subtitle animasi yang mengikuti narasi.
 *  - karaoke    : kata yang sedang diucapkan menyala & membesar
 *  - pop        : tiap potongan muncul dengan efek pegas
 *  - typewriter : kata muncul satu per satu
 * Kata yang ditandai *bintang* di teks narasi memakai warna aksen.
 */
export const AnimatedSubtitle: React.FC<Props> = ({ narration, theme, narrationSeconds }) => {
  const { t, sceneSeconds } = useSceneTime();
  const { fps, width, height } = useVideoConfig();

  const chunks = useMemo(
    () => buildSubtitleChunks(narration, sceneSeconds, narrationSeconds ?? undefined),
    [narration, sceneSeconds, narrationSeconds],
  );

  const chunk = chunks.find((c) => t >= c.start && t < c.end);
  if (!chunk || narration.hideSubtitle) return null;

  const animation = theme.animation ?? "karaoke";
  const fontSize = theme.fontSize ?? 76;
  const color = theme.color ?? "#ffffff";
  const activeColor = theme.activeColor ?? "#ffd54a";
  const accentColor = theme.accentColor ?? "#7fe3ff";
  const strokeColor = theme.strokeColor ?? "#000000";
  const strokeWidth = theme.strokeWidth ?? 10;
  const y = theme.y ?? 70;
  const maxWidth = theme.maxWidth ?? width - SAFE_AREA.left - SAFE_AREA.right;

  // animasi masuk potongan
  const sinceStart = (t - chunk.start) * fps;
  const enter = spring({ frame: sinceStart, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } });
  const exit = interpolate(t, [chunk.end - 0.12, chunk.end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chunkScale = animation === "typewriter" ? 1 : 0.7 + 0.3 * enter;
  const chunkY = animation === "typewriter" ? 0 : (1 - enter) * 40;

  // hindari area UI bawah YouTube
  const top = Math.min((y / 100) * height, height - SAFE_AREA.bottom);

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_AREA.left,
        width: maxWidth,
        top,
        transform: `translateY(-50%) translateY(${chunkY}px) scale(${chunkScale})`,
        opacity: exit * Math.min(1, enter * 1.5),
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: `${fontSize * 0.08}px ${fontSize * 0.26}px`,
          padding: theme.background && theme.background !== "none" ? "18px 34px" : 0,
          borderRadius: 28,
          background: theme.background && theme.background !== "none" ? theme.background : undefined,
          fontFamily: theme.fontFamily,
          fontWeight: theme.fontWeight ?? 800,
          fontSize,
          lineHeight: 1.15,
          textAlign: "center",
          textTransform: theme.uppercase ? "uppercase" : "none",
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.start && t < w.end;
          const spoken = t >= w.end;
          const wordEnter = spring({
            frame: (t - w.start) * fps,
            fps,
            config: { damping: 14, stiffness: 220, mass: 0.5 },
          });

          let wordColor = w.highlight ? accentColor : color;
          let scale = 1;
          let opacity = 1;

          if (animation === "karaoke") {
            if (active) {
              wordColor = w.highlight ? accentColor : activeColor;
              scale = 1 + 0.12 * wordEnter;
            } else if (!spoken) {
              opacity = 0.55;
            }
          } else if (animation === "typewriter") {
            opacity = t >= w.start ? 1 : 0;
            scale = t >= w.start ? 0.85 + 0.15 * wordEnter : 1;
          }

          return (
            <span
              key={`${w.text}-${i}`}
              style={{
                display: "inline-block",
                color: wordColor,
                opacity,
                transform: `scale(${scale})`,
                WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
                paintOrder: "stroke fill",
                textShadow: `0 6px 18px rgba(0,0,0,0.55)${w.highlight ? `, 0 0 28px ${accentColor}` : ""}`,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
