/**
 * ============================================================
 *  TIPE DATA EPISODE & SCENE
 * ============================================================
 * Semua video dibangun dari data. Untuk membuat episode baru,
 * Anda cukup membuat object `EpisodeConfig` baru (lihat
 * src/episodes/_template.ts) — tidak perlu menyentuh komponen.
 *
 * Konvensi satuan:
 *  - Waktu  : DETIK (bukan frame). Dikonversi otomatis memakai FPS.
 *  - Posisi : piksel pada kanvas 1080x1920, atau persen (0-100) bila disebutkan.
 *  - Path aset: relatif terhadap folder `public/`, mis. "episodes/nabi-nuh/bg-sky.webp".
 *    URL http(s) juga didukung.
 */

/* ---------------------------- Utilitas umum ---------------------------- */

export type EasingName =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "easeInOutCubic"
  | "easeOutBack"
  | "easeInOutSine";

export type Vec2 = { x: number; y: number };

/* ------------------------------- Kamera -------------------------------- */

export type CameraPresetName =
  | "static"
  | "slowZoomIn"
  | "slowZoomOut"
  | "dramaticPush"
  | "panLeft"
  | "panRight"
  | "panUp"
  | "panDown"
  | "riseReveal"
  | "orbitDrift";

/** Satu keyframe kamera. `at` = progres scene 0..1. */
export type CameraKeyframe = {
  at: number;
  /** 1 = normal, 1.3 = zoom-in 30% */
  zoom?: number;
  /** geser kamera (px). x positif = kamera ke kanan (gambar bergeser ke kiri) */
  x?: number;
  y?: number;
  /** rotasi kamera dalam derajat */
  rotate?: number;
};

/** Getaran kamera kontinu (mis. badai) */
export type ShakeConfig = {
  /** amplitudo dalam px */
  intensity: number;
  /** kecepatan getar; 1 = sedang, 3 = cepat */
  speed?: number;
  /** amplitudo rotasi dalam derajat */
  rotation?: number;
  /** mulai & selesai (detik, relatif terhadap awal scene) */
  start?: number;
  end?: number;
};

/** Getaran sesaat (impact) mis. petir, palu, ombak menghantam */
export type ShakeBurst = {
  at: number; // detik dalam scene
  duration?: number; // detik, default 0.6
  intensity?: number; // px, default 30
};

export type CameraConfig = {
  /** Gunakan preset ATAU keyframes (keyframes menimpa preset) */
  preset?: CameraPresetName;
  /** Kekuatan preset, default 1 */
  strength?: number;
  keyframes?: CameraKeyframe[];
  easing?: EasingName;
  shake?: ShakeConfig;
  bursts?: ShakeBurst[];
};

/* ------------------------------ Parallax ------------------------------- */

export type LayerEnterAnimation = {
  type: "fade" | "rise" | "fall" | "zoom" | "slideLeft" | "slideRight";
  /** detik */
  duration?: number;
  delay?: number;
};

export type ParallaxLayerConfig = {
  /** path relatif ke /public atau URL. PNG transparan / WebP. */
  src: string;
  /**
   * Kedalaman parallax.
   *  0   = sangat jauh (langit), hampir tidak bergerak
   *  0.5 = tengah
   *  1   = bergerak sama dengan kamera
   *  >1  = foreground, bergerak lebih cepat dari kamera
   */
  depth: number;
  /**
   * Cara gambar mengisi kanvas:
   *  cover   = penuhi layar (untuk background)
   *  contain = muat seluruh gambar
   *  width   = lebar = `width` px (untuk sprite/karakter)
   */
  fit?: "cover" | "contain" | "width";
  /** lebar sprite dalam px (dipakai jika fit = "width") */
  width?: number;
  /** jangkar vertikal sprite */
  anchor?: "center" | "top" | "bottom";
  /** offset posisi (px) dari jangkar */
  offset?: Partial<Vec2>;
  /** skala tambahan; background otomatis di-overscan agar pan tidak terlihat tepi */
  scale?: number;
  opacity?: number;
  /** blur (px) — efek depth of field untuk foreground/background */
  blur?: number;
  /** pergeseran konstan px/detik (awan, kabut, air) */
  drift?: Partial<Vec2>;
  /** gerak naik-turun (perahu di ombak, karakter bernafas) */
  float?: { amplitude: number; speed?: number; rotate?: number };
  /** cermin horizontal */
  flipX?: boolean;
  blendMode?: "normal" | "screen" | "multiply" | "overlay" | "lighten" | "soft-light";
  enter?: LayerEnterAnimation;
  /** detik scene saat layer mulai/berhenti tampil */
  start?: number;
  end?: number;
  /** filter CSS tambahan, mis. "brightness(0.8) saturate(1.2)" */
  filter?: string;
};

/* --------------------------- Partikel & cahaya ------------------------- */

export type ParticlePresetName =
  | "dust"
  | "embers"
  | "rain"
  | "heavyRain"
  | "sparkles"
  | "fireflies"
  | "snow"
  | "bubbles"
  | "sand";

export type ParticleConfig = {
  preset: ParticlePresetName;
  /** override jumlah partikel */
  count?: number;
  /** override warna (CSS) */
  color?: string;
  /** pengali kecepatan */
  speed?: number;
  /** pengali ukuran */
  size?: number;
  opacity?: number;
  /** derajat — arah angin, mis. 15 untuk hujan miring */
  angle?: number;
  /** seed agar dua sistem partikel tidak identik */
  seed?: string;
  /** di depan (default) atau di belakang foreground */
  layer?: "front" | "back";
};

export type LightConfig =
  | {
      type: "godRays";
      /** posisi sumber cahaya dalam persen layar */
      origin?: Vec2;
      color?: string;
      intensity?: number;
      rays?: number;
      /** kecepatan putaran (derajat/detik) */
      rotateSpeed?: number;
      spread?: number;
    }
  | {
      type: "glow";
      position?: Vec2; // persen
      radius?: number; // px
      color?: string;
      intensity?: number;
      /** denyut 0..1 */
      pulse?: number;
      pulseSpeed?: number;
    }
  | {
      type: "flash";
      /** detik dalam scene ketika kilat terjadi */
      at: number[];
      color?: string;
      intensity?: number;
      duration?: number;
    }
  | {
      type: "lensFlare";
      position?: Vec2;
      color?: string;
      intensity?: number;
    };

export type ColorGradeConfig = {
  /** warna tint di atas seluruh frame */
  tint?: string;
  tintOpacity?: number;
  tintBlend?: "multiply" | "overlay" | "soft-light" | "screen" | "color";
  /** filter CSS untuk seluruh stage */
  filter?: string;
  vignette?: number; // 0..1
  grain?: number; // 0..1
  letterbox?: number; // tinggi bar hitam (px), 0 = mati
};

/* ------------------------------- Narasi ------------------------------- */

/** Potongan subtitle dengan waktu manual (detik, relatif terhadap scene) */
export type SubtitleCue = {
  text: string;
  start: number;
  end: number;
};

export type NarrationConfig = {
  /**
   * Teks narasi. Bungkus kata dengan *bintang* untuk highlight
   * (warna aksen), contoh: "Selama *950 tahun* beliau berdakwah".
   */
  text: string;
  /** file audio narasi untuk scene ini (opsional) */
  audio?: string;
  volume?: number;
  /** jeda (detik) sebelum narasi mulai di dalam scene */
  delay?: number;
  /**
   * Waktu subtitle manual. Jika kosong, subtitle dibagi otomatis
   * berdasarkan panjang kata sepanjang durasi narasi.
   */
  cues?: SubtitleCue[];
  /** jumlah kata maksimum per potongan subtitle otomatis */
  maxWordsPerChunk?: number;
  /** sembunyikan subtitle untuk scene ini */
  hideSubtitle?: boolean;
};

/* -------------------------------- Audio -------------------------------- */

export type SoundEffectConfig = {
  src: string;
  /** detik dalam scene */
  at?: number;
  volume?: number;
  /** potong setelah n detik */
  duration?: number;
  /** mulai dari detik ke-n di dalam file */
  trimStart?: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
  playbackRate?: number;
};

export type MusicConfig = {
  src: string;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  /** volume musik saat narasi berbunyi (ducking), mis. 0.35 = 35% dari volume */
  duckTo?: number;
  trimStart?: number;
  loop?: boolean;
};

/* ----------------------------- Transisi & teks ----------------------------- */

export type TransitionType =
  | "none"
  | "fade"
  | "crossfade"
  | "fadeBlack"
  | "flashWhite"
  | "slideUp"
  | "slideLeft"
  | "zoomBlur"
  | "circleReveal";

export type TransitionConfig = {
  type: TransitionType;
  /** detik; transisi tumpang tindih dengan akhir scene sebelumnya */
  duration?: number;
};

export type TextOverlayConfig = {
  title: string;
  subtitle?: string;
  /** posisi vertikal dalam persen (0 = atas) */
  y?: number;
  /** detik dalam scene */
  start?: number;
  end?: number;
  style?: "hero" | "chapter" | "cta" | "arabic";
};

/* -------------------------------- Scene -------------------------------- */

export type SceneConfig = {
  id: string;
  /** label untuk Studio / log */
  label?: string;
  /**
   * Durasi scene dalam detik. Jika diisi "auto", durasi diambil dari
   * panjang file `narration.audio` + `autoPadding`.
   */
  duration: number | "auto";
  autoPadding?: number;
  background?: string; // warna dasar CSS di belakang semua layer
  layers: ParallaxLayerConfig[];
  camera?: CameraConfig;
  particles?: ParticleConfig[];
  lights?: LightConfig[];
  grade?: ColorGradeConfig;
  narration?: NarrationConfig;
  sfx?: SoundEffectConfig[];
  transitionIn?: TransitionConfig;
  overlay?: TextOverlayConfig;
};

/* ------------------------------- Tema ---------------------------------- */

export type SubtitleTheme = {
  fontFamily: string;
  /** path font lokal di /public (ttf/otf/woff2) — opsional */
  fontFile?: string;
  fontWeight?: number;
  fontSize?: number;
  color?: string;
  /** warna kata yang sedang diucapkan */
  activeColor?: string;
  /** warna kata *highlight* */
  accentColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  /** posisi vertikal, persen dari atas. Shorts: hindari >80 (tertutup UI) */
  y?: number;
  /** "karaoke" = kata menyala satu per satu; "pop" = per potongan; "typewriter" */
  animation?: "karaoke" | "pop" | "typewriter";
  background?: string; // mis. "rgba(0,0,0,0.35)" atau "none"
  uppercase?: boolean;
  maxWidth?: number;
};

export type EpisodeTheme = {
  subtitle: SubtitleTheme;
  titleFontFamily?: string;
  titleFontFile?: string;
  accentColor?: string;
  /** default grade untuk semua scene (bisa ditimpa per scene) */
  grade?: ColorGradeConfig;
  defaultTransition?: TransitionConfig;
};

/* ------------------------------ Episode -------------------------------- */

export type EpisodeConfig = {
  /** ID composition (huruf, angka, tanda minus) — dipakai di CLI render */
  id: string;
  title: string;
  subtitle?: string;
  /** opsional: override FPS/ukuran; default 30fps 1080x1920 */
  fps?: number;
  width?: number;
  height?: number;
  theme: EpisodeTheme;
  music?: MusicConfig;
  /**
   * Satu file narasi panjang untuk seluruh episode (alternatif dari
   * narasi per scene). Subtitle tetap diambil dari `scene.narration.text`.
   */
  fullNarration?: { src: string; volume?: number; startAt?: number };
  scenes: SceneConfig[];
  /** tampilkan panduan safe-area Shorts di Studio (tidak ikut render jika false) */
  showSafeArea?: boolean;
  /**
   * Target durasi (detik) untuk peringatan validasi. Default VIDEO.targetDurationSeconds.
   * `null` = tanpa target (episode hasil pipeline durasinya mengikuti narasi).
   */
  targetDurationSeconds?: number | null;
};

/* ------------------------- Hasil kalkulasi timeline ------------------------- */

export type ResolvedScene = SceneConfig & {
  index: number;
  /** frame awal & durasi final dalam frame */
  from: number;
  durationInFrames: number;
  durationInSeconds: number;
  transitionFrames: number;
};

export type EpisodeVideoProps = {
  episode: EpisodeConfig;
  /** diisi otomatis oleh calculateMetadata (durasi "auto" sudah diselesaikan) */
  resolvedDurations?: number[];
  /** diisi otomatis: panjang audio narasi per scene (null jika tidak ada) */
  narrationSeconds?: (number | null)[];
};
