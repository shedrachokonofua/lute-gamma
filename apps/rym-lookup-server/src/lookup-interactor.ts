import { getSearchFileName } from "@lute/clients";
import { PutLookupPayload, LookupKey } from "@lute/domain";
import { LookupRepo } from "./lookup-repo";
import { crawlerClient } from "./utils";

export const buildLookupInteractor = (lookupRepo: LookupRepo) => ({
  async getLookupByHash(hash: string) {
    return lookupRepo.getLookupByHash(hash);
  },
  async putLookup(hash: string, payload: PutLookupPayload) {
    return lookupRepo.putLookup(hash, payload);
  },
  async getOrCreateLookup(key: LookupKey) {
    let lookup = await lookupRepo.getLookup(key);
    if (lookup) {
      return lookup;
    }
    const newLookup = await lookupRepo.createLookup(key);
    await crawlerClient.schedule({
      fileName: getSearchFileName(key.artist, key.album),
      lookupId: newLookup.keyHash,
    });
    return newLookup;
  },
  async deleteLookup(hash: string) {
    await lookupRepo.deleteLookup(hash);
  },
});

export type LookupInteractor = ReturnType<typeof buildLookupInteractor>;
