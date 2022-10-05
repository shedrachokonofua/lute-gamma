import { AuthStatus, SpotifyCredentials } from "@lute/domain";
import { add as dateAdd } from "date-fns";
import { CatalogRepo } from "../catalog-repo";
import { logger } from "../logger";
import {
  buildAuthorizedSpotifyApi,
  spotifyApi,
  SPOTIFY_SCOPES,
} from "../spotify";

export const buildAuthInteractor = (catalogRepo: CatalogRepo) => {
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
      await catalogRepo.setSpotifyCredentials(credentials);
      return credentials;
    },
    async getAuthStatus(): Promise<AuthStatus> {
      const credentials = await catalogRepo.getSpotifyCredentials();
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
      const credentials = await catalogRepo.getSpotifyCredentials();
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
      await catalogRepo.setSpotifyCredentials(newCredentials);
      return newCredentials;
    },
  };
};

export type AuthInteractor = ReturnType<typeof buildAuthInteractor>;
