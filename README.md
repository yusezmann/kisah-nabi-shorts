# Kisah Nabi Shorts — Template Remotion

Template video **YouTube Shorts** animasi kisah nabi berbasis **Remotion + React + TypeScript**.
Semua episode dibangun dari **data**: ganti gambar, narasi, dan durasi tanpa menyentuh komponen.

| Spesifikasi   | Nilai                                |
| ------------- | ------------------------------------ |
| Resolusi      | 1080 × 1920 (9:16)                   |
| FPS           | 30                                   |
| Durasi contoh | 45 detik (8 scene)                   |
| Output        | MP4 H.264 + AAC (siap upload Shorts) |

Fitur: parallax multi-layer · kamera zoom/pan/shake (Perlin noise) · partikel (debu, bara, hujan, kilau, kunang-kunang, salju, gelembung, pasir) · cahaya (god rays, glow, kilat, lens flare) · color grade (tint, vignette, grain) · subtitle karaoke mengikuti narasi · musik dengan _ducking_ otomatis · sound effect per scene · 9 jenis transisi · durasi "auto" dari panjang audio narasi.

---

## 1. Instalasi

Butuh **Node.js 18+** (disarankan 20/22).

```bash
npm install
npm run dev          # buka Remotion Studio di browser (preview + timeline)
```

Render MP4:

```bash
npm run render                                   # → out/nabi-nuh.mp4
npx remotion render src/index.ts NabiNuh out/nabi-nuh.mp4   # perintah CLI langsung
npm run render:episode -- NabiNuh --draft        # preview cepat (½ resolusi)
npm run render:all                               # render semua episode
npm run still                                    # thumbnail PNG dari frame 60
```

> Semua paket `@remotion/*` harus versi yang sama. Jika muncul peringatan versi, jalankan `npm run upgrade`.

---

## 2. Struktur project

```
src/
├── index.ts                    # registerRoot
├── Root.tsx                    # 1 episode = 1 Composition (otomatis)
├── config/
│   ├── types.ts                # ★ semua tipe config (referensi lengkap ada di sini)
│   ├── video.ts                # 1080x1920, 30fps, safe area Shorts
│   └── presets.ts              # preset kamera & partikel
├── episodes/
│   ├── index.ts                # daftar episode
│   ├── nabi-nuh.ts             # ★ contoh episode 8 scene
│   ├── _template.ts            # template episode baru
│   └── shared/theme.ts         # tema subtitle/warna/font seri
├── compositions/
│   └── EpisodeVideo.tsx        # merakit scene + transisi + audio
├── components/
│   ├── scene/                  # SceneRenderer, SceneTransition, SceneContext
│   ├── camera/                 # CameraRig, useCamera (zoom/pan/shake)
│   ├── parallax/               # ParallaxBackground, ParallaxLayer
│   ├── effects/                # Particles, Lights, ColorGrade
│   ├── subtitles/              # AnimatedSubtitle, FontLoader
│   ├── overlays/               # TextOverlay (judul/CTA), SafeAreaGuide
│   └── audio/                  # AudioLayer (musik, narasi, sfx)
└── lib/                        # timeline, subtitle timing, validasi, metadata
public/
└── episodes/nabi-nuh/          # gambar & audio episode
scripts/
├── new-episode.mjs             # buat episode baru dari template
└── render-episode.mjs          # helper render
```

---

## 3. Membuat episode baru

```bash
npm run new-episode -- nabi-yunus "Kisah Nabi Yunus AS"
```

Script ini membuat `src/episodes/nabi-yunus.ts` (8 scene, total 45 detik), folder `public/episodes/nabi-yunus/`, dan mendaftarkannya di `src/episodes/index.ts`. Lalu:

1. Taruh gambar dari ChatGPT di `public/episodes/nabi-yunus/` (nama `bg-01.webp`, `mid-01.png`, `char-01.png`, …).
2. Edit teks narasi & durasi tiap scene di `src/episodes/nabi-yunus.ts`.
3. (Opsional) taruh audio narasi `audio/narasi-01.mp3` … lalu aktifkan baris `audio:`.
4. Preview: `npm run dev` → render: `npx remotion render src/index.ts NabiYunus out/nabi-yunus.mp4`.

---

## 3b. Pipeline otomatis: naskah → video (gratis)

```
npm run script   →  REVIEW  →  npm run episode  →  cek di Studio  →  jadwalkan di YouTube Studio
(naskah JSON)       (Anda)     (TTS + rakit + render)
```

**Sekali pasang:** `uv tool install edge-tts` dan `uv tool install "rembg[cli]" --python 3.11` (uv: https://docs.astral.sh/uv/).
Opsional: API key Gemini gratis (https://aistudio.google.com/apikey) → `set GEMINI_API_KEY=...` agar naskah dibuat otomatis.

| Perintah | Fungsi |
| --- | --- |
| `npm run script -- nabi-yunus "Kisah Nabi Yunus AS" "catatan"` | Draf naskah → `pipeline/drafts/nabi-yunus.json`. Tanpa API key: prompt ditulis ke `.prompt.txt` untuk ditempel ke ChatGPT/Gemini web |
| **Review** | Periksa isi kisah & `references`, lalu ubah `"reviewed": true`. Build menolak naskah yang belum direview |
| `npm run episode -- nabi-yunus --draft` | TTS → rakit → render cepat ½ resolusi (`out/NabiYunus-draft.mp4`) |
| `npm run episode -- nabi-yunus` | Sama, render penuh (`out/NabiYunus.mp4`) |
| `npm run tts -- nabi-yunus` | Hanya narasi suara (hasil di-cache; hanya scene yang berubah dibuat ulang) |
| `npm run build:episode -- nabi-yunus` | Hanya rakit config → `src/episodes/generated/nabi-yunus.json` (muncul di Studio) |
| `npm run voice:samples` | Bandingkan suara di `pipeline/config/voice.json` |
| `npm run remove-bg -- public/episodes/nabi-yunus` | Hapus latar gambar (PNG transparan di `nobg/`) |
| `npm run library:check` | Cek pustaka aset `public/library/library.json` |

**Naskah** hanya berisi cerita & suasana — detail teknis diisi otomatis:

```json
{ "narration": "Seekor *ikan besar* menelan beliau.", "mood": "dark", "sky": "night",
  "place": ["sea"], "figures": [], "props": ["ikan-besar.png"], "visual": "English image description" }
```

- `mood` → kamera, partikel, cahaya, grade, transisi, SFX dari `pipeline/config/moods.mjs` (`calm`, `storm`, `tense`, `sad`, `dark`, `divine`, `hope`).
- `sky`/`place`/`figures`/`props` → gambar dari pustaka `public/library/` berdasarkan tag.
- `props` berupa nama file (mis. `kapal.png`) = gambar khas episode di `public/episodes/<slug>/`. Bila belum ada, prompt siap-tempel ditulis ke `public/episodes/<slug>/ASSETS-NEEDED.md`. Posisi bisa diatur: `{ "file": "semut.png", "layer": { "anchor": "bottom", "width": 760, "offset": { "y": -160 } } }`.
- Pelafalan istilah Arab: `pipeline/config/lexicon.json`. Gaya visual & suara seri: `pipeline/style/style-bible.md`.

**Rutinitas mingguan (3 video):** buat 3 naskah → review → generate gambar khas dari `ASSETS-NEEDED.md` (lampirkan gambar acuan `pipeline/style/reference/`) → `npm run remove-bg` → `npm run episode` ×3 → upload & jadwalkan Senin/Rabu/Jumat.

---

## 4. Anatomi satu scene

```ts
{
  id: "s06-banjir",
  duration: 7,                         // detik, atau "auto" (= panjang narasi.audio + padding)
  transitionIn: { type: "fadeBlack", duration: 0.6 },

  layers: [                            // urutan = belakang → depan
    { src: `${A}/sky-storm.webp`, depth: 0.05 },                         // langit, hampir diam
    { src: `${A}/clouds.png`, depth: 0.2, drift: { x: -60 } },           // awan bergerak terus
    { src: `${A}/ark.png`, depth: 0.8, fit: "width", width: 900,         // sprite
      anchor: "center", offset: { y: 230 },
      float: { amplitude: 30, speed: 0.3, rotate: 4 } },                 // terombang-ambing
    { src: `${A}/waves-front.png`, depth: 1.3, drift: { x: -90 } },      // foreground cepat
  ],

  camera: {
    preset: "orbitDrift",                       // atau keyframes: [{ at: 0, zoom: 1, x: 0 }, …]
    shake: { intensity: 9, speed: 1.2, rotation: 0.6 },   // getar kontinu
    bursts: [{ at: 1.2, intensity: 40 }],                 // hentakan (petir)
  },
  particles: [{ preset: "heavyRain", angle: 8 }],
  lights: [{ type: "flash", at: [1.2, 4.5] }],
  grade: { tint: "#1f3d6b", tintOpacity: 0.35, tintBlend: "multiply", vignette: 0.75 },

  narration: {
    text: "Langit menumpahkan hujan. *Banjir besar* pun datang.",   // *kata* = highlight
    audio: `${A}/audio/narasi-06.mp3`,
  },
  sfx: [
    { src: `${A}/audio/thunder.mp3`, at: 1.15, volume: 0.9 },
    { src: `${A}/audio/rain-loop.mp3`, at: 0, loop: true, fadeOut: 0.6 },
  ],
}
```

### Ringkasan opsi

| Bagian           | Opsi                                                                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer**        | `depth` (0 jauh → 1 ikut kamera → >1 foreground), `fit` cover/contain/width, `width`, `anchor`, `offset`, `scale`, `drift`, `float`, `blur`, `opacity`, `blendMode`, `filter`, `flipX`, `enter` (fade/rise/fall/zoom/slideLeft/slideRight), `start`/`end` |
| **Kamera**       | preset: `static`, `slowZoomIn`, `slowZoomOut`, `dramaticPush`, `panLeft/Right/Up/Down`, `riseReveal`, `orbitDrift` · `strength` · `keyframes` · `easing` · `shake` · `bursts`                                                                             |
| **Partikel**     | `dust`, `embers`, `rain`, `heavyRain`, `sparkles`, `fireflies`, `snow`, `bubbles`, `sand` · override `count`, `color`, `speed`, `size`, `angle`, `opacity`, `layer: "back"`                                                                               |
| **Cahaya**       | `godRays`, `glow`, `flash`, `lensFlare`                                                                                                                                                                                                                   |
| **Transisi**     | `none`, `fade`, `crossfade`, `fadeBlack`, `flashWhite`, `slideUp`, `slideLeft`, `zoomBlur`, `circleReveal`                                                                                                                                                |
| **Overlay teks** | `style`: `hero`, `chapter`, `cta`, `arabic`                                                                                                                                                                                                               |

Referensi lengkap (dengan komentar) ada di **`src/config/types.ts`**.

> Layer dengan `depth < 1` dirender di belakang partikel `layer: "back"`, layer `depth ≥ 1` di depannya. Tulis layer berurutan dari depth kecil ke besar.

---

## 5. Narasi & subtitle

**Per scene (disarankan):** satu file audio per scene → `narration.audio`. Subtitle dibagi otomatis menurut panjang kata dan disinkronkan dengan panjang audio.

**Durasi otomatis:** `duration: "auto"` → durasi scene = panjang audio + `narration.delay` (default 0,25 s) + `autoPadding` (default 0,6 s).

**Satu file narasi panjang:** isi `fullNarration: { src: "…/narasi-full.mp3" }` di level episode. Teks subtitle tetap diambil dari tiap scene, sehingga durasi scene sebaiknya diatur agar pas dengan audio.

**Waktu subtitle manual** (paling presisi, mis. dari Whisper/CapCut):

```ts
narration: {
  text: "…",
  cues: [
    { text: "Selama *950 tahun*,", start: 0.2, end: 1.6 },
    { text: "beliau mengajak kaumnya", start: 1.6, end: 3.4 },
  ],
}
```

Gaya subtitle (font, warna, posisi, animasi `karaoke` / `pop` / `typewriter`) diatur di `src/episodes/shared/theme.ts`.
Font khusus: taruh `.ttf/.woff2` di `public/fonts/` lalu isi `fontFile`.

**Musik ducking:** `music.duckTo: 0.4` → volume musik turun ke 40% saat narasi berbunyi.

---

## 6. Panduan aset gambar dari ChatGPT

| Jenis layer               | Ukuran                            | Format         | Tips prompt                                                             |
| ------------------------- | --------------------------------- | -------------- | ----------------------------------------------------------------------- |
| Latar / langit (`bg`)     | potret 1024×1792 atau lebih besar | WebP/PNG       | "vertical 9:16 background, no characters, painterly 2D animation style" |
| Lapisan tengah (`mid`)    | potret, sama dengan bg            | PNG transparan | "…only the mountains, transparent background"                           |
| Karakter / objek (`char`) | bebas                             | PNG transparan | "full body, side view, isolated on transparent background"              |
| Foreground (`fg`)         | potret                            | PNG transparan | "foreground grass / waves at the bottom, transparent background"        |

- Pakai **gaya & palet yang sama** di semua prompt satu episode (mis. tambahkan "same art style as previous: warm painterly, soft lighting").
- Jika ChatGPT tidak memberi transparansi, hapus latar dengan remove.bg / Photoshop.
- Gambar latar sedikit lebih besar dari 1080×1920 membuat pan/zoom tetap tajam. Layer `cover` otomatis di-overscan 14%.
- **Adab:** sesuai konvensi umum konten Islami, wajah nabi dan sahabat tidak divisualkan. Template contoh memakai siluet dari belakang + cahaya (`glow`).

> Gambar & audio di `public/episodes/nabi-nuh/` hanyalah **placeholder** (ilustrasi sederhana dan efek suara sintetis) agar project bisa langsung dirender. Ganti dengan aset asli dengan nama file yang sama.

---

## 7. Validasi & troubleshooting

- Saat Studio/render dimulai, config divalidasi: id duplikat, keyframe kamera tidak urut, narasi terlalu cepat (>3,2 kata/detik), durasi tidak sama dengan target 45 detik, dll. Peringatan muncul di console.
- **"Gagal membaca audio narasi"** → path salah atau file belum ada di `public/`.
- **Render lambat** → `--concurrency=4`, atau `npm run render:episode -- ID --draft` untuk preview.
- **Safe area** → set `showSafeArea: true` di episode untuk melihat area yang tertutup UI YouTube (hanya di Studio, tidak ikut render).
- **Kualitas/ukuran file** → ubah `Config.setCrf()` di `remotion.config.ts` (18 = tinggi, 23 = lebih kecil).

> Lisensi: Remotion gratis untuk individu & perusahaan kecil; perusahaan dengan >3 karyawan memerlukan lisensi perusahaan — lihat remotion.dev/license.
