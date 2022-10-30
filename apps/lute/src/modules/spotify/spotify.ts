import { SpotifyCredentials } from "@lute/domain";
import SpotifyWebApi from "spotify-web-api-node";
import { config } from "../../config";

const AUTH_CALLBACK_URL = `${config.server.host}/spotify/auth/callback`;

export const SPOTIFY_SCOPES = ["user-library-read"];

export const spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
  redirectUri: AUTH_CALLBACK_URL,
});

export const buildAuthorizedSpotifyApi = (credentials: SpotifyCredentials) => {
  const api = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: AUTH_CALLBACK_URL,
  });
  api.setAccessToken(credentials.accessToken);
  api.setRefreshToken(credentials.refreshToken);
  return api;
};

export type SpotifyTrack = Awaited<
  ReturnType<SpotifyWebApi["getMySavedTracks"]>
>["body"]["items"][0]["track"];
