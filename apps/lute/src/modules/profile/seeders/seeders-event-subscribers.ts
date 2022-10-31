import {
  EventType,
  LookupNotFoundEventPayload,
  LookupSavedEventPayload,
} from "../../../lib";
import { logger } from "../logger";
import {
  buildSeedLookupInteractor,
  SeedLookupInteractor,
} from "./seed-lookup-interactor";
import { isSavedLookup } from "@lute/domain";
import { Context } from "../../../context";
import { EventEntity } from "../../../lib/events/event-entity";

const handleLookupSaved = async ({
  context,
  seedLookupInteractor,
  event,
}: {
  context: Context;
  seedLookupInteractor: SeedLookupInteractor;
  event: EventEntity<LookupSavedEventPayload>;
}) => {
  const {
    data: { lookupHash },
  } = event;
  const lookup = await context.lookupInteractor.getLookupByHash(lookupHash);
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
  event: {
    data: { lookupHash },
  },
}: {
  context: Context;
  seedLookupInteractor: SeedLookupInteractor;
  event: EventEntity<LookupNotFoundEventPayload>;
}) => {
  await seedLookupInteractor.handleLookupNotFound(lookupHash);
};

export const registerSeedersEventSubscribers = async (context: Context) => {
  const seedLookupInteractor = buildSeedLookupInteractor({
    redisClient: context.redisClient,
    profileInteractor: context.profileInteractor,
  });

  await context.eventBus.subscribe<LookupSavedEventPayload>(
    [EventType.LookupSaved],
    {
      name: "profile.seeders.handleLookupSaved",
      consumeEvent: (context, event) =>
        handleLookupSaved({ context, event, seedLookupInteractor }),
    }
  );

  await context.eventBus.subscribe<LookupNotFoundEventPayload>(
    [EventType.LookupNotFound],
    {
      name: "profile.seeders.handleLookupNotFound",
      consumeEvent: (context, event) =>
        handleLookupNotFound({ context, event, seedLookupInteractor }),
    }
  );
};
