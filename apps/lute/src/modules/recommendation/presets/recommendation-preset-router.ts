import { Router } from "express";
import { Context } from "../../../context";
import { buildRecommendationPresetController } from "./recommendation-preset-controller";

export const buildRecommendationPresetRouter = (context: Context) => {
  const controller = buildRecommendationPresetController(context);

  return Router()
    .get("/:type", controller.getPresets)
    .post("/", controller.createPreset);
};
