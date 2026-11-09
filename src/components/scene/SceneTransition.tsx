import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import type { TransitionType } from "../../config/types";

type Props = {
  type: TransitionType;
  /** panjang transisi (frame) di awal Sequence */
  frames: number;
  children: React.ReactNode;
};

/**
 * Membungkus scene dengan animasi transisi MASUK.
 * Scene sebelumnya tetap dirender di bawahnya selama transisi berlangsung,
 * sehingga crossfade / slide terlihat mulus.
 */
export const SceneTransition: React.FC<Props> = ({ type, frames, children }) => {
  const frame = useCurrentFrame();
  if (type === "none" || frames <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;

  const p = interpolate(frame, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  let style: React.CSSProperties = {};
  let overlay: React.ReactNode = null;

  switch (type) {
    case "fade":
    case "crossfade":
      style = { opacity: p };
      break;
    case "fadeBlack": {
      // paruh pertama: gelap menutup scene lama, paruh kedua: scene baru muncul
      const dark = interpolate(p, [0, 0.5, 1], [0, 1, 0]);
      style = { opacity: p < 0.5 ? 0 : 1 };
      overlay = <AbsoluteFill style={{ background: "#000", opacity: dark }} />;
      break;
    }
    case "flashWhite": {
      const white = interpolate(p, [0, 0.45, 1], [0, 1, 0]);
      style = { opacity: p < 0.45 ? 0 : 1 };
      overlay = <AbsoluteFill style={{ background: "#fff8e6", opacity: white }} />;
      break;
    }
    case "slideUp":
      style = { transform: `translateY(${(1 - p) * 100}%)` };
      break;
    case "slideLeft":
      style = { transform: `translateX(${(1 - p) * 100}%)` };
      break;
    case "zoomBlur":
      style = {
        opacity: p,
        transform: `scale(${1.35 - 0.35 * p})`,
        filter: `blur(${(1 - p) * 24}px)`,
      };
      break;
    case "circleReveal": {
      const r = p * 120;
      style = {
        clipPath: `circle(${r}% at 50% 50%)`,
      };
      break;
    }
    default:
      break;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {overlay}
    </AbsoluteFill>
  );
};
