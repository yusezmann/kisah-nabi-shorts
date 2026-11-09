import type { EpisodeConfig } from "../config/types";
import { GENERATED_EPISODES } from "./generated";
import { nabiNuh } from "./nabi-nuh";
// <new-episode-import-marker>

/**
 * DAFTAR EPISODE
 * Tambahkan episode baru di sini agar muncul di Remotion Studio & CLI.
 * (Script `npm run new-episode -- <slug>` melakukannya otomatis.)
 * Episode hasil pipeline otomatis (src/episodes/generated/) ikut didaftarkan.
 */
export const EPISODES: EpisodeConfig[] = [
  nabiNuh,
  // <new-episode-marker> (jangan hapus baris ini — dipakai script new-episode)
  ...GENERATED_EPISODES,
];
