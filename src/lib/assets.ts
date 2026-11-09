import { staticFile } from "remotion";

/**
 * Ubah path aset dari config menjadi URL yang bisa dipakai Remotion.
 *  - "episodes/nabi-nuh/bg.webp"  -> staticFile("episodes/nabi-nuh/bg.webp")
 *  - "/episodes/nabi-nuh/bg.webp" -> sama (slash depan diabaikan)
 *  - "https://..."                 -> dipakai apa adanya
 */
export const resolveAsset = (src: string): string => {
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return staticFile(src.replace(/^\/+/, ""));
};
