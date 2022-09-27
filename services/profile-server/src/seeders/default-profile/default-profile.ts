import { LookupStatus, RedisClient } from "@lute/shared";
import { logger } from "../../logger";
import { catalogClient, rymLookupClient } from "../../utils";
import { ProfileInteractor } from "../../profile-interactor";

export const seedDefaultProfile = async ({
  profileInteractor,
}: {
  profileInteractor: ProfileInteractor;
}) => {
  const state = {
    hasNext: true,
    offset: 0,
    seenAlbumSpotifyIds: new Set<string>(),
  };
  while (state.hasNext) {
    const result = await catalogClient.getTracks({
      limit: 50,
      offset: state.offset,
    });

    const relevantTracks = result.items.filter((track, index, items) => {
      if (
        !track.album?.spotifyId ||
        state.seenAlbumSpotifyIds.has(track.album.spotifyId)
      )
        return false;

      return (
        index ===
        items.findIndex((t) => t.album?.spotifyId === track.album?.spotifyId)
      );
    });

    await Promise.all(
      relevantTracks.map(async (track) => {
        if (!track.artists[0].name || !track.album?.name) return;

        const lookupResult = await rymLookupClient.getOrCreateLookup(
          track.artists[0].name,
          track.album.name
        );

        if (!lookupResult) return;

        if (
          lookupResult.status !== LookupStatus.Saved ||
          !lookupResult.bestMatch?.fileName
        ) {
          logger.info({ lookupResult }, "Skipping unsaved lookup");
          return;
        }

        try {
          await profileInteractor.addAlbumToProfile(
            "default",
            lookupResult.bestMatch.fileName
          );
        } catch {}
      })
    );

    state.hasNext = result.items.length === 50;
    state.offset = state.hasNext ? state.offset + 50 : state.offset;
    if (state.hasNext) {
      relevantTracks.forEach(
        (track) =>
          track.album?.spotifyId &&
          state.seenAlbumSpotifyIds.add(track.album.spotifyId)
      );
    }
  }
};
