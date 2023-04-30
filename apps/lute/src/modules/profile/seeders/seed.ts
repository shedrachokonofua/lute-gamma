import {
  CatalogTrack,
  hashLookupKey,
  isSavedLookup,
  LookupKey,
  LookupStatus,
  PaginatedValue,
} from "@lute/domain";
import { Context } from "../../../context";
import { buildSeedLookupInteractor } from "./seed-lookup-interactor";

interface CatalogTrackWithAlbum extends CatalogTrack {
  album: Exclude<CatalogTrack["album"], undefined>;
}

interface SeederState {
  hasNext: boolean;
  limit: number;
  offset: number;
  trackCountByCatalogAlbumId: Record<string, number>;
  lookupKeyByCatalogAlbumId: Record<string, LookupKey>;
}

export const seedProfile = async (
  { redisClient, profileInteractor, lookupInteractor }: Context,
  {
    profileId,
    fetchTracks,
    maxOffset = Number.MAX_SAFE_INTEGER,
  }: {
    profileId: string;
    fetchTracks: (state: SeederState) => Promise<PaginatedValue<CatalogTrack>>;
    maxOffset?: number;
  }
) => {
  const seedLookupInteractor = buildSeedLookupInteractor({
    redisClient,
    profileInteractor,
  });
  const state = {
    hasNext: true,
    offset: 0,
    limit: 50,
    trackCountByCatalogAlbumId: {} as Record<string, number>,
    lookupKeyByCatalogAlbumId: {} as Record<string, LookupKey>,
  };
  while (state.hasNext) {
    const result = await fetchTracks(state);
    const relevantTracks = result.items.filter(
      (track): track is CatalogTrackWithAlbum =>
        !!track.album?.catalogId && track.album.type === "album"
    );

    const tracksByCatalogAlbumId = relevantTracks.reduce<{
      [catalogAlbumId: string]: CatalogTrackWithAlbum[];
    }>((acc, track) => {
      const albumId = track.album.catalogId;
      acc[albumId] = acc[albumId] || [];
      acc[albumId].push(track);
      return acc;
    }, {});

    Object.keys(tracksByCatalogAlbumId).forEach((albumId) => {
      const tracks = tracksByCatalogAlbumId[albumId];
      state.trackCountByCatalogAlbumId[albumId] =
        tracks.length + (state.trackCountByCatalogAlbumId[albumId] || 0);
      state.lookupKeyByCatalogAlbumId[albumId] = {
        artist: tracks[0].artists[0].name,
        album: tracks[0].album.name,
      };
    });

    const nextOffset = state.offset + 50;
    state.hasNext = result.items.length === 50 && nextOffset < maxOffset;
    state.offset = state.hasNext ? nextOffset : state.offset;
  }

  const trackCountByLookupHash = Object.keys(
    state.trackCountByCatalogAlbumId
  ).reduce<Record<string, number>>((acc, albumId) => {
    const lookupHash = hashLookupKey(state.lookupKeyByCatalogAlbumId[albumId]);
    acc[lookupHash] = state.trackCountByCatalogAlbumId[albumId];
    return acc;
  }, {});

  await seedLookupInteractor.buildTable(profileId, trackCountByLookupHash);

  await Promise.all(
    Object.values(state.lookupKeyByCatalogAlbumId).map(async (key) => {
      const lookupResult = await lookupInteractor.getOrCreateLookup({
        artist: key.artist,
        album: key.album,
      });

      if (!lookupResult) return;

      if (isSavedLookup(lookupResult)) {
        await seedLookupInteractor.handleSavedLookup(lookupResult);
      } else if (lookupResult.status === LookupStatus.NotFound) {
        await seedLookupInteractor.handleLookupNotFound(lookupResult.keyHash);
      }
    })
  );
};
