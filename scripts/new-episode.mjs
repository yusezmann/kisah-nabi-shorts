#!/usr/bin/env node
/**
 * Membuat episode baru dari template.
 *
 *   npm run new-episode -- nabi-yunus "Kisah Nabi Yunus AS"
 *
 * Hasil:
 *   src/episodes/nabi-yunus.ts           (config 8 scene, siap diedit)
 *   public/episodes/nabi-yunus/          (folder aset + audio/)
 *   src/episodes/index.ts                (otomatis didaftarkan)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [slug, ...titleParts] = process.argv.slice(2);

if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Pemakaian: npm run new-episode -- <slug-huruf-kecil> "Judul Episode"');
  console.error('Contoh   : npm run new-episode -- nabi-yunus "Kisah Nabi Yunus AS"');
  process.exit(1);
}

const title = titleParts.join(" ") || slug;
// "nabi-yunus" -> id "NabiYunus", variabel "nabiYunus"
const pascal = slug
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("");
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);

const episodeFile = path.join(root, "src/episodes", `${slug}.ts`);
const assetDir = path.join(root, "public/episodes", slug);
const indexFile = path.join(root, "src/episodes/index.ts");

if (fs.existsSync(episodeFile)) {
  console.error(`✖ ${path.relative(root, episodeFile)} sudah ada.`);
  process.exit(1);
}
// slug yang sama di pipeline otomatis → ID composition bentrok
for (const f of [`pipeline/drafts/${slug}.json`, `src/episodes/generated/${slug}.json`]) {
  if (fs.existsSync(path.join(root, f))) {
    console.error(`✖ Episode "${slug}" sudah dibuat lewat pipeline (${f}). Pakai: npm run episode -- ${slug}`);
    process.exit(1);
  }
}

// 1. salin template
let src = fs.readFileSync(path.join(root, "src/episodes/_template.ts"), "utf8");
src = src
  .replace(/__SLUG__/g, slug)
  .replace(/__ID__/g, pascal)
  .replace(/__TITLE__/g, title.replace(/"/g, '\\"'))
  .replace("export const templateEpisode", `export const ${camel}`);
fs.writeFileSync(episodeFile, src);

// 2. folder aset
fs.mkdirSync(path.join(assetDir, "audio"), { recursive: true });
fs.writeFileSync(
  path.join(assetDir, "README.txt"),
  [
    `Aset untuk episode "${title}"`,
    "",
    "Per scene (XX = 01..08):",
    "  bg-XX.webp   latar penuh (min. 1080x1920, lebih besar lebih baik untuk pan)",
    "  mid-XX.png   lapisan tengah transparan",
    "  char-XX.png  karakter/objek transparan",
    "",
    "audio/",
    "  narasi-XX.mp3  narasi per scene",
    "  music.mp3      musik latar",
    "",
  ].join("\n"),
);

// 3. daftarkan di index.ts
let index = fs.readFileSync(indexFile, "utf8");
index = index
  .replace("// <new-episode-import-marker>", `import { ${camel} } from "./${slug}";\n// <new-episode-import-marker>`)
  .replace("  // <new-episode-marker>", `  ${camel},\n  // <new-episode-marker>`);
fs.writeFileSync(indexFile, index);

console.log(`✔ Episode dibuat: ${pascal}`);
console.log(`  config : src/episodes/${slug}.ts`);
console.log(`  aset   : public/episodes/${slug}/`);
console.log(`  render : npx remotion render src/index.ts ${pascal} out/${slug}.mp4`);
