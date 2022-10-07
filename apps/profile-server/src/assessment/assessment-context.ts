import {
  AssessableAlbum,
  assessableAlbumSchema,
  AssessableProfileDetails,
  assessableProfileSchema,
  AssessmentSettings,
  Profile,
} from "@lute/domain";
import { rymDataClient } from "../utils";

export interface AssessmentContext {
  profileDetails: AssessableProfileDetails;
  profileAlbums: AssessableAlbum[];
  settings: AssessmentSettings;
}

export const buildAssessmentContext = async ({
  profile: inputProfile,
  settings,
}: {
  profile: Profile;
  settings: AssessmentSettings;
}): Promise<AssessmentContext> => {
  const profile = assessableProfileSchema.parse(inputProfile);

  const rawProfileAlbums = await rymDataClient.queryAlbums({
    keys: profile.albums.map((album) => album.item),
  });
  const profileAlbums = rawProfileAlbums.filter(
    (album) => assessableAlbumSchema.safeParse(album).success
  ) as unknown as AssessableAlbum[];

  const profileDetails = settings.useAlbumWeight
    ? profile.weightedProfileDetails
    : profile.details;

  return {
    profileDetails,
    profileAlbums,
    settings,
  };
};
