import { EventBusController, buildServer } from "./lib";
import { Router } from "express";
import { Context } from "./context";
import { logger } from "./logger";
import { AlbumController } from "./modules/albums";
import { buildArtistRouter } from "./modules/artists";
import { buildChartRouter } from "./modules/charts";
import { FileController } from "./modules/files";
import { LookupController } from "./modules/lookup";
import { buildProfileRouter } from "./modules/profile";
import { buildRecommendationRouter } from "./modules/recommendation";
import { buildSpotifyRouter } from "./modules/spotify";
import { CrawlerController } from "./modules/crawler";
import { FileParserController } from "./modules/file-parser";

export const startServer = buildServer<Context>({
  name: "lute",
  buildRouter(context) {
    const albumController = new AlbumController(context);
    const crawlerController = new CrawlerController(context);
    const eventBusController = new EventBusController(context);
    const fileController = new FileController(context);
    const fileParserController = new FileParserController(context);
    const lookupController = new LookupController(context);

    return Router()
      .use("/albums", albumController.router)
      .use("/artists", buildArtistRouter(context))
      .use("/charts", buildChartRouter(context))
      .use("/event-bus", eventBusController.router)
      .use("/crawler", crawlerController.router)
      .use("/files", fileController.router)
      .use("/file-parser", fileParserController.router)
      .use("/lookup", lookupController.router)
      .use("/profile", buildProfileRouter(context))
      .use("/recommendation", buildRecommendationRouter(context))
      .use("/spotify", buildSpotifyRouter(context));
  },
  logger,
});
