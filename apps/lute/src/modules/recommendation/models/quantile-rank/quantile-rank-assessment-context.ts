import { Profile, QuantileRankAssessmentSettings } from "@lute/domain";
import { AlbumInteractor } from "../../../albums";
import {
  QuantileRankAssessableAlbum,
  quantileRankAssessableAlbumSchema,
  QuantileRankAssessableProfileDetails,
  quantileRankAssessableProfileSchema,
} from "./quantile-rank-schema";

export interface QuantileRankAssessmentContext {
  profileDetails: QuantileRankAssessableProfileDetails;
  profileAlbums: QuantileRankAssessableAlbum[];
}

export const buildQuantileRankAssessmentContext = async ({
  albumInteractor,
  profile: inputProfile,
  settings,
}: {
  albumInteractor: AlbumInteractor;
  profile: Profile;
  settings: QuantileRankAssessmentSettings;
}): Promise<QuantileRankAssessmentContext> => {
  const profile = quantileRankAssessableProfileSchema.parse(inputProfile);

  const rawProfileAlbums = await albumInteractor.findAlbums({
    keys: profile.albums.map((album) => album.item),
  });

  const profileAlbums = rawProfileAlbums.filter(
    (album) => quantileRankAssessableAlbumSchema.safeParse(album).success
  ) as unknown as QuantileRankAssessableAlbum[];

  const profileDetails = settings.useAlbumWeight
    ? profile.weightedProfileDetails
    : profile.details;

  return {
    profileDetails,
    profileAlbums,
  };
};
