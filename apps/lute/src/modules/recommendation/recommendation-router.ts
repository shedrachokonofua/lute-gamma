import { Router } from "express";
import { Context } from "../../context";
import { buildRecommendationController } from "./recommendation-controller";
import { buildRecommendationPresetRouter } from "./presets";

export const buildRecommendationRouter = (context: Context) => {
  const controller = buildRecommendationController(context);

  return Router()
    .use("/presets", buildRecommendationPresetRouter(context))
    .get("/assessment/album", controller.getAlbumAssessment)
    .get("/assessment/artist", controller.getArtistAssessment)
    .get("/albums", controller.getAlbumRecommendations)
    .get("/artists", controller.getArtistRecommendations);
};
