import { buildHttpClient } from "./shared";
import { AlbumPage, ChartPage, ChartParameters } from "../rym";

export type AlbumDocument = Partial<AlbumPage> & {
  fileId: string;
  fileName: string;
};

export type PutAlbumPayload = Partial<AlbumDocument>;

export interface ChartDocumentAlbumEntry {
  position: number;
  fileName: string;
}

export interface ChartDocument {
  fileId: string;
  fileName: string;
  parameters: ChartParameters;
  albums: ChartDocumentAlbumEntry[];
}

export type PutChartPayload = ChartPage & {
  fileName: string;
  fileId: string;
};

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
    async getAlbums(keys: string[]): Promise<AlbumDocument[]> {
      const albums = await http.post("/albums", keys);
      return albums.data?.data || [];
    },
  };
};
