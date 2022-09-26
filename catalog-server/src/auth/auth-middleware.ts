import { Request, Response, NextFunction } from "express";
import { CatalogRepo } from "../catalog-repo";
import { AuthStatus, buildAuthInteractor } from "./auth-interactor";
import { SpotifyCredentials } from "../spotify";
import { logger } from "../logger";

const setCredentialsOnRequest = (
  req: Request,
  credentials: SpotifyCredentials
) => {
  (req as any).spotifyCredentials = credentials;
};

const shouldRefresh = async (catalogRepo: CatalogRepo, status: AuthStatus) => {
  if (
    status === AuthStatus.Unauthorized ||
    status === AuthStatus.InvalidAuthorization
  ) {
    return false;
  }
  if (status === AuthStatus.Authorized) {
    const credentials = await catalogRepo.getSpotifyCredentials();
    if (!credentials) {
      return false;
    }
    const fiveMinutesMs = 5 * 60 * 1000;
    const expiringSoon = credentials.expiresAt - Date.now() < fiveMinutesMs;
    return expiringSoon;
  }
  return status === AuthStatus.Expired;
};

export const buildAuthGuard = (catalogRepo: CatalogRepo) => {
  const authInteractor = buildAuthInteractor(catalogRepo);

  return async (req: Request, res: Response, next: NextFunction) => {
    const status = await authInteractor.getAuthStatus();

    if (await shouldRefresh(catalogRepo, status)) {
      logger.info({ status }, "Refreshing credentials");
      const credentials = await authInteractor.refreshCredentials();
      setCredentialsOnRequest(req, credentials);
      return next();
    }

    if (status === "authorized") {
      const credentials = await catalogRepo.getSpotifyCredentials();
      if (!credentials) {
        throw new Error("No credentials found");
      }
      setCredentialsOnRequest(req, credentials);
      return next();
    }

    return res.status(401).send({
      ok: false,
      error: "Unauthorized",
      credentials: await catalogRepo.getSpotifyCredentials(),
    });
  };
};
