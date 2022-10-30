import { RedisClient } from "@lute/shared";
import { buildAuthInteractor } from "./auth/auth-interactor";
import { buildLibraryInteractor } from "./library/library-interactor";

export const buildSpotifyInteractor = (redisClient: RedisClient) => ({
  ...buildAuthInteractor(redisClient),
  ...buildLibraryInteractor(),
});

export type SpotifyInteractor = ReturnType<typeof buildSpotifyInteractor>;
