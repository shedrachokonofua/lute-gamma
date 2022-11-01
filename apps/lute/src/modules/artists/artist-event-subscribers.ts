import { Context } from "../../context";
import { EventType, ProfileAlbumAddedEventPayload } from "../../lib";

export const registerArtistEventSubscribers = async (context: Context) => {
  await context.eventBus.subscribe<ProfileAlbumAddedEventPayload>(
    [EventType.ProfileAlbumAdded],
    {
      name: "artists.crawl",
      async consumeEvent(context, { data: { albumFileName } }) {
        const album = await context.albumInteractor.getAlbum(albumFileName);
        if (!album) return;
        const artists = album.artists || [];
        await Promise.all(
          artists.map((artist) =>
            context.crawlerInteractor.schedule(artist.fileName)
          )
        );
      },
    }
  );
};
