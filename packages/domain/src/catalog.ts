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
    type: "album" | "single" | "compilation";
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
