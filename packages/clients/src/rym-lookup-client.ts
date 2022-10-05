import { Lookup, PutLookupPayload } from "@lute/domain";
import { buildHttpClient } from "./shared";

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
