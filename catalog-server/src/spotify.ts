import SpotifyWebApi from "spotify-web-api-node";
import { HOST, PORT, SPOTIFT_CLIENT_ID, SPOTIFT_CLIENT_SECRET } from "./config";

export interface SpotifyCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const SPOTIFY_SCOPES = ["user-library-read"];

export const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFT_CLIENT_ID,
  clientSecret: SPOTIFT_CLIENT_SECRET,
  redirectUri: `${HOST}:${PORT}/auth/callback`,
});

export const buildAuthorizedSpotifyApi = (credentials: SpotifyCredentials) => {
  const api = new SpotifyWebApi({
    clientId: SPOTIFT_CLIENT_ID,
    clientSecret: SPOTIFT_CLIENT_SECRET,
    redirectUri: `${HOST}:${PORT}/auth/callback`,
  });
  api.setAccessToken(credentials.accessToken);
  api.setRefreshToken(credentials.refreshToken);
  return api;
};
