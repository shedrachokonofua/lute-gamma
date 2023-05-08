import { AlbumSavedEventPayload, EventType } from "../../lib";
import { Context } from "../../context";
import { LookupStatus } from "@lute/domain";

export const registerLookupEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe([EventType.ParserPageParsed], {
    name: "lookup.handleSearchPageParsed",
    async consumeEvent(context, event) {
      await context.lookupInteractor.onSearchPageParsed(event);
    },
  });

  await context.eventBus.subscribe([EventType.ParserFailed], {
    name: "lookup.handleSearchPageFailed",
    async consumeEvent(context, event) {
      const lookupHash = event.metadata?.correlationId;
      if (!lookupHash) return;
      await context.lookupInteractor.putLookup(lookupHash, {
        status: LookupStatus.Error,
        error: event.data.error,
      });
    },
  });

  await context.eventBus.subscribe<AlbumSavedEventPayload>(
    [EventType.AlbumSaved],
    {
      name: "lookup.handleAlbumSaved",
      async consumeEvent(context, { data, metadata }) {
        const lookupHash = metadata?.correlationId;
        if (!lookupHash) return;
        await context.lookupInteractor.putLookup(lookupHash, {
          status: LookupStatus.Saved,
          bestMatch: {
            albumData: data.album,
          },
        });
      },
    }
  );
};
