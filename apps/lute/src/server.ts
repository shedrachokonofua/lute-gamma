import { buildServer } from "@lute/shared";
import { Router } from "express";
import { Context } from "./context";
import { logger } from "./logger";
import { buildCrawlerRouter } from "./modules/crawler/crawler-router";
import { buildFileRouter } from "./modules/files";

export const startServer = buildServer<Context>({
  name: "lute",
  buildRouter(context) {
    return Router()
      .use("/files", buildFileRouter(context))
      .use("/crawler", buildCrawlerRouter(context));
  },
  logger,
});
