import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { loadFont } from "@remotion/fonts";
import { resolveAsset } from "../../lib/assets";

/** Ambil nama font pertama dari CSS font stack: "'Kisah Sub', Poppins, sans-serif" -> "Kisah Sub" */
export const primaryFamily = (stack: string) =>
  stack.split(",")[0].trim().replace(/^['"]|['"]$/g, "");

/**
 * Memuat font lokal dari /public sebelum frame dirender.
 * Render ditahan (delayRender) sampai font siap, sehingga tidak ada
 * frame dengan font fallback.
 */
export const FontLoader: React.FC<{ family: string; file: string; weight?: string }> = ({
  family,
  file,
  weight,
}) => {
  const [handle] = useState(() => delayRender(`Memuat font ${family}`));

  useEffect(() => {
    loadFont({ family, url: resolveAsset(file), weight })
      .then(() => continueRender(handle))
      .catch((err: Error) =>
        cancelRender(new Error(`Font "${file}" gagal dimuat: ${err.message}`)),
      );
  }, [family, file, weight, handle]);

  return null;
};
