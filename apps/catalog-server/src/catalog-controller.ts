import { buildControllerFactory } from "@lute/shared";
import { Request } from "express";
import { buildCatalogInteractor } from "./catalog-interactor";
import { CatalogRepo } from "./catalog-repo";

const getSpotifyCredentialsFromRequest = (req: Request) => {
  if (!(req as any).spotifyCredentials) {
    throw new Error("Spotify credentials not found");
  }
  return (req as any).spotifyCredentials;
};

export const buildCatalogController = buildControllerFactory<{
  catalogRepo: CatalogRepo;
}>(({ catalogRepo }) => {
  const catalogInteractor = buildCatalogInteractor(catalogRepo);

  return {
    async getSavedTracks(req, res) {
      const { offset, limit } = req.query;
      const data = await catalogInteractor.getTracks({
        spotifyCredentials: getSpotifyCredentialsFromRequest(req),
        offset: offset ? Number(offset) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.json({
        ok: true,
        data,
      });
    },
    async getPlaylistTracks(req, res) {
      const { playlistId } = req.params;
      const { offset, limit } = req.query;

      if (!playlistId) {
        return res.json({
          ok: false,
          error: "Missing playlistId",
        });
      }

      const data = await catalogInteractor.getPlaylistTracks({
        spotifyCredentials: getSpotifyCredentialsFromRequest(req),
        playlistId: playlistId as string,
        offset: offset ? Number(offset) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.json({
        ok: true,
        data,
      });
    },
  };
});
