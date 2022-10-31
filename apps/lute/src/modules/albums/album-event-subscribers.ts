import { PageType, PutChartPayload } from "@lute/domain";
import { Context } from "../../context";
import { EventType, ParserPageParsedEventPayload } from "../../lib";
import { EventEntity } from "../../lib/events/event-entity";

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
};
