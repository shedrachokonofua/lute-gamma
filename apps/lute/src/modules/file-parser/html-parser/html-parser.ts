import { PageType } from "@lute/domain";
import {
  EventType,
  ParserFailedEventPayload,
  FileSavedEventPayload,
  ParserPageParsedEventPayload,
  executeWithTimer,
  getPageTypeFromFileName,
  EventEntity,
} from "../../../lib";
import { Context } from "../../../context";
import { logger } from "../../../logger";
import {
  parseArtist,
  parseAlbum,
  parseChart,
  parseSearch,
} from "./page-parsers";

const parsePage = (event: EventEntity<FileSavedEventPayload>, html: string) => {
  const pageType = getPageTypeFromFileName(event.data.fileName);

  switch (pageType) {
    case PageType.Artist:
      return parseArtist(event, html);
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
  event: EventEntity<FileSavedEventPayload>
) => {
  const {
    data: { fileId, fileName },
    metadata: { correlationId } = {},
  } = event;
  try {
    const [html, fileDownloadTimeElapsed] = await executeWithTimer(async () =>
      context.fileInteractor.getFileContent(fileName)
    );
    if (!html) {
      logger.error("Could not find file content", {
        fileId,
        fileName,
      });

      return;
    }
    logger.info(
      { fileName, timeElapsed: fileDownloadTimeElapsed },
      "File downloaded"
    );
    const pageType = getPageTypeFromFileName(fileName);

    if (!pageType) {
      logger.error({ fileName }, "Could not determine page type");
      throw new Error("Could not determine page type");
    }

    const [pageData, timeElapsed] = await executeWithTimer(async () =>
      parsePage(event, html)
    );

    if (!pageData) {
      logger.error({ event }, "Unable to parse page");
      throw new Error("Unable to parse page");
    }
    logger.info({ fileName, timeElapsed, pageType }, "Parsed file");

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
