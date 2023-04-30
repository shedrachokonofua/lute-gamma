import { Context } from "../../../context";
import { seedProfile } from "./seed";

export const seedProfileWithTopTracks = async (
  context: Context,
  profileId: string
) => {
  await seedProfile(context, {
    profileId,
    maxOffset: 50,
    fetchTracks: async (state) => {
      const res = await context.spotifyInteractor.getTopTracks({
        limit: state.limit,
        offset: state.offset,
      });
      return res;
    },
  });
};
