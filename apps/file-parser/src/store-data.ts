import { AlbumPage, PageType, LookupStatus, ChartPage } from "@lute/domain";
import { PageDataParsedEvent } from "@lute/shared";
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

  await rymDataClient.putAlbum(album);

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

  await Promise.all(
    chart.albums.map(async (album) => {
      await crawlerClient.schedule({
        fileName: album.fileName,
      });
    })
  );
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
    default:
      return;
  }
};
