import { buildServer } from "@lute/shared";
import { Router } from "express";
import { Db } from "mongodb";
import { logger } from "./logger";

export const startServer = buildServer<{
  mongoDatabase: Db;
}>({
  name: "profile-server",
  buildRouter() {
    return Router();
  },
  logger,
});
