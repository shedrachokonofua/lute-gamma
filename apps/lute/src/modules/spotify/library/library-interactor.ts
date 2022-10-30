import { PaginatedValue, CatalogTrack, SpotifyCredentials } from "@lute/domain";
import { buildAuthorizedSpotifyApi, SpotifyTrack } from "../spotify";
import { logger } from "../../../logger";
import { spotifyTrackToCatalogTrack } from "../helpers";

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

export const buildLibraryInteractor = () => {
  return {
    async getTracks({
      spotifyCredentials,
      offset = 0,
      limit = 50,
    }: {
      spotifyCredentials: SpotifyCredentials;
      offset?: number;
      limit?: number;
    }): Promise<PaginatedValue<CatalogTrack>> {
      const spotifyApi = buildAuthorizedSpotifyApi(spotifyCredentials);
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
      spotifyCredentials,
      playlistId,
      offset = 0,
      limit = 50,
    }: {
      spotifyCredentials: SpotifyCredentials;
      playlistId: string;
      offset?: number;
      limit?: number;
    }): Promise<PaginatedValue<CatalogTrack>> {
      const spotifyApi = buildAuthorizedSpotifyApi(spotifyCredentials);
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
};
