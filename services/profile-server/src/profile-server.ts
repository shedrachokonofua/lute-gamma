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
      .get("/:id", controller.getProfile)
      .post("/:id/album", controller.addAlbumToProfile);
  },
  logger,
});
