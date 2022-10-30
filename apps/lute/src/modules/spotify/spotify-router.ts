import { Router } from "express";
import { buildAuthGuard, buildAuthRouter } from "./auth";
import { buildLibraryRouter } from "./library";
import { Context } from "../../context";

export const buildSpotifyRouter = (context: Context) => {
  const authGuard = buildAuthGuard(context);

  return Router()
    .use("/auth", buildAuthRouter(context))
    .use("/library", authGuard, buildLibraryRouter(context));
};
