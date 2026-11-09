/** Utilitas bersama untuk script pipeline. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const P = {
  drafts: path.join(ROOT, "pipeline/drafts"),
  config: path.join(ROOT, "pipeline/config"),
  prompts: path.join(ROOT, "pipeline/prompts"),
  public: path.join(ROOT, "public"),
  library: path.join(ROOT, "public/library/library.json"),
  generated: path.join(ROOT, "src/episodes/generated"),
};

export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
export const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
};

/** "nabi-yunus" → "NabiYunus" */
export const pascalCase = (slug) =>
  slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
/** "nabi-yunus" → "nabiYunus" */
export const camelCase = (slug) => {
  const p = pascalCase(slug);
  return p.charAt(0).toLowerCase() + p.slice(1);
};

export const assertSlug = (slug, usage) => {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    console.error(usage);
    process.exit(1);
  }
};

export const loadLibrary = () => readJson(P.library).assets;

/** Daftar tag pustaka per peran — dipakai di prompt naskah. */
export const libraryTags = (assets, roles) => {
  const tags = new Set();
  assets.filter((a) => roles.includes(a.role)).forEach((a) => a.tags.forEach((t) => tags.add(t)));
  return [...tags];
};

/** Jalankan perintah, teruskan output ke terminal; hentikan proses bila gagal. */
export const run = (cmd, args, opts = {}) => {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", cwd: ROOT, ...opts });
  if (res.status !== 0) {
    console.error(`✖ Gagal: ${cmd} ${args.join(" ")}`);
    process.exit(res.status ?? 1);
  }
};

export const hasCommand = (cmd) =>
  spawnSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore", shell: true }).status === 0;
