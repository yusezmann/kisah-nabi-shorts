#!/usr/bin/env node
/**
 * Langkah 1 — buat draf naskah episode.
 *
 *   npm run script -- nabi-yunus "Kisah Nabi Yunus AS" "fokus pada doa di dalam perut ikan"
 *
 * Dengan GEMINI_API_KEY (gratis di Google AI Studio):
 *   naskah dibuat otomatis → pipeline/drafts/<slug>.json
 * Tanpa API key (mode manual):
 *   prompt ditulis ke pipeline/drafts/<slug>.prompt.txt → tempel ke ChatGPT/Gemini web,
 *   simpan jawaban JSON-nya sebagai pipeline/drafts/<slug>.json
 *
 * Naskah selalu berstatus "reviewed": false. Build menolak naskah yang belum direview.
 */
import fs from "node:fs";
import path from "node:path";
import { MOOD_NAMES } from "./config/moods.mjs";
import { P, assertSlug, libraryTags, loadLibrary, writeJson } from "./lib.mjs";

const [slug, title, brief = "-"] = process.argv.slice(2);
assertSlug(slug, 'Pemakaian: npm run script -- <slug> "Judul Episode" ["catatan/tema"]');
if (!title) {
  console.error('Judul wajib diisi. Contoh: npm run script -- nabi-yunus "Kisah Nabi Yunus AS"');
  process.exit(1);
}

const draftPath = path.join(P.drafts, `${slug}.json`);
if (fs.existsSync(draftPath) && !process.argv.includes("--force")) {
  console.error(`✖ pipeline/drafts/${slug}.json sudah ada. Tambahkan --force untuk menimpa.`);
  process.exit(1);
}

const assets = loadLibrary();
const list = (arr) => arr.map((t) => `"${t}"`).join(", ");
const prompt = fs
  .readFileSync(path.join(P.prompts, "script.md"), "utf8")
  .replaceAll("{{TITLE}}", title)
  .replaceAll("{{SLUG}}", slug)
  .replaceAll("{{BRIEF}}", brief)
  .replaceAll("{{SCENES}}", "8")
  .replaceAll("{{WORDS}}", "110")
  .replaceAll("{{MOODS}}", list(MOOD_NAMES))
  .replaceAll("{{SKY_TAGS}}", list(libraryTags(assets, ["sky"])))
  .replaceAll("{{PLACE_TAGS}}", list(libraryTags(assets, ["far", "mid", "water", "fg"])))
  .replaceAll("{{FIGURE_TAGS}}", list(libraryTags(assets, ["figure"])))
  .replaceAll("{{PROP_TAGS}}", list(libraryTags(assets, ["prop"])));

/** Bersihkan & cek bentuk dasar naskah dari LLM. */
const normalizeDraft = (raw) => {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const draft = JSON.parse(text);
  if (!Array.isArray(draft.scenes) || draft.scenes.length === 0) throw new Error("naskah tidak punya scenes");
  draft.slug = slug;
  draft.title = draft.title || title;
  draft.reviewed = false; // review manusia selalu wajib
  draft.scenes.forEach((s, i) => {
    if (!s.narration) throw new Error(`scene ${i + 1} tidak punya narration`);
    if (!MOOD_NAMES.includes(s.mood)) s.mood = "calm";
  });
  return draft;
};

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
fs.mkdirSync(P.drafts, { recursive: true });

if (!apiKey) {
  const promptPath = path.join(P.drafts, `${slug}.prompt.txt`);
  fs.writeFileSync(promptPath, prompt);
  console.log("ℹ GEMINI_API_KEY belum diset — mode manual.");
  console.log(`  1. Buka pipeline/drafts/${slug}.prompt.txt, salin seluruh isinya ke ChatGPT/Gemini.`);
  console.log(`  2. Simpan jawaban JSON-nya sebagai pipeline/drafts/${slug}.json`);
  console.log(`  3. Review isi & rujukan, ubah "reviewed" menjadi true, lalu: npm run episode -- ${slug}`);
  console.log("  (API key gratis: https://aistudio.google.com/apikey → set GEMINI_API_KEY)");
  process.exit(0);
}

const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
console.log(`▶ Membuat naskah dengan ${model}…`);
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
  }),
});
if (!res.ok) {
  console.error(`✖ Gemini API ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const body = await res.json();
const raw = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

let draft;
try {
  draft = normalizeDraft(raw);
} catch (err) {
  const rawPath = path.join(P.drafts, `${slug}.raw.txt`);
  fs.writeFileSync(rawPath, raw);
  console.error(`✖ Jawaban LLM bukan naskah valid (${err.message}). Disimpan di pipeline/drafts/${slug}.raw.txt`);
  process.exit(1);
}

writeJson(draftPath, draft);
const words = draft.scenes.reduce((n, s) => n + s.narration.split(/\s+/).length, 0);
console.log(`✔ Draf naskah: pipeline/drafts/${slug}.json (${draft.scenes.length} scene, ${words} kata)`);
console.log(`  Rujukan: ${(draft.references ?? []).join("; ") || "(tidak ada — wajib dilengkapi!)"}`);
console.log(`  Berikutnya: REVIEW naskah, ubah "reviewed" menjadi true, lalu npm run episode -- ${slug}`);
