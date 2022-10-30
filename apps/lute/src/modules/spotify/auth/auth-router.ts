import { Router } from "express";
import { Context } from "../../../context";
import { buildAuthController } from "./auth-controller";

export const buildAuthRouter = (context: Context) => {
  const controller = buildAuthController(context);

  return Router()
    .get("/status", controller.getStatus)
    .get("/authorize", controller.redirectToAuthorizationUrl)
    .get("/callback", controller.handleAuthorizationCallback)
    .post("/reset", controller.clearCredentials);
};
