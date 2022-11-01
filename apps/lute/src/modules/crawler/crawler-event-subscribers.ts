import { ArtistPage, PageType } from "@lute/domain";
import { Context } from "../../context";
import {
  ChartSavedEventPayload,
  EventType,
  ParserPageParsedEventPayload,
} from "../../lib";

export const registerCrawlerEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe<ChartSavedEventPayload>(
    [EventType.ChartSaved],
    {
      name: "crawler.crawlChartAlbums",
      async consumeEvent(context, { data: { chart }, metadata }) {
        if (metadata?.crawlerIgnores) return;

        await Promise.all(
          chart.albums.map(async (album) => {
            if (
              !(await context.fileInteractor.getDoesFileExist(album.fileName))
            ) {
              await context.crawlerInteractor.schedule(album.fileName);
            }
          })
        );
      },
    }
  );

  await context.eventBus.subscribe<ParserPageParsedEventPayload>(
    [EventType.ParserPageParsed],
    {
      name: "crawler.crawlArtistAlbums",
      async consumeEvent(context, { data: { pageType, data }, metadata }) {
        if (metadata?.crawlerIgnores || pageType !== PageType.Artist) return;
        const artistPage = data as ArtistPage;

        await Promise.all(
          artistPage.albums.map(async (album) => {
            if (
              !(await context.fileInteractor.getDoesFileExist(album.fileName))
            ) {
              await context.crawlerInteractor.schedule(album.fileName);
            }
          })
        );
      },
    }
  );
};
