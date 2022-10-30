import { Router } from "express";
import { Context } from "../../../context";
import { buildLibraryController } from "./library-controller";

export const buildLibraryRouter = (context: Context) => {
  const libraryController = buildLibraryController(context);

  return Router()
    .get("/tracks", libraryController.getSavedTracks)
    .get("/playlists/:playlistId/tracks", libraryController.getPlaylistTracks);
};
