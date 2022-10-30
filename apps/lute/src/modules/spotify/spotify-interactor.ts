import { RedisClient } from "@lute/shared";
import { buildAuthInteractor } from "./auth/auth-interactor";
import { buildLibraryInteractor } from "./library/library-interactor";

export const buildSpotifyInteractor = (redisClient: RedisClient) => {
  const authInteractor = buildAuthInteractor(redisClient);

  return {
    ...authInteractor,
    ...buildLibraryInteractor(authInteractor),
  };
};

export type SpotifyInteractor = ReturnType<typeof buildSpotifyInteractor>;
