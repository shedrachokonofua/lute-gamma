import { PaginatedValue, CatalogTrack, SpotifyCredentials } from "@lute/domain";
import { buildAuthorizedSpotifyApi, SpotifyTrack } from "../spotify";
import { logger } from "../../../logger";
import { spotifyTrackToCatalogTrack } from "../helpers";
import { AuthInteractor } from "../auth";

const getNextOffset = (
  offset: number | undefined,
  limit: number | undefined,
  total: number
) => {
  if (offset === undefined || limit === undefined) {
    return undefined;
  }
  const nextOffset = offset + limit;
  return nextOffset < total ? nextOffset : undefined;
};

export const buildLibraryInteractor = (authInteractor: AuthInteractor) => {
  const interactor = {
    async getCredentialsOrThrow() {
      const credentials = await authInteractor.getSpotifyCredentials();
      if (!credentials) throw new Error("No credentials found");
      return credentials;
    },
    async getTracks({
      offset = 0,
      limit = 50,
    }: {
      offset?: number;
      limit?: number;
    }): Promise<PaginatedValue<CatalogTrack>> {
      const spotifyApi = await authInteractor.getAuthorizedSpotifyApiOrThrow();
      const {
        body: { items, total },
      } = await spotifyApi.getMySavedTracks({
        offset,
        limit,
      });
      logger.info({ items, total }, "Got tracks from spotify");
      const nextOffset = getNextOffset(offset, limit, total);

      return {
        items: items.map((item) => spotifyTrackToCatalogTrack(item.track)),
        nextOffset,
        total,
      };
    },
    async getPlaylistTracks({
      playlistId,
      offset = 0,
      limit = 50,
    }: {
      playlistId: string;
      offset?: number;
      limit?: number;
    }): Promise<PaginatedValue<CatalogTrack>> {
      const spotifyApi = await authInteractor.getAuthorizedSpotifyApiOrThrow();
      const {
        body: { items, total },
      } = await spotifyApi.getPlaylistTracks(playlistId, {
        offset,
        limit,
      });
      logger.info({ items, total }, "Got tracks from spotify");
      const nextOffset = getNextOffset(offset, limit, total);

      const spotifyTracks = items.reduce<SpotifyTrack[]>((acc, item) => {
        if (item.track) {
          acc.push(item.track);
        }
        return acc;
      }, []);

      return {
        items: spotifyTracks.map(spotifyTrackToCatalogTrack),
        nextOffset,
        total,
      };
    },
  };

  return interactor;
};

export type LibraryInteractor = ReturnType<typeof buildLibraryInteractor>;
