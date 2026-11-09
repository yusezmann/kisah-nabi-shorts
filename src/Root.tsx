import React from "react";
import { Composition, Folder } from "remotion";
import { EpisodeVideo } from "./compositions/EpisodeVideo";
import { VIDEO } from "./config/video";
import { EPISODES } from "./episodes";
import { calculateEpisodeMetadata } from "./lib/metadata";

/**
 * Setiap episode di src/episodes/index.ts otomatis menjadi satu Composition.
 * Render: npx remotion render src/index.ts <ID-EPISODE> out/<nama>.mp4
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Kisah-Nabi">
      {EPISODES.map((episode) => (
        <Composition
          key={episode.id}
          id={episode.id}
          component={EpisodeVideo}
          // nilai awal; durasi final dihitung ulang oleh calculateMetadata
          durationInFrames={VIDEO.targetDurationSeconds * VIDEO.fps}
          fps={episode.fps ?? VIDEO.fps}
          width={episode.width ?? VIDEO.width}
          height={episode.height ?? VIDEO.height}
          defaultProps={{ episode }}
          calculateMetadata={calculateEpisodeMetadata}
        />
      ))}
    </Folder>
  );
};
