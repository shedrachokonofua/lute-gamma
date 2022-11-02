import { ArtistPage, PageType, PutChartPayload } from "@lute/domain";
import { Context } from "../../context";
import {
  ChartSavedEventPayload,
  EventType,
  ParserPageParsedEventPayload,
} from "../../lib";
import { EventEntity } from "../../lib/events/event-entity";
import { Priority } from "../crawler";

export const registerAlbumEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe<ParserPageParsedEventPayload>(
    [EventType.ParserPageParsed],
    {
      name: "album.store",
      async consumeEvent(
        context,
        {
          data: { pageType, data, fileId, fileName },
          metadata,
        }: EventEntity<ParserPageParsedEventPayload>
      ) {
        if (pageType === PageType.Album) {
          await context.albumInteractor.putAlbum(
            {
              fileId,
              fileName,
              ...data,
            },
            metadata?.correlationId
          );
        } else if (pageType === PageType.Chart) {
          for (const { albumData: album, fileName } of (data as PutChartPayload)
            .albums) {
            await context.albumInteractor.createAlbumIfNotExists({
              ...album,
              fileName,
            });
          }
        }
      },
    }
  );

  await context.eventBus.subscribe<ParserPageParsedEventPayload>(
    [EventType.ParserPageParsed],
    {
      name: "albums.crawlArtistAlbums",
      async consumeEvent(context, { data: { pageType, data }, metadata }) {
        if (metadata?.crawlerIgnores || pageType !== PageType.Artist) return;
        const artistPage = data as ArtistPage;

        await Promise.all(
          artistPage.albums.map(async ({ fileName }) => {
            if (!(await context.albumInteractor.getAlbum(fileName))) {
              await context.crawlerInteractor.schedule({
                fileName,
                priority: Priority.Low,
              });
            }
          })
        );
      },
    }
  );

  await context.eventBus.subscribe<ChartSavedEventPayload>(
    [EventType.ChartSaved],
    {
      name: "albums.crawlChartAlbums",
      async consumeEvent(context, { data: { chart }, metadata }) {
        if (metadata?.crawlerIgnores) return;

        await Promise.all(
          chart.albums.map(async ({ fileName }) => {
            await context.crawlerInteractor.cachedSchedule({
              fileName,
              priority: Priority.Low,
            });
          })
        );
      },
    }
  );
};
