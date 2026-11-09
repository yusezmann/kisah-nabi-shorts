import React from "react";
import { AbsoluteFill, getRemotionEnvironment } from "remotion";
import { SAFE_AREA } from "../../config/video";

/** Garis bantu safe-area YouTube Shorts. Hanya tampil di Studio, tidak ikut render. */
export const SafeAreaGuide: React.FC = () => {
  if (getRemotionEnvironment().isRendering) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: SAFE_AREA.top,
          bottom: SAFE_AREA.bottom,
          left: SAFE_AREA.left,
          right: SAFE_AREA.right,
          border: "4px dashed rgba(0,255,170,0.8)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: SAFE_AREA.bottom,
          background: "rgba(255,0,80,0.18)",
          color: "#fff",
          fontSize: 30,
          fontFamily: "sans-serif",
          padding: 20,
        }}
      >
        Area UI YouTube (judul, channel, deskripsi)
      </div>
    </AbsoluteFill>
  );
};
