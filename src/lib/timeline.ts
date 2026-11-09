import { DEFAULT_TRANSITION_SECONDS, VIDEO } from "../config/video";
import type { EpisodeConfig, ResolvedScene, TransitionConfig } from "../config/types";

export const secondsToFrames = (seconds: number, fps: number) => Math.round(seconds * fps);

export const getEpisodeFormat = (episode: EpisodeConfig) => ({
  fps: episode.fps ?? VIDEO.fps,
  width: episode.width ?? VIDEO.width,
  height: episode.height ?? VIDEO.height,
});

/** Transisi efektif sebuah scene (scene pertama tidak punya transisi masuk kecuali fade). */
export const getTransition = (
  episode: EpisodeConfig,
  sceneIndex: number,
): Required<TransitionConfig> => {
  const scene = episode.scenes[sceneIndex];
  const t = scene.transitionIn ?? episode.theme.defaultTransition ?? { type: "crossfade" };
  return {
    type: t.type,
    duration: t.type === "none" ? 0 : t.duration ?? DEFAULT_TRANSITION_SECONDS,
  };
};

/**
 * Hitung timeline final.
 * Scene diletakkan berurutan; total durasi = jumlah durasi semua scene
 * (transisi TIDAK memotong durasi — transisi masuk menumpuk di atas akhir
 * scene sebelumnya).
 *
 * @param resolvedDurations durasi (detik) hasil calculateMetadata untuk scene "auto"
 */
export const buildTimeline = (
  episode: EpisodeConfig,
  resolvedDurations?: number[],
): ResolvedScene[] => {
  const { fps } = getEpisodeFormat(episode);
  let cursor = 0;

  return episode.scenes.map((scene, index) => {
    const seconds =
      resolvedDurations?.[index] ??
      (typeof scene.duration === "number" ? scene.duration : 5); // fallback bila "auto" belum terselesaikan
    const durationInFrames = Math.max(1, secondsToFrames(seconds, fps));
    const transition = getTransition(episode, index);
    // Transisi tidak boleh lebih panjang dari scene sebelumnya / scene ini
    const prevFrames = index === 0 ? 0 : secondsToFrames(
      resolvedDurations?.[index - 1] ??
        (typeof episode.scenes[index - 1].duration === "number"
          ? (episode.scenes[index - 1].duration as number)
          : 5),
      fps,
    );
    // Scene pertama tidak punya pre-roll (tidak ada scene sebelumnya untuk ditumpuki);
    // transisinya diputar sebagai intro di awal scene (lihat EpisodeVideo).
    const transitionFrames =
      index === 0
        ? 0
        : Math.floor(
            Math.min(secondsToFrames(transition.duration, fps), Math.min(prevFrames, durationInFrames) / 2),
          );

    const resolved: ResolvedScene = {
      ...scene,
      index,
      from: cursor,
      durationInFrames,
      durationInSeconds: durationInFrames / fps,
      transitionFrames,
    };
    cursor += durationInFrames;
    return resolved;
  });
};

export const getTotalFrames = (timeline: ResolvedScene[]) =>
  timeline.reduce((sum, s) => sum + s.durationInFrames, 0);
