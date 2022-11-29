import * as ss from "simple-statistics";
import {
  AlbumDocument,
  AlbumAssessment,
  QuantileRankAlbumAssessmentSettings,
  quantileRankAlbumAssessmentSettingsSchema,
  Profile,
} from "@lute/domain";
import {
  QuantileRankAssessableAlbum,
  quantileRankAssessableAlbumSchema,
  QuantileRankAssessableProfileDetails,
  quantileRankAssessableProfileSchema,
} from "./quantile-rank-schema";
import { flatCompact, repeat } from "../helpers";
import { AlbumInteractor } from "../../../albums";

export interface QuantileRankAssessmentContext {
  profileDetails: QuantileRankAssessableProfileDetails;
  profileAlbums: QuantileRankAssessableAlbum[];
}

export const buildQuantileRankAlbumAssessmentContext = async ({
  albumInteractor,
  profile: inputProfile,
  settings,
}: {
  albumInteractor: AlbumInteractor;
  profile: Profile;
  settings: QuantileRankAlbumAssessmentSettings;
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

export const buildQuantileRankAlbumAssessment = ({
  album: inputAlbum,
  settings: inputSettings,
  assessmentContext: { profileDetails, profileAlbums },
}: {
  album: AlbumDocument;
  settings: QuantileRankAlbumAssessmentSettings;
  assessmentContext: QuantileRankAssessmentContext;
}): AlbumAssessment => {
  const album = quantileRankAssessableAlbumSchema.parse(inputAlbum);
  const settings =
    quantileRankAlbumAssessmentSettingsSchema.parse(inputSettings);

  const ratingQuantile = ss.quantileRank(
    profileAlbums.map((a) => a.rating),
    album.rating
  );

  const ratingCountQuantile = ss.quantileRank(
    profileAlbums.map((a) => a.ratingCount),
    album.ratingCount
  );

  const averagePrimaryGenreQuantile =
    ss.mean(
      album.primaryGenres.map((albumGenre) =>
        ss.quantileRank(
          profileDetails.primaryGenres.map((a) => a.count),
          profileDetails.primaryGenres.find((g) => g.item === albumGenre)
            ?.count || 0
        )
      )
    ) || settings.noveltyFactor;

  const averageSecondaryGenreQuantile =
    album.secondaryGenres.length > 0
      ? ss.mean(
          album.secondaryGenres.map((albumGenre) =>
            ss.quantileRank(
              profileDetails.secondaryGenres.map((a) => a.count),
              profileDetails.secondaryGenres.find((g) => g.item === albumGenre)
                ?.count || 0
            )
          )
        ) || settings.noveltyFactor
      : undefined;

  const averagePrimaryCrossGenreQuantile =
    ss.mean(
      album.primaryGenres.map((albumGenre) =>
        ss.quantileRank(
          profileDetails.secondaryGenres.map((a) => a.count),
          profileDetails.secondaryGenres.find((g) => g.item === albumGenre)
            ?.count || 0
        )
      )
    ) || settings.noveltyFactor;

  const averageSecondaryCrossGenreQuantile =
    album.secondaryGenres.length > 0
      ? ss.mean(
          album.secondaryGenres.map((albumGenre) =>
            ss.quantileRank(
              profileDetails.primaryGenres.map((a) => a.count),
              profileDetails.primaryGenres.find((g) => g.item === albumGenre)
                ?.count || 0
            )
          )
        ) || settings.noveltyFactor
      : undefined;

  const averageDescriptorQuantile =
    ss.mean(
      album.descriptors.map((descriptor) =>
        ss.quantileRank(
          profileDetails.descriptors.map((a) => a.count),
          profileDetails.descriptors.find((d) => d.item === descriptor)
            ?.count || 0
        )
      )
    ) || settings.noveltyFactor;

  const averageQuantile = ss.mean(
    flatCompact([
      repeat(ratingQuantile, settings.parameterWeights.rating),
      repeat(ratingCountQuantile, settings.parameterWeights.ratingCount),
      repeat(
        averagePrimaryGenreQuantile,
        settings.parameterWeights.primaryGenres
      ),
      averageSecondaryGenreQuantile
        ? repeat(
            averageSecondaryGenreQuantile,
            settings.parameterWeights.secondaryGenres
          )
        : undefined,
      repeat(
        averagePrimaryCrossGenreQuantile,
        settings.parameterWeights.primaryCrossGenres
      ),
      averageSecondaryCrossGenreQuantile
        ? repeat(
            averageSecondaryCrossGenreQuantile,
            settings.parameterWeights.secondaryCrossGenres
          )
        : undefined,
      repeat(averageDescriptorQuantile, settings.parameterWeights.descriptors),
    ])
  );

  return {
    albumId: inputAlbum.fileName,
    score: averageQuantile,
    metadata: {
      ratingQuantile,
      ratingCountQuantile,
      averagePrimaryGenreQuantile,
      averageSecondaryGenreQuantile,
      averagePrimaryCrossGenreQuantile,
      averageSecondaryCrossGenreQuantile,
      averageDescriptorQuantile,
    },
  };
};
