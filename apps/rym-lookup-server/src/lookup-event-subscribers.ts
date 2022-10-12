import {
  buildLuteEventClient,
  buildLuteEventSubscriber,
  buildRedisClient,
  LuteEvent,
  PageDataParsedEvent,
} from "@lute/shared";
import { logger } from "./logger";
import { REDIS_URL } from "./config";
import { LookupStatus, PageType, SearchBestMatch } from "@lute/domain";
import { crawlerClient, rymDataClient } from "./utils";
import { buildLookupInteractor, LookupInteractor } from "./lookup-interactor";
import { buildLookupRepo } from "./lookup-repo";

const handleSearchResult = async (
  lookupInteractor: LookupInteractor,
  event: PageDataParsedEvent
) => {
  if (event.pageType !== PageType.Search || !event.lookupId) {
    return;
  }
  logger.info({ event }, "Lookup search found");
  const data = JSON.parse(event.dataString) as SearchBestMatch;
  const albumData = await rymDataClient.getAlbum(data.fileName);
  const putLookupPayload = albumData
    ? {
        status: LookupStatus.Saved,
        bestMatch: {
          albumData,
          ...data,
        },
      }
    : {
        status: LookupStatus.Found,
        bestMatch: data,
      };

  logger.info({ event, putLookupPayload }, "Put lookup");

  await lookupInteractor.putLookup(event.lookupId, putLookupPayload);

  if (!albumData) {
    logger.info({ event, albumData }, "Scheduling album for crawling");
    await crawlerClient.schedule({
      fileName: data.fileName,
      lookupId: event.lookupId,
    });
  }
};

export const buildLookupEventSubscribers = async () => {
  const redisClient = await buildRedisClient({ logger, url: REDIS_URL });
  const lookupInteractor = buildLookupInteractor({
    lookupRepo: buildLookupRepo(redisClient),
    eventClient: buildLuteEventClient(redisClient),
  });

  buildLuteEventSubscriber<PageDataParsedEvent>({
    name: "lookup-search-handler",
    event: LuteEvent.PageDataParsed,
    handler: (event) => handleSearchResult(lookupInteractor, event),
    redisClient: await buildRedisClient({ logger, url: REDIS_URL }),
    logger,
  });
};
