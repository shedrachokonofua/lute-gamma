import { LookupStatus, PageType, isLuteAlbumFileName } from "@lute/domain";
import { FileSavedEvent, LuteEvent } from "../../../lib";
import { Context } from "../../../context";
import { logger } from "../../../logger";
import { parseAlbum } from "./page-parsers/album";
import { parseChart } from "./page-parsers/chart";
import { parseSearch } from "./page-parsers/search";

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

const parsePage = (event: FileSavedEvent, html: string) => {
  const pageType = getPageTypeFromFileName(event.fileName);

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
  event: FileSavedEvent
) => {
  try {
    const html = await context.fileInteractor.getFileContent(event.fileName);
    if (!html) {
      logger.error("Could not find file content", {
        fileId: event.fileId,
        fileName: event.fileName,
      });
      return;
    }
    const pageData = await parsePage(event, html);
    const pageType = getPageTypeFromFileName(event.fileName);

    if (!pageData || !pageType) {
      logger.error({ event }, "Unable to parse page");
      if (event.lookupId) {
        await context.lookupInteractor.putLookup(event.lookupId, {
          status: LookupStatus.NotFound,
        });
      }
      return;
    }

    await context.eventClient.publish(LuteEvent.PageDataParsed, {
      fileId: event.fileId,
      fileName: event.fileName,
      pageType,
      dataString: JSON.stringify(pageData),
      lookupId: event.lookupId,
    });
  } catch (error) {
    logger.error({ event, error }, "Failed to parse page");
    if (event.lookupId) {
      await context.lookupInteractor.putLookup(event.lookupId, {
        status: LookupStatus.Error,
        error: (error as Error).message,
      });
    }
  }
};
