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
    async getTracks(req, res) {
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
  };
});
