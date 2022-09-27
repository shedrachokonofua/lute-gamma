import { AlbumDocument } from "./rym-data-client";
import { buildHttpClient } from "./shared";

export enum LookupStatus {
  Started = "started",
  Found = "found",
  NotFound = "not-found",
  Saved = "saved",
  Error = "error",
}

export interface LookupKey {
  artist: string;
  album: string;
}

export interface LookupBestMatch {
  name: string;
  fileName: string;
  artists: string[];
  albumData?: AlbumDocument;
}

export type Lookup = {
  key: LookupKey;
  keyHash: string;
  status: LookupStatus;
  bestMatch?: LookupBestMatch;
  error?: string;
};

export type PutLookupPayload = {
  status: LookupStatus;
  error?: string;
  bestMatch?: Partial<LookupBestMatch>;
};

export const buildRymLookupClient = (rymLookupServerUrl: string) => {
  const http = buildHttpClient(rymLookupServerUrl);

  return {
    async getLookupByHash(hash: string): Promise<Lookup | undefined> {
      const lookup = await http.get(`/${hash}`);
      return lookup.data?.data;
    },
    async putLookup(
      hash: string,
      payload: PutLookupPayload
    ): Promise<Lookup | undefined> {
      const lookup = await http.put(`/${hash}`, payload);
      return lookup.data?.data;
    },
    async getOrCreateLookup(
      artist: string,
      album: string
    ): Promise<Lookup | undefined> {
      const lookup = await http.get(`/`, {
        params: {
          artist,
          album,
        },
      });
      return lookup.data?.data;
    },
  };
};
