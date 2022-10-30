import { AlbumPage, PageType, LookupStatus, ChartPage } from "@lute/domain";
import { PageDataParsedEvent } from "@lute/shared";
import { Context } from "../../context";
import { logger } from "../../logger";

const storeAlbumData = async (
  context: Context,
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

  await context.albumInteractor.putAlbum(album);

  if (event.lookupId) {
    logger.info({ event, album }, "Lookup album data saved");
    await context.lookupInteractor.putLookup(event.lookupId, {
      status: LookupStatus.Saved,
      bestMatch: {
        albumData: album,
      },
    });
  }
};

const storeChartData = async (
  context: Context,
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

  await context.chartInteractor.putChart(chart);

  await Promise.all(
    chart.albums.map(async (album) => {
      await context.crawlerInteractor.schedule(album.fileName);
    })
  );
};

export const storeParsedPageData = async (
  context: Context,
  event: PageDataParsedEvent
) => {
  logger.info({ event }, "Storing page data");
  const pageData = JSON.parse(event.dataString);
  const pageType = event.pageType;

  switch (pageType) {
    case PageType.Album:
      return storeAlbumData(context, event, pageData as AlbumPage);
    case PageType.Chart:
      return storeChartData(context, event, pageData as ChartPage);
    default:
      return;
  }
};
