import {
  AlbumPage,
  ChartPage,
  LookupStatus,
  PageDataParsedEvent,
  PageType,
  SearchBestMatch,
} from "@lute/shared";
import { logger } from "./logger";
import { crawlerClient, rymDataClient, rymLookupClient } from "./utils";

const storeAlbumData = async (
  event: PageDataParsedEvent,
  data: AlbumPage
): Promise<void> => {
  if (event.pageType !== PageType.Album) {
    return;
  }

  const album = {
    fileId: event.fileId,
    fileName: event.fileName,
    ...data,
  };

  await rymDataClient.patchAlbum(album);

  if (event.lookupId) {
    logger.info({ event, album }, "Lookup album data saved");
    await rymLookupClient.putLookup(event.lookupId, {
      status: LookupStatus.Saved,
      bestMatch: {
        albumData: album,
      },
    });
  }
};

const storeChartData = async (
  event: PageDataParsedEvent,
  data: ChartPage
): Promise<void> => {
  if (event.pageType !== PageType.Chart) {
    return;
  }

  const chart = {
    fileId: event.fileId,
    fileName: event.fileName,
    ...data,
  };

  await rymDataClient.putChart(chart);
};

const storeSearchResult = async (
  event: PageDataParsedEvent,
  data: SearchBestMatch
): Promise<void> => {
  if (event.pageType !== PageType.Search || !event.lookupId) {
    return;
  }

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
  await rymLookupClient.putLookup(event.lookupId, putLookupPayload);

  if (!albumData) {
    logger.info({ event }, "Scheduling file for crawling");
    await crawlerClient.schedule({
      fileName: data.fileName,
      lookupId: event.lookupId,
    });
  }
};

export const storeParsedPageData = async (event: PageDataParsedEvent) => {
  logger.info({ event }, "Storing page data");
  const pageData = JSON.parse(event.dataString);
  const pageType = event.pageType;

  switch (pageType) {
    case PageType.Album:
      return storeAlbumData(event, pageData as AlbumPage);
    case PageType.Chart:
      return storeChartData(event, pageData as ChartPage);
    case PageType.Search:
      return storeSearchResult(event, pageData as SearchBestMatch);
    default:
      return;
  }
};
