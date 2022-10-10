import {
  buildLuteEventSubscriber,
  buildRedisClient,
  LookupNotFoundEvent,
  LookupSavedEvent,
  LuteEvent,
} from "@lute/shared";
import { logger } from "../logger";
import { REDIS_URL } from "../config";
import { SeedLookupInteractor } from "./seed-lookup-interactor";
import { rymLookupClient } from "../utils";
import { isSavedLookup } from "@lute/domain";

const handleLookupSaved = async ({
  event,
  seedLookupInteractor,
}: {
  event: LookupSavedEvent;
  seedLookupInteractor: SeedLookupInteractor;
}) => {
  const { lookupId } = event;
  const lookup = await rymLookupClient.getLookupByHash(lookupId);
  if (!lookup) {
    logger.warn({ event }, "Lookup not found");
    return;
  }
  if (!isSavedLookup(lookup)) {
    logger.info({ event }, "Lookup not saved");
    return;
  }
  if (!(await seedLookupInteractor.hasWaitingSeeds(lookup.keyHash))) {
    return;
  }

  await seedLookupInteractor.handleSavedLookup(lookup);
};

const handleLookupNotFound = async ({
  event,
  seedLookupInteractor,
}: {
  event: LookupNotFoundEvent;
  seedLookupInteractor: SeedLookupInteractor;
}) => {
  const { lookupId } = event;
  await seedLookupInteractor.handleLookupNotFound(lookupId);
};

export const buildSeedersEventSubscribers = async (
  seedLookupInteractor: SeedLookupInteractor
) => {
  buildLuteEventSubscriber<LookupSavedEvent>({
    name: "seeders-lookup-saved-handler",
    event: LuteEvent.LookupSaved,
    handler: (event) => handleLookupSaved({ event, seedLookupInteractor }),
    redisClient: await buildRedisClient({ logger, url: REDIS_URL }),
    logger,
  });

  buildLuteEventSubscriber<LookupNotFoundEvent>({
    name: "seeders-lookup-not-found-handler",
    event: LuteEvent.LookupNotFound,
    handler: (event) => handleLookupNotFound({ event, seedLookupInteractor }),
    redisClient: await buildRedisClient({ logger, url: REDIS_URL }),
    logger,
  });
};
