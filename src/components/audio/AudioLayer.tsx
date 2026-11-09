import React from "react";
import { Audio, interpolate, Sequence, useVideoConfig } from "remotion";
import type { EpisodeConfig, ResolvedScene, SoundEffectConfig } from "../../config/types";
import { resolveAsset } from "../../lib/assets";
import { secondsToFrames } from "../../lib/timeline";

type Props = {
  episode: EpisodeConfig;
  timeline: ResolvedScene[];
  narrationSeconds?: (number | null)[];
};

/** Audio dengan potongan awal (trim) memakai teknik Sequence negatif — kompatibel semua versi Remotion v4. */
const TrimmedAudio: React.FC<{
  src: string;
  trimFrames: number;
  volume: number | ((f: number) => number);
  loop?: boolean;
  playbackRate?: number;
}> = ({ src, trimFrames, volume, loop, playbackRate }) => {
  if (trimFrames <= 0) {
    return <Audio src={src} volume={volume} loop={loop} playbackRate={playbackRate} />;
  }
  return (
    <Sequence from={-trimFrames} layout="none">
      {/* volume function menerima frame lokal Sequence ini, jadi geser kembali */}
      <Audio
        src={src}
        volume={typeof volume === "function" ? (f) => volume(f - trimFrames) : volume}
        loop={loop}
        playbackRate={playbackRate}
      />
    </Sequence>
  );
};

const fadeVolume = (
  f: number,
  totalFrames: number,
  base: number,
  fadeInFrames: number,
  fadeOutFrames: number,
) => {
  let v = base;
  if (fadeInFrames > 0) {
    v *= interpolate(f, [0, fadeInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }
  if (fadeOutFrames > 0 && Number.isFinite(totalFrames)) {
    v *= interpolate(f, [totalFrames - fadeOutFrames, totalFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return v;
};

const SoundEffect: React.FC<{ sfx: SoundEffectConfig; sceneFrom: number; sceneFrames: number; fps: number }> = ({
  sfx,
  sceneFrom,
  sceneFrames,
  fps,
}) => {
  const from = sceneFrom + secondsToFrames(sfx.at ?? 0, fps);
  const duration = sfx.duration
    ? secondsToFrames(sfx.duration, fps)
    : sfx.loop
      ? Math.max(1, sceneFrames - secondsToFrames(sfx.at ?? 0, fps))
      : undefined;
  const fi = secondsToFrames(sfx.fadeIn ?? 0, fps);
  const fo = secondsToFrames(sfx.fadeOut ?? 0, fps);
  return (
    <Sequence from={from} durationInFrames={duration} layout="none">
      <TrimmedAudio
        src={resolveAsset(sfx.src)}
        trimFrames={secondsToFrames(sfx.trimStart ?? 0, fps)}
        volume={(f) => fadeVolume(f, duration ?? Infinity, sfx.volume ?? 1, fi, fo)}
        loop={sfx.loop}
        playbackRate={sfx.playbackRate}
      />
    </Sequence>
  );
};

/**
 * Semua audio episode dirender di satu tempat dengan frame absolut:
 *  - musik latar (fade in/out + ducking otomatis saat narasi)
 *  - narasi per scene ATAU satu file narasi penuh
 *  - sound effect per scene
 */
export const AudioLayer: React.FC<Props> = ({ episode, timeline, narrationSeconds }) => {
  const { fps, durationInFrames } = useVideoConfig();

  // Jendela waktu narasi (frame absolut) untuk ducking musik
  const narrationWindows = timeline
    .filter((s) => s.narration?.text || s.narration?.audio)
    .map((s) => {
      const start = s.from + secondsToFrames(s.narration?.delay ?? 0.25, fps);
      const len = narrationSeconds?.[s.index];
      const end = len ? start + secondsToFrames(len, fps) : s.from + s.durationInFrames - 6;
      return [start, end] as const;
    });

  const music = episode.music;
  const duckRamp = Math.round(fps * 0.4);
  const musicVolume = (f: number) => {
    if (!music) return 0;
    const base = fadeVolume(
      f,
      durationInFrames,
      music.volume ?? 0.35,
      secondsToFrames(music.fadeIn ?? 1, fps),
      secondsToFrames(music.fadeOut ?? 2, fps),
    );
    const duckTo = music.duckTo ?? 1;
    if (duckTo >= 1) return base;
    let duck = 0;
    for (const [s, e] of narrationWindows) {
      const d = interpolate(f, [s - duckRamp, s, e, e + duckRamp], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      duck = Math.max(duck, d);
    }
    return base * (1 - duck * (1 - duckTo));
  };

  return (
    <>
      {music ? (
        <TrimmedAudio
          src={resolveAsset(music.src)}
          trimFrames={secondsToFrames(music.trimStart ?? 0, fps)}
          volume={musicVolume}
          loop={music.loop ?? true}
        />
      ) : null}

      {episode.fullNarration ? (
        <Sequence from={secondsToFrames(episode.fullNarration.startAt ?? 0, fps)} layout="none">
          <Audio src={resolveAsset(episode.fullNarration.src)} volume={episode.fullNarration.volume ?? 1} />
        </Sequence>
      ) : null}

      {timeline.map((scene) => (
        <React.Fragment key={scene.id}>
          {scene.narration?.audio && !episode.fullNarration ? (
            <Sequence
              from={scene.from + secondsToFrames(scene.narration.delay ?? 0.25, fps)}
              layout="none"
            >
              <Audio src={resolveAsset(scene.narration.audio)} volume={scene.narration.volume ?? 1} />
            </Sequence>
          ) : null}
          {scene.sfx?.map((sfx, i) => (
            <SoundEffect
              key={`${scene.id}-sfx-${i}`}
              sfx={sfx}
              sceneFrom={scene.from}
              sceneFrames={scene.durationInFrames}
              fps={fps}
            />
          ))}
        </React.Fragment>
      ))}
    </>
  );
};
