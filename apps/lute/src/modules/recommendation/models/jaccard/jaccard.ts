import {
  AlbumDocument,
  Assessment,
  JaccardAssessmentSettings,
  jaccardAssessmentSettingsSchema,
  Profile,
} from "@lute/domain";
import * as ss from "simple-statistics";
import {
  jaccardAssessableAlbumSchema,
  jaccardAssessableProfileSchema,
} from "./jaccard-schema";
import { flatCompact, repeat } from "../helpers";

const take = <T>(array: T[], n: number): T[] => array.slice(0, n);

const union = (a: string[], b: string[]): string[] =>
  Array.from(new Set([...a, ...b]));

const intersection = (a: string[], b: string[]): string[] =>
  a.filter((value) => b.includes(value));

const getJaccardSimilarity = (a: string[], b: string[]): number =>
  intersection(b, a).length / union(b, a).length;

export const buildJaccardAssessment = ({
  album: inputAlbum,
  profile: inputProfile,
  settings: inputSettings,
}: {
  album: AlbumDocument;
  profile: Profile;
  settings: JaccardAssessmentSettings;
}): Assessment => {
  const album = jaccardAssessableAlbumSchema.parse(inputAlbum);
  const profile = jaccardAssessableProfileSchema.parse(inputProfile);
  const settings = jaccardAssessmentSettingsSchema.parse(inputSettings);

  const primaryGenreSimilarity = getJaccardSimilarity(
    take(profile.details.primaryGenres, 10).map((g) => g.item),
    album.primaryGenres
  );
  const secondaryGenreSimilarity = getJaccardSimilarity(
    take(profile.details.secondaryGenres, 10).map((g) => g.item),
    album.secondaryGenres
  );
  const primaryCrossGenreSimilarity = getJaccardSimilarity(
    take(profile.details.secondaryGenres, 10).map((g) => g.item),
    album.primaryGenres
  );
  const secondaryCrossGenreSimilarity = getJaccardSimilarity(
    take(profile.details.primaryGenres, 10).map((g) => g.item),
    album.secondaryGenres
  );
  const descriptorsSimilarity = getJaccardSimilarity(
    take(profile.details.descriptors, album.descriptors.length + 1).map(
      (d) => d.item
    ),
    album.descriptors
  );
  const score = ss.mean(
    flatCompact([
      repeat(primaryGenreSimilarity, settings.parameterWeights.primaryGenres),
      repeat(
        secondaryGenreSimilarity,
        settings.parameterWeights.secondaryGenres
      ),
      repeat(
        primaryCrossGenreSimilarity,
        settings.parameterWeights.primaryCrossGenres
      ),
      repeat(
        secondaryCrossGenreSimilarity,
        settings.parameterWeights.secondaryCrossGenres
      ),
      repeat(descriptorsSimilarity, settings.parameterWeights.descriptors),
    ])
  );

  return {
    albumId: album.fileName,
    score,
    metadata: {
      primaryGenreSimilarity,
      secondaryGenreSimilarity,
      primaryCrossGenreSimilarity,
      secondaryCrossGenreSimilarity,
      descriptorsSimilarity,
    },
  };
};
