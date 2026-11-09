import React from "react";
import { AbsoluteFill } from "remotion";
import type { ParallaxLayerConfig } from "../../config/types";
import { ParallaxLayer } from "./ParallaxLayer";

type Props = {
  layers: ParallaxLayerConfig[];
  /** Hanya render layer dengan depth dalam rentang ini (untuk menyisipkan partikel di antara layer) */
  depthRange?: [number, number];
};

/**
 * Menumpuk layer sesuai urutan di config (urutan pertama = paling belakang).
 */
export const ParallaxBackground: React.FC<Props> = ({ layers, depthRange }) => {
  const visible = depthRange
    ? layers.filter((l) => l.depth >= depthRange[0] && l.depth < depthRange[1])
    : layers;
  return (
    <AbsoluteFill>
      {visible.map((layer, i) => (
        <ParallaxLayer key={`${layer.src}-${i}`} layer={layer} />
      ))}
    </AbsoluteFill>
  );
};
