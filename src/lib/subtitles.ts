import type { NarrationConfig } from "../config/types";

export type TimedWord = {
  text: string;
  highlight: boolean;
  /** detik relatif terhadap awal scene */
  start: number;
  end: number;
};

export type TimedChunk = {
  words: TimedWord[];
  start: number;
  end: number;
};

type RawWord = { text: string; highlight: boolean };

/** Pecah teks menjadi kata, mengenali *highlight* (bisa lebih dari satu kata). */
export const parseWords = (text: string): RawWord[] => {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const out: RawWord[] = [];
  let inHighlight = false;
  for (const token of tokens) {
    const opens = token.startsWith("*");
    const closes = /\*[^\w]*$/.test(token) && (token.length > 1 || !opens);
    if (opens) inHighlight = true;
    const clean = token.replace(/\*/g, "");
    if (clean) out.push({ text: clean, highlight: inHighlight });
    if (closes) inHighlight = false;
  }
  return out;
};

const endsSentence = (w: string) => /[.!?…]["')\]]*$/.test(w);
const endsClause = (w: string) => /[,;:—–]["')\]]*$/.test(w);

/** Bobot waktu tiap kata: kata panjang & tanda baca butuh waktu lebih. */
const wordWeight = (w: string) => {
  let weight = w.replace(/[^\p{L}\p{N}]/gu, "").length + 2;
  if (endsSentence(w)) weight += 5;
  else if (endsClause(w)) weight += 3;
  return weight;
};

const timeWords = (words: RawWord[], start: number, end: number): TimedWord[] => {
  const weights = words.map((w) => wordWeight(w.text));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const span = Math.max(0.01, end - start);
  let t = start;
  return words.map((w, i) => {
    const d = (weights[i] / total) * span;
    const tw = { ...w, start: t, end: t + d };
    t += d;
    return tw;
  });
};

const chunkWords = (words: RawWord[], maxWords: number): RawWord[][] => {
  const chunks: RawWord[][] = [];
  let current: RawWord[] = [];
  words.forEach((w, i) => {
    current.push(w);
    const isLast = i === words.length - 1;
    const remaining = words.length - i - 1;
    const breakHere =
      current.length >= maxWords ||
      endsSentence(w.text) ||
      (endsClause(w.text) && current.length >= 2);
    // hindari potongan terakhir berisi 1 kata yatim
    if (!isLast && breakHere && remaining === 1 && current.length < maxWords + 1 && !endsSentence(w.text)) {
      return;
    }
    if (breakHere || isLast) {
      chunks.push(current);
      current = [];
    }
  });
  return chunks;
};

/**
 * Bangun potongan subtitle berwaktu untuk satu scene.
 * @param sceneSeconds durasi scene
 * @param narrationSeconds durasi audio narasi (jika diketahui) — membuat sinkron lebih akurat
 */
export const buildSubtitleChunks = (
  narration: NarrationConfig,
  sceneSeconds: number,
  narrationSeconds?: number,
): TimedChunk[] => {
  if (narration.cues && narration.cues.length > 0) {
    return narration.cues.map((cue) => {
      const words = timeWords(parseWords(cue.text), cue.start, cue.end);
      return { words, start: cue.start, end: cue.end };
    });
  }

  const delay = narration.delay ?? 0.25;
  const tail = 0.35;
  const end = narrationSeconds
    ? Math.min(sceneSeconds - 0.05, delay + narrationSeconds)
    : sceneSeconds - tail;

  const words = parseWords(narration.text);
  if (words.length === 0) return [];

  const timed = timeWords(words, delay, Math.max(delay + 0.5, end));
  const groups = chunkWords(words, narration.maxWordsPerChunk ?? 4);

  const chunks: TimedChunk[] = [];
  let idx = 0;
  for (const group of groups) {
    const slice = timed.slice(idx, idx + group.length);
    idx += group.length;
    chunks.push({ words: slice, start: slice[0].start, end: slice[slice.length - 1].end });
  }
  // potongan terakhir bertahan sampai mendekati akhir scene
  const last = chunks[chunks.length - 1];
  last.end = Math.max(last.end, sceneSeconds - 0.15);
  return chunks;
};
