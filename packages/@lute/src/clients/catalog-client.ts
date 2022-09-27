import { buildHttpClient } from "./shared";

export interface CatalogTrack {
  spotifyId: string;
  name: string;
  artists: {
    spotifyId: string;
    name: string;
  }[];
  album?: {
    spotifyId: string;
    name: string;
  };
}

export interface PaginatedValue<T> {
  items: T[];
  nextOffset?: number;
  total: number;
}

export enum AuthStatus {
  Authorized = "authorized",
  Unauthorized = "unauthorized",
  InvalidAuthorization = "invalid-authorization",
  Expired = "expired",
}

export interface SpotifyCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface GetAuthStatusResponse {
  status: AuthStatus;
  credentials: SpotifyCredentials;
}

export const buildCatalogClient = (catalogServerUrl: string) => {
  const http = buildHttpClient(catalogServerUrl);

  return {
    async getTracks({
      limit = 50,
      offset = 0,
    }: { limit?: number; offset?: number } = {}): Promise<
      PaginatedValue<CatalogTrack>
    > {
      const tracks = await http.get(`/tracks?limit=${limit}&offset=${offset}`);
      return tracks.data?.data || [];
    },
  };
};
