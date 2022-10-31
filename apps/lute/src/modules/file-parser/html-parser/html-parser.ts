import { LookupStatus, PageType, isLuteAlbumFileName } from "@lute/domain";
import {
  EventType,
  ParserFailedEventPayload,
  ParserPageParsedEventPayload,
} from "../../../lib";
import { Context } from "../../../context";
import { logger } from "../../../logger";
import { parseAlbum } from "./page-parsers/album";
import { parseChart } from "./page-parsers/chart";
import { parseSearch } from "./page-parsers/search";
import { EventEntity } from "../../../lib/events/event-entity";

const getPageTypeFromFileName = (fileName: string): PageType | undefined => {
  if (isLuteAlbumFileName(fileName)) {
    return PageType.Album;
  }
  if (fileName.startsWith("charts/")) {
    return PageType.Chart;
  }
  if (fileName.startsWith("search")) {
    return PageType.Search;
  }
  return undefined;
};

const parsePage = (
  event: EventEntity<ParserPageParsedEventPayload>,
  html: string
) => {
  const pageType = getPageTypeFromFileName(event.data.fileName);

  switch (pageType) {
    case PageType.Album:
      return parseAlbum(event, html);
    case PageType.Chart:
      return parseChart(event, html);
    case PageType.Search:
      return parseSearch(event, html);
    default:
      return;
  }
};

export const parseHtmlToPageData = async (
  context: Context,
  event: EventEntity<ParserPageParsedEventPayload>
) => {
  const {
    data: { fileId, fileName },
    metadata: { correlationId } = {},
  } = event;
  try {
    const html = await context.fileInteractor.getFileContent(fileName);
    if (!html) {
      logger.error("Could not find file content", {
        fileId,
        fileName,
      });
      return;
    }
    const pageData = await parsePage(event, html);
    const pageType = getPageTypeFromFileName(fileName);

    if (!pageData || !pageType) {
      logger.error({ event }, "Unable to parse page");
      throw new Error("Unable to parse page");
    }

    await context.eventBus.publish<ParserPageParsedEventPayload>({
      type: EventType.ParserPageParsed,
      data: {
        fileId,
        fileName,
        pageType,
        data: pageData,
      },
      metadata: {
        correlationId,
      },
    });
  } catch (error) {
    logger.error({ event, error }, "Failed to parse page");
    await context.eventBus.publish<ParserFailedEventPayload>({
      type: EventType.ParserFailed,
      data: {
        fileId,
        fileName,
        error: (error as Error)?.message || "Unknown error",
      },
      metadata: {
        correlationId,
      },
    });
  }
};
