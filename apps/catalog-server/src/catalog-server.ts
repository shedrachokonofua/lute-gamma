import { buildServer, RedisClient } from "@lute/shared";
import { Router } from "express";
import { logger } from "./logger";
import { buildAuthGuard, buildAuthRouter } from "./auth";
import { buildCatalogRepo } from "./catalog-repo";
import { buildCatalogController } from "./catalog-controller";

export const startServer = buildServer<{
  redisClient: RedisClient;
}>({
  name: "catalog-server",
  async buildRouter({ redisClient }) {
    const catalogRepo = buildCatalogRepo(redisClient);
    const authGuard = buildAuthGuard(catalogRepo);
    const catalogController = buildCatalogController({
      catalogRepo,
    });

    const authRequiredRouter = Router()
      .get("/tracks", authGuard, catalogController.getSavedTracks)
      .get(
        "/playlists/:playlistId/tracks",
        authGuard,
        catalogController.getPlaylistTracks
      );

    return Router()
      .use("/auth", buildAuthRouter(catalogRepo))
      .use(authRequiredRouter);
  },
  logger,
});
