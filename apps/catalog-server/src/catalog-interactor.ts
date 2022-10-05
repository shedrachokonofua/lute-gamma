import { PaginatedValue, CatalogTrack, SpotifyCredentials } from "@lute/domain";
import { CatalogRepo } from "./catalog-repo";
import { buildAuthorizedSpotifyApi } from "./spotify";
import { logger } from "./logger";

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

export const buildCatalogInteractor = (catalogRepo: CatalogRepo) => {
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
        items: items.map((item) => ({
          spotifyId: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((artist) => ({
            spotifyId: artist.id,
            name: artist.name,
          })),
          album: {
            spotifyId: item.track.album.id,
            name: item.track.album.name,
            type: item.track.album.album_type,
          },
        })),
        nextOffset,
        total,
      };
    },
  };
};
