import { buildServer } from "@lute/shared";
import { Router } from "express";
import { logger } from "./logger";
import { buildProfileController } from "./profile-controller";
import { ServerContext } from "./server-context";

export const startServer = buildServer<ServerContext>({
  name: "profile-server",
  buildRouter(context) {
    const controller = buildProfileController(context);

    return Router()
      .post("/", controller.createProfile)
      .get("/:id", controller.getProfile)
      .post("/:id/album", controller.putAlbumOnProfile)
      .get("/:id/album/:albumFileId/assessment", controller.getAlbumAssessment)
      .get("/:id/recommendations", controller.getRecommendations)
      .post("/seed/default", controller.seedDefaultProfile)
      .post(
        "/seed/:id/playlists/:playlistId",
        controller.seedProfileWithPlaylist
      );
  },
  logger,
});
