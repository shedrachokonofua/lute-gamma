import {
  buildLuteEventSubscriber,
  LookupNotFoundEvent,
  LookupSavedEvent,
  LuteEvent,
} from "@lute/shared";
import { logger } from "../logger";
import {
  buildSeedLookupInteractor,
  SeedLookupInteractor,
} from "./seed-lookup-interactor";
import { isSavedLookup } from "@lute/domain";
import { Context } from "../../../context";

const handleLookupSaved = async ({
  context,
  seedLookupInteractor,
  event,
}: {
  context: Context;
  seedLookupInteractor: SeedLookupInteractor;
  event: LookupSavedEvent;
}) => {
  const { lookupId } = event;
  const lookup = await context.lookupInteractor.getLookupByHash(lookupId);
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
  seedLookupInteractor,
  event,
}: {
  context: Context;
  seedLookupInteractor: SeedLookupInteractor;
  event: LookupNotFoundEvent;
}) => {
  const { lookupId } = event;
  await seedLookupInteractor.handleLookupNotFound(lookupId);
};

export const buildSeedersEventSubscribers = async (context: Context) => {
  const seedLookupInteractor = buildSeedLookupInteractor({
    redisClient: context.redisClient,
    profileInteractor: context.profileInteractor,
  });

  buildLuteEventSubscriber<LookupSavedEvent>({
    name: "seeders-lookup-saved-handler",
    event: LuteEvent.LookupSaved,
    handler: (event) =>
      handleLookupSaved({ context, event, seedLookupInteractor }),
    redisClient: await context.buildRedisClient(),
    logger,
  });

  buildLuteEventSubscriber<LookupNotFoundEvent>({
    name: "seeders-lookup-not-found-handler",
    event: LuteEvent.LookupNotFound,
    handler: (event) =>
      handleLookupNotFound({ context, event, seedLookupInteractor }),
    redisClient: await context.buildRedisClient(),
    logger,
  });
};
