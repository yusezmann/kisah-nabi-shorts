#!/usr/bin/env node
/**
 * Hapus latar gambar (rembg, gratis & lokal) → PNG transparan di subfolder nobg/.
 *
 *   npm run remove-bg -- public/episodes/nabi-yunus
 *   npm run remove-bg -- path/ke/gambar.png
 *
 * Pasang sekali: uv tool install "rembg[cli]" --python 3.11
 * (unduhan model ±170 MB saat pertama dipakai)
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, hasCommand, run } from "./lib.mjs";

const target = process.argv[2];
if (!target) {
  console.error("Pemakaian: npm run remove-bg -- <folder-atau-file>");
  process.exit(1);
}
if (!hasCommand("rembg")) {
  console.error('✖ rembg belum terpasang. Jalankan: uv tool install "rembg[cli]" --python 3.11');
  process.exit(1);
}

const abs = path.resolve(ROOT, target);
const isImage = (f) => /\.(png|jpe?g|webp)$/i.test(f);
const files = fs.statSync(abs).isDirectory()
  ? fs.readdirSync(abs).filter(isImage).map((f) => path.join(abs, f))
  : [abs];
if (files.length === 0) {
  console.error("Tidak ada gambar di " + target);
  process.exit(1);
}

const outDir = path.join(path.dirname(files[0]), "nobg");
fs.mkdirSync(outDir, { recursive: true });
for (const file of files) {
  const out = path.join(outDir, path.basename(file).replace(/\.\w+$/, ".png"));
  console.log(`▶ ${path.relative(ROOT, file)}`);
  run("rembg", ["i", file, out]);
}
console.log(`✔ ${files.length} gambar → ${path.relative(ROOT, outDir)}/`);
console.log("  Periksa hasilnya, lalu pindahkan (timpa) ke folder asal untuk layer yang perlu transparan.");
console.log("  Jangan hapus latar untuk gambar langit (sky).");
