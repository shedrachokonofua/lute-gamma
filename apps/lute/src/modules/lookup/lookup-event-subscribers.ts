import {
  buildLuteEventSubscriber,
  LuteEvent,
  PageDataParsedEvent,
} from "../../lib";
import { Context } from "../../context";
import { logger } from "../../logger";

export const buildLookupEventSubscribers = async (context: Context) => {
  buildLuteEventSubscriber<PageDataParsedEvent>({
    name: "lookup-search-handler",
    event: LuteEvent.PageDataParsed,
    handler: (event) => context.lookupInteractor.handleSearchPageParsed(event),
    redisClient: await context.buildRedisClient(),
    logger,
  });
};
