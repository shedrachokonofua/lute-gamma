import { Router } from "express";
import { Context } from "../../context";
import { buildCrawlerController } from "./crawler-controller";

export const buildCrawlerRouter = (context: Context) => {
  const controller = buildCrawlerController(context);

  return Router()
    .get("/monitor", controller.getMonitor)
    .put("/status", controller.putStatus)
    .get("/status", controller.getStatus)
    .get("/head", controller.getHead)
    .post("/schedule", controller.schedule)
    .delete("/error", controller.clearError)
    .get("/error", controller.getError)
    .post("/empty", controller.empty);
};
