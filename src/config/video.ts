/** Spesifikasi default YouTube Shorts */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  /** target durasi episode (detik) — hanya untuk peringatan di console */
  targetDurationSeconds: 45,
  /** batas aman YouTube Shorts (detik) */
  maxShortsSeconds: 180,
} as const;

/**
 * Safe area Shorts: area bawah tertutup judul/tombol, area kanan tertutup
 * tombol like/comment. Subtitle & teks penting sebaiknya di dalam area ini.
 */
export const SAFE_AREA = {
  top: 220,
  bottom: 420,
  left: 60,
  right: 160,
} as const;

export const DEFAULT_TRANSITION_SECONDS = 0.5;
