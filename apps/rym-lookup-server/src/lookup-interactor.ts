import { getSearchFileName } from "@lute/clients";
import {
  PutLookupPayload,
  LookupKey,
  LookupStatus,
  isSavedLookup,
} from "@lute/domain";
import { LuteEvent, LuteEventClient } from "@lute/shared";
import { LookupRepo } from "./lookup-repo";
import { crawlerClient } from "./utils";

export const buildLookupInteractor = ({
  lookupRepo,
  eventClient,
}: {
  lookupRepo: LookupRepo;
  eventClient: LuteEventClient;
}) => ({
  async getLookupByHash(hash: string) {
    return lookupRepo.getLookupByHash(hash);
  },
  async putLookup(hash: string, payload: PutLookupPayload) {
    const lookup = await lookupRepo.putLookup(hash, payload);

    if (isSavedLookup(lookup)) {
      await eventClient.publish(LuteEvent.LookupSaved, {
        lookupId: hash,
      });
    } else if (lookup.status === LookupStatus.NotFound) {
      await eventClient.publish(LuteEvent.LookupNotFound, {
        lookupId: hash,
      });
    }

    return lookup;
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
