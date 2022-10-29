import { buildServer } from "@lute/shared";
import { Router } from "express";
import { config } from "./config";
import { Context } from "./context";
import { logger } from "./logger";
import { buildFileRouter } from "./modules/files";

export const startServer = buildServer<Context>({
  name: "lute",
  buildRouter(context) {
    return Router().use("/files", buildFileRouter(context));
  },
  logger,
});
