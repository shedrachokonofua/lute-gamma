import { AuthStatus, SpotifyCredentials } from "@lute/domain";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../../logger";
import { Context } from "../../../context";
import { SpotifyInteractor } from "../spotify-interactor";

const setCredentialsOnRequest = (
  req: Request,
  credentials: SpotifyCredentials
) => {
  (req as any).spotifyCredentials = credentials;
};

const shouldRefresh = async (
  spotifyInteractor: SpotifyInteractor,
  status: AuthStatus
) => {
  if (
    status === AuthStatus.Unauthorized ||
    status === AuthStatus.InvalidAuthorization
  ) {
    return false;
  }
  if (status === AuthStatus.Authorized) {
    const credentials = await spotifyInteractor.getSpotifyCredentials();
    if (!credentials) {
      return false;
    }
    const fiveMinutesMs = 5 * 60 * 1000;
    const expiringSoon = credentials.expiresAt - Date.now() < fiveMinutesMs;
    return expiringSoon;
  }
  return status === AuthStatus.Expired;
};

export const buildAuthGuard = (context: Context) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const status = await context.spotifyInteractor.getAuthStatus();

    if (await shouldRefresh(context.spotifyInteractor, status)) {
      logger.info({ status }, "Refreshing credentials");
      const credentials = await context.spotifyInteractor.refreshCredentials();
      setCredentialsOnRequest(req, credentials);
      return next();
    }

    if (status === "authorized") {
      const credentials =
        await context.spotifyInteractor.getSpotifyCredentials();
      if (!credentials) {
        throw new Error("No credentials found");
      }
      setCredentialsOnRequest(req, credentials);
      return next();
    }

    return res.status(401).send({
      ok: false,
      error: "Unauthorized",
      credentials: await context.spotifyInteractor.getSpotifyCredentials(),
    });
  };
};
