import { CatalogTrack } from "@lute/domain";
import { SpotifyTrack } from "./spotify";

export const spotifyTrackToCatalogTrack = (
  spotifyTrack: SpotifyTrack
): CatalogTrack => ({
  catalogId: spotifyTrack.uri,
  name: spotifyTrack.name,
  artists: spotifyTrack.artists.map((artist) => ({
    catalogId: artist.uri,
    name: artist.name,
  })),
  album: {
    catalogId: spotifyTrack.album.uri,
    name: spotifyTrack.album.name,
    type: spotifyTrack.album.album_type.toLowerCase() as any,
  },
});
