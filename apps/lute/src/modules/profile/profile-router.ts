import { Router } from "express";
import { Context } from "../../context";
import { buildProfileController } from "./profile-controller";

export const buildProfileRouter = (context: Context) => {
  const controller = buildProfileController(context);

  return Router()
    .post("/", controller.createProfile)
    .get("/", controller.getProfiles)
    .get("/:id", controller.getProfile)
    .delete("/:id", controller.deleteProfile)
    .post("/:id/album", controller.putAlbumOnProfile)
    .post("/seed/default", controller.seedDefaultProfile)
    .post(
      "/seed/:id/playlists/:playlistId",
      controller.seedProfileWithPlaylist
    );
};
