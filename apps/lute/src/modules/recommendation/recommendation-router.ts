import { Router } from "express";
import { Context } from "../../context";
import { buildRecommendationController } from "./recommendation-controller";
import { buildRecommendationPresetRouter } from "./presets";
import { VectorSimilarityController } from "./models";

export const buildRecommendationRouter = (context: Context) => {
  const controller = buildRecommendationController(context);
  const vectorSimilarityController = new VectorSimilarityController(context);

  return Router()
    .use("/presets", buildRecommendationPresetRouter(context))
    .use("/vector-similarity", vectorSimilarityController.router)
    .get("/assessment/album", controller.getAlbumAssessment)
    .get("/assessment/artist", controller.getArtistAssessment)
    .get("/albums", controller.getAlbumRecommendations)
    .get("/artists", controller.getArtistRecommendations);
};
