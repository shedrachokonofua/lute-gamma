import { AuthStatus, SpotifyCredentials } from "@lute/domain";
import { RedisClient } from "@lute/shared";
import { add as dateAdd } from "date-fns";
import { logger } from "../../../logger";
import {
  buildAuthorizedSpotifyApi,
  spotifyApi,
  SPOTIFY_SCOPES,
} from "../spotify";
import { buildAuthRepo } from "./auth-repo";

export const buildAuthInteractor = (redisClient: RedisClient) => {
  const authRepo = buildAuthRepo(redisClient);

  return {
    async getAuthUrl() {
      return spotifyApi.createAuthorizeURL(SPOTIFY_SCOPES, "");
    },
    async grantAndStoreCredentials(code: string): Promise<SpotifyCredentials> {
      const data = await spotifyApi.authorizationCodeGrant(code);
      logger.info({ data }, "Got auth code grant response");
      const { access_token, refresh_token, expires_in } = data.body;
      const credentials = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: dateAdd(new Date(), { seconds: expires_in }).getTime(),
      };
      logger.info({ credentials }, "Storing spotify credentials");
      await authRepo.setSpotifyCredentials(credentials);
      return credentials;
    },
    async getAuthStatus(): Promise<AuthStatus> {
      const credentials = await authRepo.getSpotifyCredentials();
      if (!credentials) {
        return AuthStatus.Unauthorized;
      }
      const { accessToken, refreshToken, expiresAt } = credentials;
      if (!accessToken || !refreshToken || !expiresAt) {
        return AuthStatus.InvalidAuthorization;
      }
      if (expiresAt < Date.now()) {
        return AuthStatus.Expired;
      }
      return AuthStatus.Authorized;
    },
    async refreshCredentials(): Promise<SpotifyCredentials> {
      const credentials = await authRepo.getSpotifyCredentials();
      if (!credentials) {
        throw new Error("No credentials to refresh");
      }
      const { refreshToken } = credentials;
      if (!refreshToken) {
        throw new Error("No refresh token to refresh");
      }
      const authorizedApi = buildAuthorizedSpotifyApi(credentials);
      const data = await authorizedApi.refreshAccessToken();
      logger.info({ data }, "Got refresh token response");
      const { access_token, expires_in } = data.body;
      const newCredentials = {
        ...credentials,
        accessToken: access_token,
        expiresAt: dateAdd(new Date(), { seconds: expires_in }).getTime(),
      };
      logger.info({ newCredentials }, "Storing new spotify credentials");
      await authRepo.setSpotifyCredentials(newCredentials);
      return newCredentials;
    },
    async clearSpotifyCredentials() {
      await authRepo.clearSpotifyCredentials();
    },
    async getSpotifyCredentials(): Promise<SpotifyCredentials | null> {
      return authRepo.getSpotifyCredentials();
    },
  };
};

export type AuthInteractor = ReturnType<typeof buildAuthInteractor>;
