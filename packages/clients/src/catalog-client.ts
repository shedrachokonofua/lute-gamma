import { buildHttpClient } from "./shared";
import { PaginatedValue, CatalogTrack } from "@lute/domain";

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
    async getPlaylistTracks({
      playlistId,
      limit = 50,
      offset = 0,
    }: {
      playlistId: string;
      limit?: number;
      offset?: number;
    }): Promise<PaginatedValue<CatalogTrack>> {
      const tracks = await http.get(
        `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
      );
      return tracks.data?.data || [];
    },
  };
};
