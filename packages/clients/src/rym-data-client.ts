import { PutAlbumPayload, PutChartPayload, AlbumDocument } from "@lute/domain";
import { buildHttpClient } from "./shared";

export const buildRymDataClient = (rymDataServerUrl: string) => {
  const http = buildHttpClient(rymDataServerUrl);

  return {
    async patchAlbum(album: PutAlbumPayload): Promise<void> {
      await http.patch("/album", album);
    },
    async putChart(chart: PutChartPayload): Promise<void> {
      await http.put("/chart", chart);
    },
    async getAlbum(key: string): Promise<AlbumDocument | null> {
      try {
        const album = await http.get(`/album/${key}`);
        return album.data?.data;
      } catch (error) {
        return null;
      }
    },
    async queryAlbums(query: {
      keys?: string[];
      excludeKeys?: string[];
      artists?: string[];
      excludeArtists?: string[];
      primaryGenres?: string[];
      excludePrimaryGenres?: string[];
      secondaryGenres?: string[];
      descriptors?: string[];
      minRating?: number;
      maxRating?: number;
    }): Promise<AlbumDocument[]> {
      const albums = await http.post("/query", query);
      return albums.data?.data || [];
    },
  };
};
