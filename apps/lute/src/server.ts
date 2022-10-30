import { buildServer } from "@lute/shared";
import { Router } from "express";
import { Context } from "./context";
import { logger } from "./logger";
import { buildAlbumRouter } from "./modules/albums";
import { buildCrawlerRouter } from "./modules/crawler";
import { buildFileRouter } from "./modules/files";

export const startServer = buildServer<Context>({
  name: "lute",
  buildRouter(context) {
    return Router()
      .use("/albums", buildAlbumRouter(context))
      .use("/files", buildFileRouter(context))
      .use("/crawler", buildCrawlerRouter(context));
  },
  logger,
});