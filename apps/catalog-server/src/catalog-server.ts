import { buildServer, RedisClient } from "@lute/shared";
import { Router } from "express";
import { logger } from "./logger";
import { buildAuthGuard, buildAuthRouter, buildAuthRepo } from "./auth";
import { buildLibraryRouter } from "./library";

export const startServer = buildServer<{
  redisClient: RedisClient;
}>({
  name: "catalog-server",
  async buildRouter({ redisClient }) {
    const authRepo = buildAuthRepo(redisClient);
    const authGuard = buildAuthGuard(authRepo);

    return Router()
      .use("/auth", buildAuthRouter(authRepo))
      .use("/library", authGuard, buildLibraryRouter());
  },
  logger,
});
