import { catalogClient } from "../../utils";
import { seedProfile } from "../seed";
import { SeedLookupInteractor } from "../seed-lookup-interactor";

export const seedProfileWithPlaylist = async ({
  profileId,
  seedLookupInteractor,
  playlistId,
}: {
  profileId: string;
  seedLookupInteractor: SeedLookupInteractor;
  playlistId: string;
}) => {
  await seedProfile({
    profileId,
    seedLookupInteractor,
    fetchTracks: (state) =>
      catalogClient.getPlaylistTracks({
        limit: state.limit,
        offset: state.offset,
        playlistId,
      }),
  });
};
