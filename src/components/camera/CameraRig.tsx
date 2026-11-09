import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { CameraConfig } from "../../config/types";
import { CameraContext, computeCamera, computeShake } from "./useCamera";

type Props = {
  config?: CameraConfig;
  /** durasi total scene dalam frame (termasuk pre-roll transisi) */
  durationInFrames: number;
  /** frame pre-roll (transisi) — waktu konten dihitung setelah ini */
  preRollFrames?: number;
  seed: string;
  children: React.ReactNode;
};

/**
 * CameraRig = "kamera virtual" sebuah scene.
 *  - Zoom & pan diteruskan via Context ke tiap ParallaxLayer, yang menerapkannya
 *    sesuai `depth` (inilah yang menghasilkan efek parallax).
 *  - Shake & rotasi diterapkan ke seluruh stage.
 */
export const CameraRig: React.FC<Props> = ({
  config,
  durationInFrames,
  preRollFrames = 0,
  seed,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);
  const t = (frame - preRollFrames) / fps;

  const camera = useMemo(() => computeCamera(config, progress), [config, progress]);
  const shake = useMemo(() => computeShake(config, t, seed), [config, t, seed]);

  const contextValue = useMemo(
    () => ({ ...camera, zoom: camera.zoom + shake.zoom }),
    [camera, shake.zoom],
  );

  return (
    <CameraContext.Provider value={contextValue}>
      <AbsoluteFill
        style={{
          // scale 1.04 = overscan agar tepi tidak terlihat saat shake/rotate
          transform: `translate(${shake.x}px, ${shake.y}px) rotate(${camera.rotate + shake.rotate}deg) scale(1.04)`,
          transformOrigin: "50% 50%",
        }}
      >
        {children}
      </AbsoluteFill>
    </CameraContext.Provider>
  );
};
