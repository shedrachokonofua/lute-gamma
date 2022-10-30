import { Context } from "../../../../context";
import { seedProfile } from "../seed";

export const seedDefaultProfile = async (context: Context) => {
  await seedProfile(context, {
    profileId: "default",
    fetchTracks: (state) =>
      context.spotifyInteractor.getTracks({
        limit: state.limit,
        offset: state.offset,
      }),
  });
};
