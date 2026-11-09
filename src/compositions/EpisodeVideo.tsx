import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { EpisodeVideoProps } from "../config/types";
import { AudioLayer } from "../components/audio/AudioLayer";
import { SafeAreaGuide } from "../components/overlays/SafeAreaGuide";
import { SceneRenderer } from "../components/scene/SceneRenderer";
import { SceneTransition } from "../components/scene/SceneTransition";
import { FontLoader, primaryFamily } from "../components/subtitles/FontLoader";
import { buildTimeline, getTransition, secondsToFrames } from "../lib/timeline";

/**
 * Composition utama: merakit semua scene dari data episode.
 * Komponen ini generik — semua episode memakai komponen yang sama.
 */
export const EpisodeVideo: React.FC<EpisodeVideoProps> = ({
  episode,
  resolvedDurations,
  narrationSeconds,
}) => {
  const timeline = useMemo(
    () => buildTimeline(episode, resolvedDurations),
    [episode, resolvedDurations],
  );
  const { theme } = episode;
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {theme.subtitle.fontFile ? (
        <FontLoader
          family={primaryFamily(theme.subtitle.fontFamily)}
          file={theme.subtitle.fontFile}
          weight={String(theme.subtitle.fontWeight ?? 800)}
        />
      ) : null}
      {theme.titleFontFile && theme.titleFontFamily ? (
        <FontLoader family={primaryFamily(theme.titleFontFamily)} file={theme.titleFontFile} />
      ) : null}

      {timeline.map((scene) => {
        const transition = getTransition(episode, scene.index);
        const preRoll = scene.transitionFrames;
        // scene pertama: transisi dimainkan sebagai intro (fade dari hitam) tanpa pre-roll
        const transitionFrames =
          scene.index === 0 ? Math.min(secondsToFrames(transition.duration, fps), scene.durationInFrames / 2) : preRoll;
        return (
          <Sequence
            key={scene.id}
            name={`${scene.index + 1}. ${scene.label ?? scene.id}`}
            from={scene.from - preRoll}
            durationInFrames={scene.durationInFrames + preRoll}
            premountFor={30}
          >
            <SceneTransition type={transition.type} frames={transitionFrames}>
              <SceneRenderer
                scene={scene}
                theme={theme}
                narrationSeconds={narrationSeconds?.[scene.index]}
              />
            </SceneTransition>
          </Sequence>
        );
      })}

      <AudioLayer episode={episode} timeline={timeline} narrationSeconds={narrationSeconds} />

      {episode.showSafeArea ? <SafeAreaGuide /> : null}
    </AbsoluteFill>
  );
};
