import { CatalogTrack, LookupStatus, RedisClient } from "@lute/shared";
import { logger } from "../../logger";
import { catalogClient, rymLookupClient } from "../../utils";
import { ProfileInteractor } from "../../profile-interactor";

interface CatalogTrackWithAlbum extends CatalogTrack {
  album: Exclude<CatalogTrack["album"], undefined>;
}

export const seedDefaultProfile = async ({
  profileInteractor,
}: {
  profileInteractor: ProfileInteractor;
}) => {
  const state = {
    hasNext: true,
    offset: 0,
    trackCountBySpotifyAlbumId: {} as Record<string, number>,
    skippedAlbumSpotifyIds: new Set<string>(),
  };
  while (state.hasNext) {
    const result = await catalogClient.getTracks({
      limit: 50,
      offset: state.offset,
    });

    const relevantTracks = result.items.filter(
      (track): track is CatalogTrackWithAlbum =>
        !!track.album?.spotifyId && track.album.type === "album"
    );
    const tracksBySpotifyAlbumId = relevantTracks.reduce<{
      [spotifyAlbumId: string]: CatalogTrackWithAlbum[];
    }>((acc, track) => {
      const albumId = track.album.spotifyId;
      acc[albumId] = acc[albumId] || [];
      acc[albumId].push(track);
      return acc;
    }, {});
    console.log("tracksBySpotifyAlbumId", tracksBySpotifyAlbumId);
    await Promise.all(
      Object.keys(tracksBySpotifyAlbumId).map(async (albumId) => {
        const tracks = tracksBySpotifyAlbumId[albumId];
        const trackCount =
          tracks.length + (state.trackCountBySpotifyAlbumId[albumId] || 0);

        const lookupResult = await rymLookupClient.getOrCreateLookup(
          tracks[0].artists[0].name,
          tracks[0].album.name
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
          await profileInteractor.putAlbumOnProfile({
            profileId: "default",
            albumFileName: lookupResult.bestMatch.fileName,
            count: trackCount,
          });
        } catch (error) {
          logger.error(
            { error, lookupResult, albumId, trackCount },
            "Failed to put album on profile"
          );
        }
      })
    );

    state.hasNext = result.items.length === 50;
    state.offset = state.hasNext ? state.offset + 50 : state.offset;
  }
};
