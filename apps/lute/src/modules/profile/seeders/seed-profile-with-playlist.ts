import { Context } from "../../../context";
import { seedProfile } from "./seed";

export const seedProfileWithPlaylist = async (
  context: Context,
  {
    profileId,
    playlistId,
  }: {
    profileId: string;
    playlistId: string;
  }
) => {
  await seedProfile(context, {
    profileId,
    fetchTracks: (state) =>
      context.spotifyInteractor.getPlaylistTracks({
        limit: state.limit,
        offset: state.offset,
        playlistId,
      }),
  });
};
