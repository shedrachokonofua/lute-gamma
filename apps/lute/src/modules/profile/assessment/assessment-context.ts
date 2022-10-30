import {
  AssessableAlbum,
  assessableAlbumSchema,
  AssessableProfileDetails,
  assessableProfileSchema,
  AssessmentSettings,
  Profile,
} from "@lute/domain";
import { AlbumInteractor } from "../../albums";

export interface AssessmentContext {
  profileDetails: AssessableProfileDetails;
  profileAlbums: AssessableAlbum[];
  settings: AssessmentSettings;
}

export const buildAssessmentContext = async ({
  albumInteractor,
  profile: inputProfile,
  settings,
}: {
  albumInteractor: AlbumInteractor;
  profile: Profile;
  settings: AssessmentSettings;
}): Promise<AssessmentContext> => {
  const profile = assessableProfileSchema.parse(inputProfile);

  const rawProfileAlbums = await albumInteractor.findAlbums({
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
