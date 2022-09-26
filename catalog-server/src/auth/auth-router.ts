import { Router } from "express";
import { CatalogRepo } from "../catalog-repo";
import { buildAuthInteractor } from "./auth-interactor";
import { buildAuthController } from "./auth-controller";

export const buildAuthRouter = (catalogRepo: CatalogRepo) => {
  const controller = buildAuthController({
    catalogRepo,
  });

  return Router()
    .get("/status", controller.getStatus)
    .get("/authorize", controller.redirectToAuthorizationUrl)
    .get("/callback", controller.handleAuthorizationCallback)
    .post("/reset", controller.clearCredentials);
};
