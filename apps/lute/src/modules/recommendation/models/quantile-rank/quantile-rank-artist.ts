import * as ss from "simple-statistics";
import {
  ArtistAssessment,
  ArtistDocument,
  Profile,
  QuantileRankArtistAssessmentSettings,
  quantileRankArtistAssessmentSettingsSchema,
} from "@lute/domain";
import { flatCompact, repeat } from "../helpers";
import { quantileRankAssessableArtistSchema } from "./quantile-rank-schema";

export const buildQuantileRankArtistAssessment = ({
  artist: inputArtist,
  profile,
  settings: inputSettings,
}: {
  artist: ArtistDocument;
  profile: Profile;
  settings: QuantileRankArtistAssessmentSettings;
}): ArtistAssessment => {
  const artist = quantileRankAssessableArtistSchema.parse(inputArtist);
  const settings =
    quantileRankArtistAssessmentSettingsSchema.parse(inputSettings);
  const profileDetails = settings.useArtistWeight
    ? profile.weightedProfileDetails
    : profile.details;

  const averagePrimaryGenreQuantile =
    ss.mean(
      artist.primaryGenres.map((genre) =>
        ss.quantileRank(
          profileDetails.primaryGenres.map((a) => a.count),
          profileDetails.primaryGenres.find((g) => g.item === genre)?.count || 0
        )
      )
    ) || settings.noveltyFactor;

  const averageSecondaryGenreQuantile =
    artist.secondaryGenres.length > 0
      ? ss.mean(
          artist.secondaryGenres.map((genre) =>
            ss.quantileRank(
              profileDetails.secondaryGenres.map((a) => a.count),
              profileDetails.secondaryGenres.find((g) => g.item === genre)
                ?.count || 0
            )
          )
        ) || settings.noveltyFactor
      : undefined;

  const averagePrimaryCrossGenreQuantile =
    ss.mean(
      artist.primaryGenres.map((genre) =>
        ss.quantileRank(
          profileDetails.secondaryGenres.map((a) => a.count),
          profileDetails.secondaryGenres.find((g) => g.item === genre)?.count ||
            0
        )
      )
    ) || settings.noveltyFactor;

  const averageSecondaryCrossGenreQuantile =
    artist.secondaryGenres.length > 0
      ? ss.mean(
          artist.secondaryGenres.map((genre) =>
            ss.quantileRank(
              profileDetails.primaryGenres.map((a) => a.count),
              profileDetails.primaryGenres.find((g) => g.item === genre)
                ?.count || 0
            )
          )
        ) || settings.noveltyFactor
      : undefined;

  const averageDescriptorQuantile =
    ss.mean(
      artist.descriptors.map((descriptor) =>
        ss.quantileRank(
          profileDetails.descriptors.map((a) => a.count),
          profileDetails.descriptors.find((d) => d.item === descriptor)
            ?.count || 0
        )
      )
    ) || settings.noveltyFactor;

  const averageQuantile = ss.mean(
    flatCompact([
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
    artistId: inputArtist.fileName,
    score: averageQuantile,
    metadata: {
      averagePrimaryGenreQuantile,
      averageSecondaryGenreQuantile,
      averagePrimaryCrossGenreQuantile,
      averageSecondaryCrossGenreQuantile,
      averageDescriptorQuantile,
    },
  };
};
