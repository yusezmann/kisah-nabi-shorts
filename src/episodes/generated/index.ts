// File ini dibuat otomatis oleh pipeline/3-build.mjs — jangan diedit manual.
import type { EpisodeConfig } from "../../config/types";
import { withDefaultTheme } from "../shared/theme";
import nabiAdam from "./nabi-adam.json";
import nabiSulaimanSemut from "./nabi-sulaiman-semut.json";
import nabiYunus from "./nabi-yunus.json";

export const GENERATED_EPISODES: EpisodeConfig[] = [nabiAdam, nabiSulaimanSemut, nabiYunus].map((e) =>
  withDefaultTheme(e as unknown as Omit<EpisodeConfig, "theme"> & { theme?: Partial<EpisodeConfig["theme"]> }),
);
