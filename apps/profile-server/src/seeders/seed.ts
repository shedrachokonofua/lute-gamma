import {
  CatalogTrack,
  hashLookupKey,
  isSavedLookup,
  LookupKey,
  PaginatedValue,
} from "@lute/domain";
import { rymLookupClient } from "../utils";
import { SeedLookupInteractor } from "./seed-lookup-interactor";

interface CatalogTrackWithAlbum extends CatalogTrack {
  album: Exclude<CatalogTrack["album"], undefined>;
}

interface SeederState {
  hasNext: boolean;
  limit: number;
  offset: number;
  trackCountBySpotifyAlbumId: Record<string, number>;
  lookupKeyBySpotifyAlbumId: Record<string, LookupKey>;
  skippedAlbumSpotifyIds: Set<string>;
}

export const seedProfile = async ({
  profileId,
  seedLookupInteractor,
  fetchTracks,
}: {
  profileId: string;
  seedLookupInteractor: SeedLookupInteractor;
  fetchTracks: (state: SeederState) => Promise<PaginatedValue<CatalogTrack>>;
}) => {
  const state = {
    hasNext: true,
    offset: 0,
    limit: 50,
    trackCountBySpotifyAlbumId: {} as Record<string, number>,
    lookupKeyBySpotifyAlbumId: {} as Record<string, LookupKey>,
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

    Object.keys(tracksBySpotifyAlbumId).forEach((albumId) => {
      const tracks = tracksBySpotifyAlbumId[albumId];
      state.trackCountBySpotifyAlbumId[albumId] =
        tracks.length + (state.trackCountBySpotifyAlbumId[albumId] || 0);
      state.lookupKeyBySpotifyAlbumId[albumId] = {
        artist: tracks[0].artists[0].name,
        album: tracks[0].album.name,
      };
    });

    state.hasNext = result.items.length === 50;
    state.offset = state.hasNext ? state.offset + 50 : state.offset;
  }

  const trackCountByLookupHash = Object.keys(
    state.trackCountBySpotifyAlbumId
  ).reduce<Record<string, number>>((acc, albumId) => {
    const lookupHash = hashLookupKey(state.lookupKeyBySpotifyAlbumId[albumId]);
    acc[lookupHash] = state.trackCountBySpotifyAlbumId[albumId];
    return acc;
  }, {});

  await seedLookupInteractor.buildTable(profileId, trackCountByLookupHash);

  await Promise.all(
    Object.values(state.lookupKeyBySpotifyAlbumId).map(async (key) => {
      const lookupResult = await rymLookupClient.getOrCreateLookup(
        key.artist,
        key.album
      );

      if (!lookupResult) return;

      if (isSavedLookup(lookupResult)) {
        await seedLookupInteractor.handleSavedLookup(lookupResult);
      }
    })
  );
};
