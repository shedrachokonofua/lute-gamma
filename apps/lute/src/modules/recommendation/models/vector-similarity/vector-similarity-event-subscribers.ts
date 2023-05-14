import { Context } from "../../../../context";
import { AlbumSavedEventPayload, EventType } from "../../../../lib";

export const registerVectorSimilarityEventSubscribers = async (
  context: Context
) => {
  await context.eventBus.subscribe<AlbumSavedEventPayload>(
    [EventType.AlbumSaved],
    {
      name: "recommendation.vectorSimilarity.saveVector",
      consumeEvent: async (context, { data: { album } }) => {
        await context.vectorSimilarityInteractor.saveAlbumVector(album);
      },
      batchSize: 5,
    }
  );
};
