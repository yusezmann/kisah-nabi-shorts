import { Easing } from "remotion";
import type { EasingName } from "../config/types";

export const getEasing = (name: EasingName = "easeInOut"): ((t: number) => number) => {
  switch (name) {
    case "linear":
      return Easing.linear;
    case "easeIn":
      return Easing.in(Easing.quad);
    case "easeOut":
      return Easing.out(Easing.quad);
    case "easeInOut":
      return Easing.inOut(Easing.quad);
    case "easeInOutCubic":
      return Easing.inOut(Easing.cubic);
    case "easeOutBack":
      return Easing.out(Easing.back(1.6));
    case "easeInOutSine":
      return Easing.inOut(Easing.sin);
    default:
      return Easing.inOut(Easing.quad);
  }
};

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
