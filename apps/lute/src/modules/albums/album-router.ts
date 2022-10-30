import { Router } from "express";
import { Context } from "../../context";
import { buildAlbumController } from "./album-controller";

export const buildAlbumRouter = (context: Context) => {
  const albumController = buildAlbumController(context);

  return Router()
    .put("/", albumController.putAlbum)
    .get("/*", albumController.getAlbum)
    .post("/query", albumController.query);
};
