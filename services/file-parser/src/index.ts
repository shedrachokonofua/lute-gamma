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

(async () => {
  const eventClient = buildLuteEventClient(await buildRedisClient({ logger }));

  buildLuteEventSubscriber<FileSavedEvent>({
    name: "mhtml-to-html",
    event: LuteEvent.FileSaved,
    predicate: (event) => extIsMhtml(event.fileName),
    handler: parseMhtmlToHtml,
    redisClient: await buildRedisClient({ logger }),
    logger,
  });

  buildLuteEventSubscriber<FileSavedEvent>({
    name: "html-parser",
    event: LuteEvent.FileSaved,
    predicate: (event) => !extIsMhtml(event.fileName),
    handler: (event) => parseHtmlToPageData(eventClient, event),
    redisClient: await buildRedisClient({ logger }),
    logger,
  });

  buildLuteEventSubscriber<PageDataParsedEvent>({
    name: "store-parsed-data",
    event: LuteEvent.PageDataParsed,
    handler: storeParsedPageData,
    redisClient: await buildRedisClient({ logger }),
    logger,
  });
})();
