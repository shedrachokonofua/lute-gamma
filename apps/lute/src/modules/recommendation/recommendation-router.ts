import { Router } from "express";
import { Context } from "../../context";
import { buildRecommendationController } from "./recommendation-controller";

export const buildRecommendationRouter = (context: Context) => {
  const controller = buildRecommendationController(context);

  return Router()
    .get("/assessment/album", controller.getAlbumAssessment)
    .get("/albums", controller.getAlbumRecommendations);
};
