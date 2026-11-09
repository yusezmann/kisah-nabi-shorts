import { VIDEO } from "../config/video";
import type { EpisodeConfig } from "../config/types";

/**
 * Validasi ringan konfigurasi episode. Error = render dihentikan,
 * warning = hanya ditampilkan di console.
 */
export const validateEpisode = (episode: EpisodeConfig, totalSeconds?: number) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!/^[a-zA-Z0-9-]+$/.test(episode.id)) {
    errors.push(`Episode id "${episode.id}" hanya boleh huruf, angka, dan tanda minus.`);
  }
  if (episode.scenes.length === 0) errors.push("Episode tidak punya scene.");

  const ids = new Set<string>();
  episode.scenes.forEach((s, i) => {
    const where = `Scene #${i + 1} (${s.id})`;
    if (ids.has(s.id)) errors.push(`${where}: id scene duplikat.`);
    ids.add(s.id);
    if (s.duration === "auto" && !s.narration?.audio) {
      errors.push(`${where}: duration "auto" membutuhkan narration.audio.`);
    }
    if (typeof s.duration === "number" && s.duration <= 0) {
      errors.push(`${where}: durasi harus > 0.`);
    }
    if (s.layers.length === 0) warnings.push(`${where}: tidak ada layer gambar.`);
    s.camera?.keyframes?.forEach((k, ki, arr) => {
      if (k.at < 0 || k.at > 1) errors.push(`${where}: keyframe kamera "at" harus 0..1.`);
      if (ki > 0 && k.at <= arr[ki - 1].at) errors.push(`${where}: keyframe kamera harus urut naik.`);
    });
    if (s.narration && typeof s.duration === "number") {
      const words = s.narration.text.split(/\s+/).filter(Boolean).length;
      const wps = words / s.duration;
      if (wps > 3.2) {
        warnings.push(
          `${where}: narasi ${words} kata dalam ${s.duration}s (${wps.toFixed(1)} kata/detik) — mungkin terlalu cepat dibaca.`,
        );
      }
    }
  });

  if (totalSeconds !== undefined) {
    if (totalSeconds > VIDEO.maxShortsSeconds) {
      warnings.push(`Durasi ${totalSeconds.toFixed(1)}s melebihi batas Shorts (${VIDEO.maxShortsSeconds}s).`);
    }
    const target =
      episode.targetDurationSeconds === undefined ? VIDEO.targetDurationSeconds : episode.targetDurationSeconds;
    if (target !== null && Math.abs(totalSeconds - target) > 0.5) {
      warnings.push(`Durasi total ${totalSeconds.toFixed(1)}s (target ${target}s). Abaikan jika memang disengaja.`);
    }
  }

  return { errors, warnings };
};
