import { Router } from "express";
import { buildLibraryController } from "./library-controller";

export const buildLibraryRouter = () => {
  const libraryController = buildLibraryController({});

  return Router()
    .get("/tracks", libraryController.getSavedTracks)
    .get("/playlists/:playlistId/tracks", libraryController.getPlaylistTracks);
};
