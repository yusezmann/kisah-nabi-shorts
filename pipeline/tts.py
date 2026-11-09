"""
TTS narasi per scene memakai edge-tts (gratis).

  python pipeline/tts.py <slug>        # naskah pipeline/drafts/<slug>.json
  python pipeline/tts.py --samples     # contoh semua suara di voice.json → pipeline/samples/

Hasil per scene di public/episodes/<slug>/audio/:
  narasi-XX.mp3   audio (dinormalisasi loudness)
  narasi-XX.json  waktu tiap kata (detik dari awal audio) untuk subtitle karaoke

Dijalankan lewat `npm run tts -- <slug>` (memakai uv agar edge-tts tersedia).
"""

import asyncio
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "pipeline", "config")


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def find_tool(name):
    """ffmpeg/ffprobe bawaan Remotion, atau dari PATH."""
    exe = name + (".exe" if os.name == "nt" else "")
    for path in glob.glob(os.path.join(ROOT, "node_modules", "@remotion", "compositor-*", exe)):
        return path
    return shutil.which(name)


FFMPEG = find_tool("ffmpeg")
FFPROBE = find_tool("ffprobe")


# --------------------------------------------------------------------------- teks

def parse_tokens(text):
    """Sama dengan parseWords() di src/lib/subtitles.ts: kenali *highlight*."""
    out = []
    in_hl = False
    for token in text.strip().split():
        opens = token.startswith("*")
        closes = bool(re.search(r"\*[^\w]*$", token)) and (len(token) > 1 or not opens)
        if opens:
            in_hl = True
        clean = token.replace("*", "")
        if clean:
            out.append({"text": clean, "highlight": in_hl})
        if closes:
            in_hl = False
    return out


def spoken_form(word, lexicon):
    """Ganti kata sesuai kamus pelafalan, pertahankan tanda baca."""
    m = re.match(r"^([^\w']*)([\w'\-]+)([^\w]*)$", word)
    if not m:
        return word
    pre, core, post = m.groups()
    key = core.lower()
    return pre + lexicon.get(key, core) + post if key in lexicon else word


# --------------------------------------------------------------------------- audio

async def synthesize(text, voice, rate, pitch):
    """Kembalikan (bytes mp3, daftar boundary {text,start,end})."""
    try:
        comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    except TypeError:  # edge-tts lama: boundary per kata sudah default
        comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    audio = bytearray()
    bounds = []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
            start = chunk["offset"] / 1e7
            bounds.append({
                "kind": chunk["type"],
                "text": chunk["text"],
                "start": start,
                "end": start + chunk["duration"] / 1e7,
            })
    # utamakan boundary per kata bila ada
    words = [b for b in bounds if b["kind"] == "WordBoundary"]
    return bytes(audio), (words or bounds)


def normalize(src, dst, loudness):
    if not FFMPEG:
        shutil.copyfile(src, dst)
        print("  ! ffmpeg tidak ditemukan — loudness tidak dinormalisasi")
        return
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", src,
         "-af", f"loudnorm=I={loudness}:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "160k", dst],
        check=True,
    )


def duration_of(path, fallback):
    if not FFPROBE:
        return fallback
    out = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True,
    )
    try:
        return float(out.stdout.strip())
    except ValueError:
        return fallback


# --------------------------------------------------------------------------- waktu kata

def align(tokens, spoken_tokens, bounds, total):
    """Tentukan start/end tiap token tampilan dari boundary TTS (dicocokkan lewat posisi karakter)."""
    spoken_text = " ".join(spoken_tokens)
    starts, pos = [], 0
    for s in spoken_tokens:
        starts.append(pos)
        pos += len(s) + 1
    starts.append(len(spoken_text) + 1)

    anchors, cursor = [], 0
    for b in bounds:
        idx = spoken_text.find(b["text"], cursor)
        if idx >= 0:
            anchors.append((idx, b["start"], b["end"]))
            cursor = idx + len(b["text"])

    timed = []
    for i in range(len(tokens)):
        hits = [a for a in anchors if starts[i] <= a[0] < starts[i + 1]]
        timed.append((min(h[1] for h in hits), max(h[2] for h in hits)) if hits else None)

    # isi token yang tidak cocok: interpolasi linear di antara tetangga
    known = [i for i, t in enumerate(timed) if t]
    if not known:
        weights = [len(re.sub(r"\W", "", t["text"])) + 2 for t in tokens]
        acc, out = 0.0, []
        for w in weights:
            d = w / sum(weights) * total
            out.append((acc, acc + d))
            acc += d
        timed = out
    else:
        for i, t in enumerate(timed):
            if t:
                continue
            prev = max((k for k in known if k < i), default=None)
            nxt = min((k for k in known if k > i), default=None)
            a = timed[prev][1] if prev is not None else 0.0
            b = timed[nxt][0] if nxt is not None else total
            lo = prev if prev is not None else -1
            hi = nxt if nxt is not None else len(tokens)
            span = (b - a) / (hi - lo - 1 or 1)
            k = i - lo - 1
            timed[i] = (a + span * k, a + span * (k + 1))

    return [
        {"text": tok["text"], "highlight": tok["highlight"], "start": round(s, 3), "end": round(e, 3)}
        for tok, (s, e) in zip(tokens, timed)
    ]


# --------------------------------------------------------------------------- utama

async def tts_scene(text, out_base, voice_cfg, lexicon):
    tokens = parse_tokens(text)
    spoken = [spoken_form(t["text"], lexicon) for t in tokens]
    spoken_text = " ".join(spoken)
    digest = hashlib.sha1(json.dumps([spoken_text, voice_cfg], sort_keys=True).encode()).hexdigest()[:12]

    mp3, meta_path = out_base + ".mp3", out_base + ".json"
    if os.path.exists(mp3) and os.path.exists(meta_path):
        if load_json(meta_path).get("hash") == digest:
            return "cache"

    audio, bounds = await synthesize(spoken_text, voice_cfg["voice"], voice_cfg["rate"], voice_cfg["pitch"])
    if not audio:
        raise RuntimeError("edge-tts tidak mengembalikan audio (cek koneksi internet / nama suara)")
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(audio)
    try:
        normalize(tmp.name, mp3, voice_cfg.get("loudness", -16))
    finally:
        os.unlink(tmp.name)

    total = duration_of(mp3, bounds[-1]["end"] + 0.3 if bounds else 3.0)
    words = align(tokens, spoken, bounds, total)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({"hash": digest, "voice": voice_cfg["voice"], "duration": round(total, 3),
                   "text": text, "spoken": spoken_text, "words": words}, f, ensure_ascii=False, indent=1)
    return f"{total:.2f}s"


async def run_episode(slug):
    draft_path = os.path.join(ROOT, "pipeline", "drafts", f"{slug}.json")
    if not os.path.exists(draft_path):
        sys.exit(f"✖ Naskah tidak ditemukan: pipeline/drafts/{slug}.json")
    draft = load_json(draft_path)
    voice_cfg = load_json(os.path.join(CONFIG, "voice.json"))
    lexicon = {k.lower(): v for k, v in load_json(os.path.join(CONFIG, "lexicon.json")).items() if not k.startswith("_")}
    out_dir = os.path.join(ROOT, "public", "episodes", slug, "audio")
    os.makedirs(out_dir, exist_ok=True)

    print(f"▶ TTS {slug} — suara {voice_cfg['voice']}")
    for i, scene in enumerate(draft["scenes"], start=1):
        text = scene.get("narration", "").strip()
        if not text:
            continue
        status = await tts_scene(text, os.path.join(out_dir, f"narasi-{i:02d}"), voice_cfg, lexicon)
        print(f"  scene {i:02d}: {status}")
    print("✔ Selesai")


async def run_samples():
    voice_cfg = load_json(os.path.join(CONFIG, "voice.json"))
    lexicon = {k.lower(): v for k, v in load_json(os.path.join(CONFIG, "lexicon.json")).items() if not k.startswith("_")}
    out_dir = os.path.join(ROOT, "pipeline", "samples")
    os.makedirs(out_dir, exist_ok=True)
    text = ("Inilah kisah Nabi Nuh *alaihissalam*, rasul yang sabar luar biasa. "
            "Selama *950 tahun*, beliau mengajak kaumnya menyembah Allah semata.")
    for voice in voice_cfg.get("_alternatives", [voice_cfg["voice"]]):
        cfg = dict(voice_cfg, voice=voice)
        status = await tts_scene(text, os.path.join(out_dir, voice), cfg, lexicon)
        print(f"  {voice}: pipeline/samples/{voice}.mp3 ({status})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Pemakaian: python pipeline/tts.py <slug> | --samples")
    if sys.argv[1] == "--samples":
        asyncio.run(run_samples())
    else:
        asyncio.run(run_episode(sys.argv[1]))
