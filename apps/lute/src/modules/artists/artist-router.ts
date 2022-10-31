import { Router } from "express";
import { Context } from "../../context";
import { buildArtistController } from "./artist-controller";

export const buildArtistRouter = (context: Context) => {
  const controller = buildArtistController(context);

  return Router().get("/*", controller.getArtist);
};
