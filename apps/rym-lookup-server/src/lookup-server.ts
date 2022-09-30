import { buildRedisClient, buildServer } from "@lute/shared";
import { Router } from "express";
import { REDIS_URL } from "./config";
import { logger } from "./logger";
import { buildLookupController } from "./lookup-controller";
import { buildLookupRepo } from "./lookup-repo";

export const startServer = buildServer({
  name: "rym-lookup-server",
  async buildRouter() {
    const redisClient = await buildRedisClient({ logger, url: REDIS_URL });
    const lookupController = buildLookupController({
      lookupRepo: buildLookupRepo(redisClient),
    });

    return Router()
      .get("/", lookupController.getOrCreateLookup)
      .put("/:hash", lookupController.putLookup)
      .get("/:hash", lookupController.getLookupByHash)
      .delete("/:hash", lookupController.deleteLookup);
  },
  logger,
});
