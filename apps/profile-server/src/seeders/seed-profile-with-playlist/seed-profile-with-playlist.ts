import { ProfileInteractor } from "../../profile-interactor";
import { catalogClient } from "../../utils";
import { seedProfile } from "../seed";

export const seedProfileWithPlaylist = async ({
  profileId,
  profileInteractor,
  playlistId,
}: {
  profileId: string;
  profileInteractor: ProfileInteractor;
  playlistId: string;
}) => {
  await seedProfile({
    profileId,
    profileInteractor,
    fetchTracks: (state) =>
      catalogClient.getPlaylistTracks({
        limit: state.limit,
        offset: state.offset,
        playlistId,
      }),
  });
};
