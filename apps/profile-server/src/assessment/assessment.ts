import { AlbumDocument, assessableAlbumSchema, Assessment } from "@lute/domain";
import * as ss from "simple-statistics";
import { AssessmentContext } from "./assessment-context";

const repeat = (value: number, times: number) =>
  Array.from({ length: times }, () => value);

const flatCompact = <T>(arr: (T[] | undefined)[]) =>
  arr.reduce<T[]>((acc, val) => acc.concat(val || []), [] as T[]);

export const buildAssessment = (
  { profileAlbums, profileDetails, settings }: AssessmentContext,
  inputAlbum: AlbumDocument
): Assessment => {
  const album = assessableAlbumSchema.parse(inputAlbum);

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
      album.primaryGenres.map((albumGenre) => {
        return ss.quantileRank(
          profileDetails.primaryGenres.map((a) => a.count),
          profileDetails.primaryGenres.find((g) => g.item === albumGenre)
            ?.count || 0
        );
      })
    ) || settings.noveltyFactor;

  const averageSecondaryGenreQuantile =
    album.secondaryGenres.length > 0
      ? ss.mean(
          album.secondaryGenres.map((albumGenre) => {
            return ss.quantileRank(
              profileDetails.secondaryGenres.map((a) => a.count),
              profileDetails.secondaryGenres.find((g) => g.item === albumGenre)
                ?.count || 0
            );
          })
        ) || settings.noveltyFactor
      : undefined;

  const averagePrimaryCrossGenreQuantile =
    ss.mean(
      album.primaryGenres.map((albumGenre) => {
        return ss.quantileRank(
          profileDetails.secondaryGenres.map((a) => a.count),
          profileDetails.secondaryGenres.find((g) => g.item === albumGenre)
            ?.count || 0
        );
      })
    ) || settings.noveltyFactor;

  const averageSecondaryCrossGenreQuantile =
    album.secondaryGenres.length > 0
      ? ss.mean(
          album.secondaryGenres.map((albumGenre) => {
            return ss.quantileRank(
              profileDetails.primaryGenres.map((a) => a.count),
              profileDetails.primaryGenres.find((g) => g.item === albumGenre)
                ?.count || 0
            );
          })
        ) || settings.noveltyFactor
      : undefined;

  const averageDescriptorQuantile =
    ss.mean(
      album.descriptors.map((descriptor) => {
        return ss.quantileRank(
          profileDetails.descriptors.map((a) => a.count),
          profileDetails.descriptors.find((d) => d.item === descriptor)
            ?.count || 0
        );
      })
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
    albumFileName: album.fileName,
    ratingQuantile,
    ratingCountQuantile,
    averagePrimaryGenreQuantile,
    averageSecondaryGenreQuantile,
    averagePrimaryCrossGenreQuantile,
    averageSecondaryCrossGenreQuantile,
    averageDescriptorQuantile,
    averageQuantile,
  };
};
