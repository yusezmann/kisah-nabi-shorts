# Prompt gambar

Pipeline menulis prompt siap-tempel untuk setiap gambar khas yang belum ada ke
`public/episodes/<slug>/ASSETS-NEEDED.md` (dibuat oleh `npm run build:episode`).
Susunannya:

```
<promptPrefix dari pipeline/config/style.json>
<roleHint sesuai peran layer>
Subject: <field "visual" dari naskah / nama objek>
<negative dari style.json>
```

## Cara pakai (gratis)

1. Buka ChatGPT atau Gemini versi gratis.
2. Lampirkan 3–4 gambar acuan dari `pipeline/style/reference/` (atau dari `public/library/`).
3. Tempel prompt dari `ASSETS-NEEDED.md`, tambahkan: *"Match the art style of the attached reference images exactly."*
4. Unduh hasilnya ke `public/episodes/<slug>/` dengan **nama file persis** seperti di daftar.
5. Hapus latar: `npm run remove-bg -- public/episodes/<slug>` → hasil PNG transparan di subfolder `nobg/`; pindahkan menimpa file asli.
6. Jalankan ulang `npm run build:episode -- <slug>`.

## Menambah ke pustaka (dipakai ulang lintas episode)

Gambar yang berguna untuk episode lain (langit malam, gurun, kapal, kota) taruh di
`public/library/<kategori>/` dan daftarkan di `public/library/library.json`
(lihat entri yang sudah ada sebagai contoh). Cek dengan `npm run library:check`.

## Tips konsistensi

- Satu alat untuk seluruh seri — jangan berganti generator.
- Selalu lampirkan gambar acuan yang sama.
- Jika warna sedikit meleset, biarkan: color grade di Remotion menyeragamkan.
- Tokoh yang sama dalam satu episode = file yang sama (jangan generate ulang per scene).
