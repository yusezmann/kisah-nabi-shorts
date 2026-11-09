import { createContext, useContext } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export type SceneTiming = {
  /** frame pre-roll (bagian transisi yang tumpang tindih dengan scene sebelumnya) */
  preRollFrames: number;
  /** durasi konten scene dalam detik (tanpa pre-roll) */
  sceneSeconds: number;
  sceneIndex: number;
  sceneId: string;
};

export const SceneContext = createContext<SceneTiming>({
  preRollFrames: 0,
  sceneSeconds: 1,
  sceneIndex: 0,
  sceneId: "scene",
});

/**
 * Waktu lokal scene dalam DETIK.
 * t = 0 tepat saat scene "resmi" dimulai (setelah transisi masuk).
 * Nilai negatif = sedang dalam transisi masuk.
 */
export const useSceneTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = useContext(SceneContext);
  const t = (frame - timing.preRollFrames) / fps;
  return { ...timing, t, frame, fps };
};
