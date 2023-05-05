import { buildServer } from "./lib";
import { Router } from "express";
import { Context } from "./context";
import { logger } from "./logger";
import { buildAlbumRouter } from "./modules/albums";
import { buildArtistRouter } from "./modules/artists";
import { buildChartRouter } from "./modules/charts";
import { FileController } from "./modules/files";
import { buildLookupRouter } from "./modules/lookup";
import { buildProfileRouter } from "./modules/profile";
import { buildRecommendationRouter } from "./modules/recommendation";
import { buildSpotifyRouter } from "./modules/spotify";
import { CrawlerController } from "./modules/crawler";

export const startServer = buildServer<Context>({
  name: "lute",
  buildRouter(context) {
    const fileController = new FileController(context);
    const crawlerController = new CrawlerController(context);

    return Router()
      .use("/albums", buildAlbumRouter(context))
      .use("/artists", buildArtistRouter(context))
      .use("/charts", buildChartRouter(context))
      .use("/files", fileController.router)
      .use("/crawler", crawlerController.router)
      .use("/lookup", buildLookupRouter(context))
      .use("/profile", buildProfileRouter(context))
      .use("/recommendation", buildRecommendationRouter(context))
      .use("/spotify", buildSpotifyRouter(context));
  },
  logger,
});
