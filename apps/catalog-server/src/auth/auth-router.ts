import { Router } from "express";
import { buildAuthController } from "./auth-controller";
import { AuthRepo } from "./auth-repo";

export const buildAuthRouter = (authRepo: AuthRepo) => {
  const controller = buildAuthController({
    authRepo,
  });

  return Router()
    .get("/status", controller.getStatus)
    .get("/authorize", controller.redirectToAuthorizationUrl)
    .get("/callback", controller.handleAuthorizationCallback)
    .post("/reset", controller.clearCredentials);
};
