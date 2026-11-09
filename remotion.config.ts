/**
 * Konfigurasi Remotion CLI (berlaku untuk `remotion studio` dan `remotion render`).
 * Dokumentasi: https://www.remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

// Kualitas output MP4 untuk YouTube Shorts
Config.setCodec("h264");
Config.setCrf(18); // 18 = kualitas tinggi, file lebih besar. Naikkan ke 23 untuk file lebih kecil.
Config.setPixelFormat("yuv420p"); // kompatibel dengan semua player / YouTube
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setAudioCodec("aac");

Config.setOverwriteOutput(true);

// Paralel render; sesuaikan dengan jumlah core CPU Anda (null = otomatis).
Config.setConcurrency(null);

// Gambar besar dari ChatGPT kadang butuh waktu decode lebih lama.
Config.setDelayRenderTimeoutInMilliseconds(60_000);
