import * as ss from "simple-statistics";
import {
  AlbumDocument,
  Assessment,
  QuantileRankAssessmentSettings,
  quantileRankAssessmentSettingsSchema,
} from "@lute/domain";
import { QuantileRankAssessmentContext } from "./quantile-rank-assessment-context";
import { quantileRankAssessableAlbumSchema } from "./quantile-rank-schema";

const repeat = (value: number, times: number) =>
  Array.from({ length: times }, () => value);

const flatCompact = <T>(arr: (T[] | undefined)[]) =>
  arr.reduce<T[]>((acc, val) => acc.concat(val || []), [] as T[]);

export const buildQuantileRankAssessment = ({
  album: inputAlbum,
  settings: inputSettings,
  assessmentContext: { profileDetails, profileAlbums },
}: {
  album: AlbumDocument;
  settings: QuantileRankAssessmentSettings;
  assessmentContext: QuantileRankAssessmentContext;
}): Assessment => {
  const album = quantileRankAssessableAlbumSchema.parse(inputAlbum);
  const settings = quantileRankAssessmentSettingsSchema.parse(inputSettings);

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
