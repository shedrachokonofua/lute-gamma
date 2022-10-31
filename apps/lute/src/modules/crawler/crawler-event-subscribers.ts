import { Context } from "../../context";
import { ChartSavedEventPayload, EventType } from "../../lib";

export const registerCrawlerEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe<ChartSavedEventPayload>(
    [EventType.ChartSaved],
    {
      name: "crawler.crawlChartAlbums",
      async consumeEvent(context, { data: { chart } }) {
        await Promise.all(
          chart.albums.map(async (album) => {
            await context.crawlerInteractor.schedule(album.fileName);
          })
        );
      },
    }
  );
};
