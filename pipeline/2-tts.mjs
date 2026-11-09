#!/usr/bin/env node
/**
 * Langkah 2 — buat narasi suara per scene (edge-tts, gratis).
 *
 *   npm run tts -- nabi-yunus
 *   npm run voice:samples          # bandingkan suara di pipeline/config/voice.json
 *
 * Memakai `uv` (bila ada) agar edge-tts tersedia di lingkungan Python tersendiri.
 */
import { assertSlug, hasCommand, run } from "./lib.mjs";

const arg = process.argv[2];
if (arg !== "--samples") {
  assertSlug(arg, "Pemakaian: npm run tts -- <slug>   atau   npm run voice:samples");
}

const env = { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" };
if (hasCommand("uv")) {
  run("uv", ["run", "--quiet", "--no-project", "--python", "3.11", "--with", "edge-tts", "python", "pipeline/tts.py", arg], { env });
} else {
  // tanpa uv: butuh `pip install edge-tts` di Python 3.9+
  run("python", ["pipeline/tts.py", arg], { env });
}
