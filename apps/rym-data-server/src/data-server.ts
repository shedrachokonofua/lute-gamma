import { buildServer } from "@lute/shared";
import { Router } from "express";
import { buildDataController } from "./data-controller";
import { logger } from "./logger";
import { ServerContext } from "./ServerContext";

export const startServer = buildServer<ServerContext>({
  name: "data-server",
  buildRouter(serverContext) {
    const controller = buildDataController(serverContext);

    return Router()
      .get("/album/*", controller.getAlbum)
      .put("/album", controller.putAlbum)
      .put("/chart", controller.putChart)
      .post("/query", controller.query);
  },
  logger,
});
