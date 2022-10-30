import { Router } from "express";
import { Context } from "../../context";
import { buildProfileController } from "./profile-controller";

export const buildProfileRouter = (context: Context) => {
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
};
