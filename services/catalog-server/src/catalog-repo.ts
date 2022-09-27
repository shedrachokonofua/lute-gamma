import { RedisClient, SpotifyCredentials } from "@lute/shared";

export const buildCatalogRepo = (redisClient: RedisClient) => ({
  async getSpotifyCredentials(): Promise<SpotifyCredentials | null> {
    const credentials = (await redisClient.hGetAll(
      "catalog:spotify-credentials"
    )) as any;
    return credentials && Object.keys(credentials).length > 0
      ? credentials
      : null;
  },
  async setSpotifyCredentials(credentials: SpotifyCredentials): Promise<void> {
    await redisClient.hSet(
      "catalog:spotify-credentials",
      "accessToken",
      credentials.accessToken
    );
    await redisClient.hSet(
      "catalog:spotify-credentials",
      "refreshToken",
      credentials.refreshToken
    );
    await redisClient.hSet(
      "catalog:spotify-credentials",
      "expiresAt",
      credentials.expiresAt
    );
  },
  async clearSpotifyCredentials(): Promise<void> {
    await redisClient.del("catalog:spotify-credentials");
  },
});

export type CatalogRepo = ReturnType<typeof buildCatalogRepo>;
