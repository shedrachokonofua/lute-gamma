import "newrelic";
import {
  buildRedisClient,
  buildLuteEventSubscriber,
  LuteEvent,
  FileSavedEvent,
  buildLuteEventClient,
  extIsMhtml,
  PageDataParsedEvent,
} from "@lute/shared";
import { parseHtmlToPageData } from "./html-parser";
import { parseMhtmlToHtml } from "./mhtml-parser";
import { storeParsedPageData } from "./store-data";
import { logger } from "./logger";
import { REDIS_URL } from "./config";

const buildParserRedisClient = async () =>
  buildRedisClient({ logger, url: REDIS_URL });

(async () => {
  const eventClient = buildLuteEventClient(await buildParserRedisClient());

  buildLuteEventSubscriber<FileSavedEvent>({
    name: "mhtml-to-html",
    event: LuteEvent.FileSaved,
    predicate: (event) => extIsMhtml(event.fileName),
    handler: parseMhtmlToHtml,
    redisClient: await buildParserRedisClient(),
    logger,
  });

  buildLuteEventSubscriber<FileSavedEvent>({
    name: "html-parser",
    event: LuteEvent.FileSaved,
    predicate: (event) => !extIsMhtml(event.fileName),
    handler: (event) => parseHtmlToPageData(eventClient, event),
    redisClient: await buildParserRedisClient(),
    logger,
  });

  buildLuteEventSubscriber<PageDataParsedEvent>({
    name: "store-parsed-data",
    event: LuteEvent.PageDataParsed,
    handler: storeParsedPageData,
    redisClient: await buildParserRedisClient(),
    logger,
  });
})();
