#!/usr/bin/env node
/**
 * Jalankan langkah 2 → 3 → 4 untuk naskah yang sudah direview.
 *
 *   npm run episode -- nabi-yunus            # TTS + rakit + render penuh → out/NabiYunus.mp4
 *   npm run episode -- nabi-yunus --draft    # render cepat ½ resolusi untuk cek
 *   npm run episode -- nabi-yunus --no-render
 *   (--skip-review hanya untuk uji teknis; hasilnya jangan diupload)
 */
import { assertSlug, pascalCase, run } from "./lib.mjs";

const [slug, ...flags] = process.argv.slice(2);
assertSlug(slug, "Pemakaian: npm run episode -- <slug> [--draft] [--no-render] [--skip-review]");

console.log("\n━━ 1/3 Narasi suara");
run("node", ["pipeline/2-tts.mjs", slug]);

console.log("\n━━ 2/3 Rakit episode");
run("node", ["pipeline/3-build.mjs", slug, ...flags.filter((f) => f === "--skip-review")]);

if (flags.includes("--no-render")) process.exit(0);

console.log("\n━━ 3/3 Render");
run("node", ["scripts/render-episode.mjs", pascalCase(slug), ...flags.filter((f) => f === "--draft")]);
