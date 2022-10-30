import {
  buildLuteEventSubscriber,
  FileSavedEvent,
  LuteEvent,
  extIsMhtml,
  PageDataParsedEvent,
} from "../../lib";
import { Context } from "../../context";
import { logger } from "../../logger";
import { parseHtmlToPageData } from "./html-parser";
import { parseMhtmlToHtml } from "./mhtml-parser";
import { storeParsedPageData } from "./store-data";

export const buildFileParserEventSubscribers = async (context: Context) => {
  buildLuteEventSubscriber<FileSavedEvent>({
    name: "mhtml-to-html",
    event: LuteEvent.FileSaved,
    predicate: (event) => extIsMhtml(event.fileName),
    handler: (event) => parseMhtmlToHtml(context, event),
    redisClient: await context.buildRedisClient(),
    logger,
  });

  buildLuteEventSubscriber<FileSavedEvent>({
    name: "html-parser",
    event: LuteEvent.FileSaved,
    predicate: (event) => !extIsMhtml(event.fileName),
    handler: (event) => parseHtmlToPageData(context, event),
    redisClient: await context.buildRedisClient(),
    logger,
  });

  buildLuteEventSubscriber<PageDataParsedEvent>({
    name: "store-parsed-data",
    event: LuteEvent.PageDataParsed,
    handler: (event) => storeParsedPageData(context, event),
    redisClient: await context.buildRedisClient(),
    logger,
  });
};
