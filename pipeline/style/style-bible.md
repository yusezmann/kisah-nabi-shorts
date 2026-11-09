# Style Bible — Kisah Nabi Shorts

Dokumen acuan agar semua episode terlihat & terdengar seperti **satu seri**.
Nilai yang dipakai otomatis oleh pipeline ada di `pipeline/config/style.json`
(prompt gambar) dan `pipeline/config/voice.json` (suara). Ubah di sana, bukan di sini saja.

---

## 1. Gaya visual

**Satu kalimat:** ilustrasi 2D flat bersiluet, bentuk geometris sederhana, langit bergradasi lembut, palet terbatas, suasana tenang dan khidmat.

| Aspek | Aturan |
| --- | --- |
| Gaya | flat 2D vector, siluet, tanpa outline tebal, tekstur halus boleh |
| Bentuk | geometris sederhana, tepi bersih, detail minim |
| Cahaya | gradasi lembut, cahaya hangat dari satu arah, glow halus |
| Komposisi | vertikal 9:16, ruang kosong di 1/3 atas (untuk judul) dan area subtitle (±68% dari atas) |
| Larangan | wajah nabi & sahabat, sosok Allah/malaikat berwujud, teks/huruf di gambar, gaya realistis/3D/anime, watermark |

### Palet awal (ambil dari aset Nabi Nuh)

| Peran | Hex |
| --- | --- |
| Langit senja (atas) | `#3a2350` |
| Langit senja (bawah) | `#f08a4b` |
| Siluet gelap | `#120a18` |
| Laut / malam | `#1c2c4c` |
| Awan / cahaya lembut | `#f3e6c8` |
| Aksen emas (judul, highlight) | `#ffcf5a` |

> Palet ini titik awal. Setelah 3–5 episode, kunci palet final dan perbarui `style.json`.

### Gambar acuan

Simpan 3–4 gambar terbaik sebagai acuan di `pipeline/style/reference/` dan **lampirkan setiap kali generate** gambar baru (ChatGPT/Gemini menerima gambar referensi).
Awal: `public/library/sky/dusk.webp`, `public/library/city/village.png`, `public/library/people/prophet-back.png`.

---

## 2. Konvensi layer gambar

| Peran (`role`) | Isi | Format | Depth | Contoh |
| --- | --- | --- | --- | --- |
| `sky` | langit penuh, tanpa objek | WebP/PNG penuh, ≥1080×1920 | 0.05 | fajar, senja, badai |
| `atmo` | awan/kabut | PNG transparan | 0.12–0.2 | awan |
| `far` | latar jauh | PNG transparan | 0.3–0.35 | pegunungan jauh |
| `mid` | lapisan tengah | PNG transparan | 0.4–0.6 | desa, kota, puncak gunung |
| `water` | air belakang | PNG transparan | 0.5–0.7 | ombak belakang |
| `prop` | objek utama cerita | PNG transparan | 0.6–1 | bahtera, kapal, ikan besar |
| `figure` | tokoh / kerumunan | PNG transparan | 0.9–1.25 | siluet nabi dari belakang, kerumunan |
| `fg` | foreground | PNG transparan | 1.2–1.4 | ombak depan, rumput |

Ukuran kanvas: potret, **minimal 1080×1920** (lebih besar lebih baik untuk zoom). Latar transparan dibuat dengan `npm run remove-bg -- <folder>`.

---

## 3. Adab visual (wajib)

- Nabi & sahabat **tidak pernah** ditampilkan wajahnya — hanya siluet dari belakang/samping jauh, atau diwakili cahaya (`glow`).
- Tidak memvisualkan Allah, malaikat, surga/neraka secara figuratif. Gunakan cahaya, langit, partikel.
- Tokoh yang zalim pun cukup siluet kerumunan, tanpa ekspresi berlebihan.

---

## 4. Suara & audio

| Aspek | Aturan |
| --- | --- |
| Suara narasi | satu suara untuk seluruh seri (`voice.json`). Default: `id-ID-ArdiNeural` |
| Tempo | ±2,3–2,8 kata/detik. Validasi memberi peringatan >3,2 kata/detik |
| Pelafalan | istilah Arab diatur di `pipeline/config/lexicon.json` |
| Kerasnya suara | narasi dinormalisasi otomatis ke −16 LUFS (ffmpeg `loudnorm`) |
| Musik | satu set musik ambient bebas royalti (YouTube Audio Library), atau tanpa musik/nasyid vokal; ducking 40% saat narasi |

---

## 5. Struktur & naskah

- **Durasi:** 40–55 detik, ±110 kata, 7–8 scene.
- **Alur tetap:** hook (scene 1, judul `hero`) → cerita (5–6 scene) → pelajaran → ajakan (`cta`) di scene terakhir.
- **Bahasa:** Indonesia baku yang hangat, kalimat pendek, cocok dibacakan.
- **Highlight:** maksimal 1 frasa `*penting*` per scene.
- **Rujukan:** setiap naskah wajib mencantumkan ayat/hadis rujukan. **Naskah hanya boleh dirender setelah direview manusia** (`"reviewed": true`).
