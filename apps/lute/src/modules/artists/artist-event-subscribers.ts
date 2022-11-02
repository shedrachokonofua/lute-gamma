import { Context } from "../../context";
import { EventType, ProfileAlbumAddedEventPayload } from "../../lib";
import { Priority } from "../crawler";

export const registerArtistEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe<ProfileAlbumAddedEventPayload>(
    [EventType.ProfileAlbumAdded],
    {
      name: "artists.crawl",
      async consumeEvent(context, { data: { albumFileName } }) {
        const album = await context.albumInteractor.getAlbum(albumFileName);
        if (!album) return;

        await Promise.all(
          (album.artists || []).map(({ fileName }) =>
            context.crawlerInteractor.cachedSchedule({
              fileName,
              priority: Priority.Low,
            })
          )
        );
      },
    }
  );
};
