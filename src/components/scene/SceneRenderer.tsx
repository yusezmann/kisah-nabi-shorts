import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { EpisodeTheme, ResolvedScene } from "../../config/types";
import { CameraRig } from "../camera/CameraRig";
import { ColorGrade } from "../effects/ColorGrade";
import { Lights } from "../effects/Lights";
import { Particles } from "../effects/Particles";
import { TextOverlay } from "../overlays/TextOverlay";
import { ParallaxBackground } from "../parallax/ParallaxBackground";
import { AnimatedSubtitle } from "../subtitles/AnimatedSubtitle";
import { SceneContext } from "./SceneContext";

type Props = {
  scene: ResolvedScene;
  theme: EpisodeTheme;
  narrationSeconds?: number | null;
};

/**
 * Susunan lapisan satu scene (dari belakang ke depan):
 *
 *   background color
 *   ┌ CameraRig (zoom/pan/shake) ───────────────┐
 *   │  layer depth < 1   (langit, gunung, dll)   │
 *   │  partikel "back"                           │
 *   │  layer depth >= 1  (foreground)            │
 *   │  partikel "front"                          │
 *   │  cahaya (god rays, glow, kilat, flare)     │
 *   └────────────────────────────────────────────┘
 *   color grade (tint, vignette, grain)
 *   teks overlay (judul / CTA)
 *   subtitle narasi
 */
export const SceneRenderer: React.FC<Props> = ({ scene, theme, narrationSeconds }) => {
  const preRoll = scene.transitionFrames;
  const timing = useMemo(
    () => ({
      preRollFrames: preRoll,
      sceneSeconds: scene.durationInSeconds,
      sceneIndex: scene.index,
      sceneId: scene.id,
    }),
    [preRoll, scene.durationInSeconds, scene.index, scene.id],
  );

  const grade = { ...theme.grade, ...scene.grade };
  const backParticles = scene.particles?.filter((p) => p.layer === "back") ?? [];
  const frontParticles = scene.particles?.filter((p) => p.layer !== "back") ?? [];

  return (
    <SceneContext.Provider value={timing}>
      <AbsoluteFill style={{ background: scene.background ?? "#05060a", overflow: "hidden" }}>
        <CameraRig
          config={scene.camera}
          durationInFrames={scene.durationInFrames + preRoll}
          preRollFrames={preRoll}
          seed={scene.id}
        >
          <AbsoluteFill style={{ filter: grade.filter }}>
            <ParallaxBackground layers={scene.layers} depthRange={[-Infinity, 1]} />
            {backParticles.map((p, i) => (
              <Particles key={`b${i}`} config={p} />
            ))}
            <ParallaxBackground layers={scene.layers} depthRange={[1, Infinity]} />
            {frontParticles.map((p, i) => (
              <Particles key={`f${i}`} config={p} />
            ))}
            {scene.lights ? <Lights lights={scene.lights} /> : null}
          </AbsoluteFill>
        </CameraRig>

        <ColorGrade grade={grade} />

        {scene.overlay ? (
          <TextOverlay
            overlay={scene.overlay}
            fontFamily={theme.titleFontFamily ?? theme.subtitle.fontFamily}
            accentColor={theme.accentColor ?? "#ffcf5a"}
          />
        ) : null}

        {scene.narration ? (
          <AnimatedSubtitle
            narration={scene.narration}
            theme={theme.subtitle}
            narrationSeconds={narrationSeconds}
          />
        ) : null}
      </AbsoluteFill>
    </SceneContext.Provider>
  );
};
