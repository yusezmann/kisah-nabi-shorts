#!/usr/bin/env node
/**
 * Periksa pustaka aset: file yang hilang, file yang belum terdaftar, id/tag duplikat.
 *
 *   npm run library:check
 */
import fs from "node:fs";
import path from "node:path";
import { P, loadLibrary } from "./lib.mjs";

const ROLES = ["sky", "atmo", "far", "mid", "water", "prop", "figure", "fg", "sfx", "music"];
const assets = loadLibrary();
const problems = [];

const ids = new Set();
for (const a of assets) {
  if (ids.has(a.id)) problems.push(`id duplikat: ${a.id}`);
  ids.add(a.id);
  if (!ROLES.includes(a.role)) problems.push(`${a.id}: role "${a.role}" tidak dikenal`);
  if (!fs.existsSync(path.join(P.public, a.src))) problems.push(`${a.id}: file tidak ada (${a.src})`);
  if (!a.tags?.length) problems.push(`${a.id}: tidak punya tag`);
}

const libDir = path.join(P.public, "library");
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)],
  );
const registered = new Set(assets.map((a) => a.src));
const unregistered = walk(libDir)
  .filter((f) => /\.(png|webp|jpe?g|mp3|wav|ogg)$/i.test(f))
  .map((f) => path.relative(P.public, f).split(path.sep).join("/"))
  .filter((f) => !registered.has(f));

const count = (role) => assets.filter((a) => a.role === role).length;
console.log(`Pustaka: ${assets.length} aset — ` + ROLES.map((r) => `${r} ${count(r)}`).join(", "));
const tags = (role) => [...new Set(assets.filter((a) => a.role === role).flatMap((a) => a.tags))].join(", ");
console.log(`  langit : ${tags("sky")}`);
console.log(`  tempat : ${[tags("far"), tags("mid"), tags("water")].filter(Boolean).join(", ")}`);
console.log(`  tokoh  : ${tags("figure")}`);
console.log(`  objek  : ${tags("prop")}`);

unregistered.forEach((f) => console.warn(`  ⚠ belum terdaftar di library.json: ${f}`));
problems.forEach((p) => console.error(`  ✖ ${p}`));
if (problems.length) process.exit(1);
console.log("✔ Pustaka OK");
