import { buildServer } from "@lute/shared";
import { Router } from "express";
import { Db } from "mongodb";
import { logger } from "./logger";
import { buildProfileController } from "./profile-controller";

export const startServer = buildServer<{
  mongoDatabase: Db;
}>({
  name: "profile-server",
  buildRouter(context) {
    const controller = buildProfileController(context);

    return Router()
      .post("/", controller.createProfile)
      .get("/:id", controller.getProfile)
      .post("/:id/album", controller.putAlbumOnProfile)
      .get("/:id/album/:albumFileId/assessment", controller.getAlbumAssessment)
      .get("/:id/recommendations", controller.getRecommendations)
      .post("/seed/default", controller.seedDefaultProfile);
  },
  logger,
});
