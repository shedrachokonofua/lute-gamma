import { buildRedisClient, buildServer } from "@lute/shared";
import { Router } from "express";
import { REDIS_URL } from "./config";
import { buildCrawlerController } from "./crawler-controller";
import { buildCrawlerRepo } from "./crawler-repo";
import { logger } from "./logger";

export const startServer = buildServer({
  name: "crawler-server",
  async buildRouter() {
    const controller = buildCrawlerController({
      crawlerRepo: buildCrawlerRepo(
        await buildRedisClient({ logger, url: REDIS_URL })
      ),
    });

    return Router()
      .get("/monitor", controller.getMonitor)
      .put("/status", controller.putStatus)
      .get("/status", controller.getStatus)
      .get("/head", controller.getHead)
      .post("/schedule", controller.schedule)
      .delete("/error", controller.clearError)
      .get("/error", controller.getError)
      .post("/empty", controller.empty);
  },
  logger,
});
