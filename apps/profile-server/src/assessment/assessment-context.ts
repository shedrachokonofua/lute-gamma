import { Profile } from "../profile-repo";
import { rymDataClient } from "../utils";
import {
  AssessableAlbum,
  assessableAlbumSchema,
  AssessableProfileDetails,
  assessableProfileSchema,
} from "./assessment-schema";
import { AssessmentSettings } from "./assessment-settings";

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
