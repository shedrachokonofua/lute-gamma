import { catalogClient } from "../../utils";
import { seedProfile } from "../seed";
import { SeedLookupInteractor } from "../seed-lookup-interactor";

export const seedDefaultProfile = async ({
  seedLookupInteractor,
}: {
  seedLookupInteractor: SeedLookupInteractor;
}) => {
  await seedProfile({
    profileId: "default",
    seedLookupInteractor,
    fetchTracks: (state) =>
      catalogClient.getTracks({
        limit: state.limit,
        offset: state.offset,
      }),
  });
};
