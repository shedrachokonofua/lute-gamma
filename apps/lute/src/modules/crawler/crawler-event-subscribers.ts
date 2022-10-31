import { Context } from "../../context";
import { ChartSavedEventPayload, EventType } from "../../lib";

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
};
