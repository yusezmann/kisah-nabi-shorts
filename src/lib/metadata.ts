import type { CalculateMetadataFunction } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import type { EpisodeVideoProps } from "../config/types";
import { resolveAsset } from "./assets";
import { buildTimeline, getEpisodeFormat, getTotalFrames } from "./timeline";
import { validateEpisode } from "./validate";

/**
 * Dijalankan Remotion sebelum render / saat Studio dibuka:
 *  1. Menyelesaikan durasi scene "auto" dari panjang audio narasi.
 *  2. Menghitung total durasi video.
 *  3. Memvalidasi konfigurasi.
 */
export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeVideoProps> = async ({
  props,
}) => {
  const { episode } = props;
  const format = getEpisodeFormat(episode);

  // Panjang audio narasi tiap scene (dipakai juga untuk sinkron subtitle)
  const narrationSeconds = await Promise.all(
    episode.scenes.map(async (scene) => {
      if (!scene.narration?.audio) return null;
      try {
        return await getAudioDurationInSeconds(resolveAsset(scene.narration.audio));
      } catch (err) {
        throw new Error(
          `[${episode.id}] Gagal membaca audio narasi "${scene.narration.audio}" (scene ${scene.id}). ` +
            `Pastikan file ada di folder public/. ${(err as Error).message}`,
        );
      }
    }),
  );

  const resolvedDurations = episode.scenes.map((scene, i) => {
    if (typeof scene.duration === "number") return scene.duration;
    const audio = narrationSeconds[i];
    if (audio === null) return 5;
    return audio + (scene.narration?.delay ?? 0.25) + (scene.autoPadding ?? 0.6);
  });

  const timeline = buildTimeline(episode, resolvedDurations);
  const durationInFrames = getTotalFrames(timeline);
  const totalSeconds = durationInFrames / format.fps;

  const { errors, warnings } = validateEpisode(episode, totalSeconds);
  warnings.forEach((w) => console.warn(`[${episode.id}] ⚠ ${w}`));
  if (errors.length > 0) {
    throw new Error(`[${episode.id}] Konfigurasi tidak valid:\n- ${errors.join("\n- ")}`);
  }

  return {
    durationInFrames,
    fps: format.fps,
    width: format.width,
    height: format.height,
    props: { ...props, resolvedDurations, narrationSeconds },
  };
};
