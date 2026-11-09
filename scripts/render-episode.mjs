#!/usr/bin/env node
/**
 * Render satu atau semua episode lewat Remotion CLI.
 *
 *   npm run render:episode -- NabiNuh          → out/NabiNuh.mp4
 *   npm run render:episode -- NabiNuh --draft  → render cepat setengah resolusi
 *   npm run render:all                          → semua composition
 */
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const draft = args.includes("--draft");
const all = args.includes("--all");
const ids = args.filter((a) => !a.startsWith("--"));

const listCompositions = () => {
  const out = execSync("npx remotion compositions src/index.ts --quiet", { encoding: "utf8" });
  return out
    .split("\n")
    .map((l) => l.trim().split(/\s+/)[0])
    .filter((id) => id && /^[A-Za-z0-9-]+$/.test(id));
};

const targets = all ? listCompositions() : ids;
if (targets.length === 0) {
  console.error("Pemakaian: npm run render:episode -- <ID> [--draft]   atau   npm run render:all");
  process.exit(1);
}

for (const id of targets) {
  const out = `out/${id}${draft ? "-draft" : ""}.mp4`;
  const flags = draft ? "--scale=0.5 --crf=28" : "";
  const cmd = `npx remotion render src/index.ts ${id} ${out} ${flags}`;
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}
