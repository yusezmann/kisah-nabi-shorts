import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, useVideoConfig } from "remotion";
import type { ParallaxLayerConfig } from "../../config/types";
import { resolveAsset } from "../../lib/assets";
import { useCamera } from "../camera/useCamera";
import { useSceneTime } from "../scene/SceneContext";

/** Overscan default untuk layer full-screen supaya pan/zoom tidak memperlihatkan tepi. */
const COVER_OVERSCAN = 1.14;

const useEnterAnimation = (layer: ParallaxLayerConfig, t: number) => {
  const enter = layer.enter;
  if (!enter) return { opacity: 1, transform: "" };
  const delay = (enter.delay ?? 0) + (layer.start ?? 0);
  const dur = enter.duration ?? 0.8;
  const p = interpolate(t, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const inv = 1 - p;
  switch (enter.type) {
    case "fade":
      return { opacity: p, transform: "" };
    case "rise":
      return { opacity: p, transform: `translateY(${inv * 220}px)` };
    case "fall":
      return { opacity: p, transform: `translateY(${-inv * 220}px)` };
    case "zoom":
      return { opacity: p, transform: `scale(${0.75 + 0.25 * p})` };
    case "slideLeft":
      return { opacity: p, transform: `translateX(${inv * 450}px)` };
    case "slideRight":
      return { opacity: p, transform: `translateX(${-inv * 450}px)` };
    default:
      return { opacity: 1, transform: "" };
  }
};

/** Opacity berdasarkan jendela start/end layer (fade 0.3 detik). */
const visibilityOpacity = (layer: ParallaxLayerConfig, t: number) => {
  const fade = 0.3;
  let o = 1;
  if (layer.start !== undefined && !layer.enter) {
    o *= interpolate(t, [layer.start, layer.start + fade], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (layer.end !== undefined) {
    o *= interpolate(t, [layer.end - fade, layer.end], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return o;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

export const ParallaxLayer: React.FC<{ layer: ParallaxLayerConfig }> = ({ layer }) => {
  const camera = useCamera();
  const { t } = useSceneTime();
  const { width, height } = useVideoConfig();

  const depth = layer.depth;
  const fit = layer.fit ?? "cover";
  const src = resolveAsset(layer.src);

  // --- Parallax: geser & zoom sebanding dengan depth ---
  const parallaxX = -camera.x * depth;
  const parallaxY = -camera.y * depth;
  const parallaxScale = 1 + (camera.zoom - 1) * (0.35 + 0.65 * depth);

  // --- Gerak mandiri layer ---
  const driftX = (layer.drift?.x ?? 0) * Math.max(t, 0);
  const driftY = (layer.drift?.y ?? 0) * Math.max(t, 0);
  const floatSpeed = layer.float?.speed ?? 0.4;
  const floatPhase = Math.max(t, -1) * floatSpeed * Math.PI * 2;
  const floatY = layer.float ? Math.sin(floatPhase) * layer.float.amplitude : 0;
  const floatRot = layer.float?.rotate ? Math.sin(floatPhase + 0.8) * layer.float.rotate : 0;

  const enter = useEnterAnimation(layer, t);
  const opacity = (layer.opacity ?? 1) * enter.opacity * visibilityOpacity(layer, t);
  if (opacity <= 0.001) return null;

  const filter = [layer.blur ? `blur(${layer.blur}px)` : "", layer.filter ?? ""]
    .filter(Boolean)
    .join(" ");
  const flip = layer.flipX ? " scaleX(-1)" : "";
  const extraScale = layer.scale ?? 1;

  let content: React.ReactNode;

  if (fit === "width") {
    // ---------- Sprite (karakter, bahtera, hewan) ----------
    const spriteWidth = layer.width ?? width * 0.6;
    const anchor = layer.anchor ?? "bottom";
    const ox = layer.offset?.x ?? 0;
    const oy = layer.offset?.y ?? 0;
    const vertical: React.CSSProperties =
      anchor === "bottom"
        ? { bottom: -oy }
        : anchor === "top"
          ? { top: oy }
          : { top: "50%" };
    const centerY = anchor === "center" ? "translateY(-50%)" : "";
    content = (
      <Img
        src={src}
        style={{
          position: "absolute",
          left: "50%",
          width: spriteWidth,
          height: "auto",
          ...vertical,
          transform: `translateX(-50%) ${centerY} translate(${ox + driftX}px, ${(anchor === "center" ? oy : 0) + driftY + floatY}px) rotate(${floatRot}deg) scale(${extraScale})${flip}`,
          transformOrigin: anchor === "bottom" ? "50% 100%" : "50% 50%",
          filter: filter || undefined,
        }}
      />
    );
  } else if (layer.drift?.x && fit === "cover") {
    // ---------- Background bergerak horizontal tanpa batas (mirror tiling) ----------
    const tileW = width * COVER_OVERSCAN * extraScale;
    const shift = mod(driftX, tileW * 2);
    content = (
      <AbsoluteFill
        style={{
          transform: `translateY(${driftY + floatY}px) rotate(${floatRot}deg)`,
          filter: filter || undefined,
        }}
      >
        {[-2, -1, 0, 1].map((k) => (
          <Img
            key={k}
            src={src}
            style={{
              position: "absolute",
              top: (height - height * COVER_OVERSCAN * extraScale) / 2,
              left: (width - tileW) / 2 + k * tileW + shift,
              width: tileW,
              height: height * COVER_OVERSCAN * extraScale,
              objectFit: "cover",
              transform: mod(k, 2) === 1 ? "scaleX(-1)" : undefined,
            }}
          />
        ))}
      </AbsoluteFill>
    );
  } else {
    // ---------- Background statis (cover / contain) ----------
    const s = (fit === "cover" ? COVER_OVERSCAN : 1) * extraScale;
    content = (
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: fit === "contain" ? "contain" : "cover",
          transform: `translate(${(layer.offset?.x ?? 0) + driftX}px, ${(layer.offset?.y ?? 0) + driftY + floatY}px) rotate(${floatRot}deg) scale(${s})${flip}`,
          filter: filter || undefined,
        }}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: layer.blendMode ?? "normal",
        transform: `translate(${parallaxX}px, ${parallaxY}px) scale(${parallaxScale}) ${enter.transform}`,
        transformOrigin: "50% 50%",
      }}
    >
      {content}
    </AbsoluteFill>
  );
};
