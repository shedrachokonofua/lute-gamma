import { CatalogTrack, LookupStatus, PaginatedValue } from "@lute/domain";
import { logger } from "../logger";
import { ProfileInteractor } from "../profile-interactor";
import { rymLookupClient } from "../utils";

interface CatalogTrackWithAlbum extends CatalogTrack {
  album: Exclude<CatalogTrack["album"], undefined>;
}

interface SeederState {
  hasNext: boolean;
  limit: number;
  offset: number;
  trackCountBySpotifyAlbumId: Record<string, number>;
  skippedAlbumSpotifyIds: Set<string>;
}

export const seedProfile = async ({
  profileId,
  profileInteractor,
  fetchTracks,
}: {
  profileId: string;
  profileInteractor: ProfileInteractor;
  fetchTracks: (state: SeederState) => Promise<PaginatedValue<CatalogTrack>>;
}) => {
  const state = {
    hasNext: true,
    offset: 0,
    limit: 50,
    trackCountBySpotifyAlbumId: {} as Record<string, number>,
    skippedAlbumSpotifyIds: new Set<string>(),
  };
  while (state.hasNext) {
    const result = await fetchTracks(state);

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
            profileId,
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
