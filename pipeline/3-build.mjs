#!/usr/bin/env node
/**
 * Langkah 3 — rakit naskah (pipeline/drafts/<slug>.json) menjadi EpisodeConfig lengkap.
 *
 *   npm run build:episode -- nabi-yunus
 *   npm run build:episode -- nabi-yunus --skip-review   # hanya untuk uji teknis
 *
 * Yang dilakukan:
 *  - memilih layer gambar dari pustaka (public/library/library.json) sesuai tag naskah
 *  - menerapkan preset suasana (pipeline/config/moods.mjs)
 *  - memasang narasi + subtitle berwaktu dari hasil TTS (narasi-XX.json)
 *  - menulis src/episodes/generated/<slug>.json dan memperbarui index.ts
 *  - menulis public/episodes/<slug>/ASSETS-NEEDED.md untuk gambar khas yang belum ada
 */
import fs from "node:fs";
import path from "node:path";
import { MOODS } from "./config/moods.mjs";
import { P, assertSlug, camelCase, loadLibrary, pascalCase, readJson, writeJson } from "./lib.mjs";

const NARRATION_DELAY = 0.25;
const AUTO_PADDING = 0.6;
const LAST_SCENE_PADDING = 1.6;
const MAX_WORDS_PER_CUE = 4;

const [slug, ...flags] = process.argv.slice(2);
assertSlug(slug, "Pemakaian: npm run build:episode -- <slug> [--skip-review]");
const skipReview = flags.includes("--skip-review");

const draftPath = path.join(P.drafts, `${slug}.json`);
if (!fs.existsSync(draftPath)) {
  console.error(`✖ Naskah tidak ditemukan: pipeline/drafts/${slug}.json`);
  process.exit(1);
}
const handWritten = path.join(P.generated, "..", `${slug}.ts`);
if (fs.existsSync(handWritten)) {
  console.error(
    `✖ src/episodes/${slug}.ts sudah ada (episode manual) — ID composition akan bentrok.\n` +
      `  Hapus/rename episode manual itu, atau pakai slug lain untuk naskah pipeline.`,
  );
  process.exit(1);
}
const draft = readJson(draftPath);
if (draft.reviewed !== true) {
  if (!skipReview) {
    console.error(
      `✖ Naskah belum direview. Periksa isi kisah & rujukan di pipeline/drafts/${slug}.json,\n` +
        `  lalu ubah "reviewed": false menjadi true. (Uji teknis: tambahkan --skip-review)`,
    );
    process.exit(1);
  }
  console.warn("⚠ --skip-review: naskah BELUM direview — jangan upload hasil render ini.");
}

const style = readJson(path.join(P.config, "style.json"));
const library = loadLibrary();
const episodeDir = `episodes/${slug}`;
const warnings = [];
const missingAssets = [];

/* ------------------------------------------------------------------ aset */

const byRole = (role) => library.filter((a) => a.role === role);
const findTagged = (role, tag) => byRole(role).find((a) => a.tags.includes(tag));
const assetExists = (src) => fs.existsSync(path.join(P.public, src));
const isFile = (s) => /\.(png|webp|jpe?g)$/i.test(s);

const toLayer = (asset, override = {}) => ({ src: asset.src, ...asset.layer, ...override });

/**
 * Gambar khas episode di public/episodes/<slug>/.
 * Naskah boleh menulis "kapal.png" atau { "file": "semut.png", "layer": { ...override posisi } }.
 */
const uniqueLayer = (file, scene, sceneNo, override = {}) => {
  const src = `${episodeDir}/${file}`;
  if (!assetExists(src)) {
    missingAssets.push({ file, scene: sceneNo, visual: scene.visual ?? "", role: "prop" });
    return null;
  }
  return {
    src,
    depth: 0.8,
    fit: "width",
    width: 900,
    anchor: "center",
    offset: { y: 120 },
    float: { amplitude: 14, speed: 0.3, rotate: 2 },
    ...override,
  };
};

const buildLayers = (scene, mood, sceneNo) => {
  const layers = [];

  // langit
  const skyTag = scene.sky ?? mood.defaultSky;
  const sky = findTagged("sky", skyTag) ?? findTagged("sky", mood.defaultSky) ?? byRole("sky")[0];
  if (sky && !sky.tags.includes(skyTag)) warnings.push(`Scene ${sceneNo}: langit "${skyTag}" belum ada di pustaka → pakai "${sky.id}".`);
  if (sky) layers.push(toLayer(sky, mood.skyFilter ? { filter: mood.skyFilter } : {}));

  // awan
  const clouds = byRole("atmo")[0];
  if (clouds && mood.clouds) layers.push(toLayer(clouds, mood.clouds));

  // tempat: maks. satu "far" dan satu "mid", plus air/foreground bila cocok
  const place = scene.place ?? [];
  for (const role of ["far", "mid", "water", "fg"]) {
    const hit = byRole(role).find((a) => a.tags.some((t) => place.includes(t)));
    if (hit) layers.push(toLayer(hit));
  }
  place
    .filter((t) => !library.some((a) => ["far", "mid", "water", "fg"].includes(a.role) && a.tags.includes(t)))
    .forEach((t) => warnings.push(`Scene ${sceneNo}: tempat "${t}" belum ada di pustaka.`));

  // objek
  for (const prop of scene.props ?? []) {
    if (typeof prop === "object" && prop.file) {
      const l = uniqueLayer(prop.file, scene, sceneNo, prop.layer);
      if (l) layers.push(l);
    } else if (isFile(prop)) {
      const l = uniqueLayer(prop, scene, sceneNo);
      if (l) layers.push(l);
    } else {
      const hit = findTagged("prop", prop);
      if (hit) layers.push(toLayer(hit));
      else warnings.push(`Scene ${sceneNo}: objek "${prop}" belum ada di pustaka (tulis sebagai nama file, mis. "${prop}.png", agar masuk daftar ASSETS-NEEDED).`);
    }
  }

  // tokoh
  for (const fig of scene.figures ?? []) {
    const hit = findTagged("figure", fig);
    if (hit) layers.push(toLayer(hit));
    else warnings.push(`Scene ${sceneNo}: tokoh "${fig}" belum ada di pustaka.`);
  }

  // urutkan belakang → depan (aturan ParallaxBackground)
  return layers
    .map((l, i) => ({ l, i }))
    .sort((a, b) => a.l.depth - b.l.depth || a.i - b.i)
    .map(({ l }) => l);
};

const buildSfx = (scene, mood) => {
  const list = [...(mood.sfx ?? [])];
  if (mood.seaSfx && (scene.place ?? []).some((t) => ["sea", "flood", "waves"].includes(t))) {
    list.push({ tag: "waves", at: 0, volume: 0.45, loop: true, fadeOut: 0.6 });
  }
  return list
    .map(({ tag, ...rest }) => {
      const hit = findTagged("sfx", tag);
      return hit ? { src: hit.src, ...rest } : null;
    })
    .filter(Boolean);
};

/* ------------------------------------------------------------- subtitle */

const endsSentence = (w) => /[.!?…]["')\]]*$/.test(w);
const endsClause = (w) => /[,;:—–]["')\]]*$/.test(w);

/** Kelompokkan kata berwaktu (hasil TTS) menjadi cue subtitle ≤ 4 kata. */
const buildCues = (words, delay) => {
  const groups = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push(w);
    const remaining = words.length - i - 1;
    const brk = cur.length >= MAX_WORDS_PER_CUE || endsSentence(w.text) || (endsClause(w.text) && cur.length >= 2);
    if (remaining > 0 && brk && remaining === 1 && !endsSentence(w.text)) return; // hindari 1 kata yatim
    if (brk || remaining === 0) {
      groups.push(cur);
      cur = [];
    }
  });
  return groups.map((g, gi) => {
    const next = groups[gi + 1];
    const start = g[0].start + delay;
    const end = next ? next[0].start + delay : g[g.length - 1].end + delay;
    return {
      text: g.map((w) => (w.highlight ? `*${w.text}*` : w.text)).join(" "),
      start: +start.toFixed(3),
      end: +Math.max(end, start + 0.3).toFixed(3),
    };
  });
};

/* ---------------------------------------------------------------- scene */

const scenes = draft.scenes.map((scene, i) => {
  const no = i + 1;
  const nn = String(no).padStart(2, "0");
  const isLast = no === draft.scenes.length;
  const mood = MOODS[scene.mood] ?? MOODS.calm;
  if (!MOODS[scene.mood]) warnings.push(`Scene ${no}: mood "${scene.mood}" tidak dikenal → pakai "calm".`);

  const audioSrc = `${episodeDir}/audio/narasi-${nn}.mp3`;
  const metaPath = path.join(P.public, `${episodeDir}/audio/narasi-${nn}.json`);
  const tts = fs.existsSync(metaPath) ? readJson(metaPath) : null;
  if (tts && tts.text !== scene.narration) {
    warnings.push(`Scene ${no}: narasi berubah sejak TTS terakhir — jalankan ulang \`npm run tts -- ${slug}\`.`);
  }
  if (!tts) warnings.push(`Scene ${no}: belum ada audio narasi — jalankan \`npm run tts -- ${slug}\`.`);

  const padding = isLast ? LAST_SCENE_PADDING : AUTO_PADDING;
  const words = scene.narration.split(/\s+/).filter(Boolean).length;
  const seconds = tts ? tts.duration + NARRATION_DELAY + padding : Math.max(4, words / 2.5 + 1);

  /** @type {Record<string, unknown>} */
  const out = {
    id: `s${nn}`,
    label: scene.label ?? `Scene ${no}`,
    duration: tts ? "auto" : +seconds.toFixed(2),
    ...(tts ? { autoPadding: padding } : {}),
    ...(mood.background ? { background: mood.background } : {}),
    transitionIn: no === 1 ? { type: "fade", duration: 0.8 } : mood.transitionIn,
    layers: buildLayers(scene, mood, no),
    camera: mood.camera,
    ...(mood.particles ? { particles: mood.particles } : {}),
    ...(mood.lights ? { lights: mood.lights } : {}),
    ...(mood.grade ? { grade: mood.grade } : {}),
    narration: {
      text: scene.narration,
      ...(tts ? { audio: audioSrc, delay: NARRATION_DELAY, cues: buildCues(tts.words, NARRATION_DELAY) } : {}),
    },
  };

  const sfx = buildSfx(scene, mood).filter((s) => (s.at ?? 0) < seconds - 0.3);
  if (sfx.length) out.sfx = sfx;

  if (scene.overlay) out.overlay = scene.overlay;
  else if (no === 1) out.overlay = { title: draft.title, subtitle: draft.subtitle, y: 26, style: "hero", start: 0.3 };
  else if (isLast) out.overlay = { title: "Ikuti untuk kisah berikutnya", y: 22, style: "cta", start: +Math.max(0.5, seconds - 3).toFixed(2) };

  return out;
});

/* -------------------------------------------------------------- episode */

const music = library.find((a) => a.role === "music" && a.tags.includes(draft.music ?? "default"));
const episode = {
  id: pascalCase(slug),
  title: draft.title,
  ...(draft.subtitle ? { subtitle: draft.subtitle } : {}),
  targetDurationSeconds: null,
  ...(music && draft.music !== "none" ? { music: { src: music.src, volume: 0.35, fadeIn: 1.5, fadeOut: 2.5, duckTo: 0.4 } } : {}),
  scenes,
  _source: { draft: `pipeline/drafts/${slug}.json`, references: draft.references ?? [], reviewed: draft.reviewed === true },
};

writeJson(path.join(P.generated, `${slug}.json`), episode);

/* ------------------------------------------------- index episode generated */

const jsonFiles = fs.readdirSync(P.generated).filter((f) => f.endsWith(".json")).sort();
const imports = jsonFiles.map((f) => `import ${camelCase(f.replace(/\.json$/, ""))} from "./${f}";`).join("\n");
const names = jsonFiles.map((f) => camelCase(f.replace(/\.json$/, ""))).join(", ");
fs.writeFileSync(
  path.join(P.generated, "index.ts"),
  `// File ini dibuat otomatis oleh pipeline/3-build.mjs — jangan diedit manual.
import type { EpisodeConfig } from "../../config/types";
import { withDefaultTheme } from "../shared/theme";
${imports}

export const GENERATED_EPISODES: EpisodeConfig[] = [${names}].map((e) =>
  withDefaultTheme(e as unknown as Omit<EpisodeConfig, "theme"> & { theme?: Partial<EpisodeConfig["theme"]> }),
);
`,
);

/* ------------------------------------------------------- daftar aset kurang */

const needPath = path.join(P.public, episodeDir, "ASSETS-NEEDED.md");
if (missingAssets.length) {
  const lines = [
    `# Gambar yang perlu dibuat — ${draft.title}`,
    "",
    "Simpan di folder ini dengan nama file persis. Lampirkan gambar acuan dari `pipeline/style/reference/` saat generate.",
    "Setelah itu: `npm run remove-bg -- public/" + episodeDir + "` lalu `npm run build:episode -- " + slug + "`.",
    "",
  ];
  const seen = new Set();
  for (const m of missingAssets) {
    if (seen.has(m.file)) continue;
    seen.add(m.file);
    lines.push(
      `## ${m.file}  (scene ${m.scene})`,
      "",
      "```",
      `${style.promptPrefix} ${style.roleHints[m.role]}`,
      `Subject: ${m.file.replace(/\.\w+$/, "").replace(/-/g, " ")}. Scene: ${m.visual}`,
      style.negative,
      "Match the art style of the attached reference images exactly.",
      "```",
      "",
    );
  }
  fs.mkdirSync(path.dirname(needPath), { recursive: true });
  fs.writeFileSync(needPath, lines.join("\n"));
} else if (fs.existsSync(needPath)) {
  fs.unlinkSync(needPath);
}

/* ---------------------------------------------------------------- laporan */

const known = scenes.filter((s) => s.duration === "auto").length;
console.log(`✔ Episode dirakit: ${episode.id} (${scenes.length} scene, ${known} dengan narasi suara)`);
console.log(`  config : src/episodes/generated/${slug}.json`);
if (missingAssets.length) console.log(`  aset   : ${new Set(missingAssets.map((m) => m.file)).size} gambar khas belum ada → public/${episodeDir}/ASSETS-NEEDED.md`);
warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
console.log(`  preview: npm run dev   →   render: npm run render:episode -- ${episode.id}`);
