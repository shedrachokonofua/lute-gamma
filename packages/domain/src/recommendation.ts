import { z } from "zod";
import { AlbumDocument } from "./rym";

export enum AssessmentModel {
  QuantileRank = "quantile-rank",
}

export const isAssessmentModel = (value: unknown): value is AssessmentModel =>
  Object.values(AssessmentModel).includes(value as AssessmentModel);

export interface Assessment {
  albumId: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface Recommendation {
  album: AlbumDocument;
  assessment: Assessment;
}

export const recommendationFilterSchema = z
  .object({
    excludeAlbums: z.array(z.string()).default([]),
    excludeArtists: z.array(z.string()).default([]),
    primaryGenres: z.array(z.string()).default([]),
    excludePrimaryGenres: z.array(z.string()).default([]),
    secondaryGenres: z.array(z.string()).default([]),
    excludeSecondaryGenres: z.array(z.string()).default([]),
  })
  .default({});

const weightSchema = z.preprocess(Number, z.number().min(0).max(100));

export const quantileRankAssessmentSettingsSchema = z
  .object({
    noveltyFactor: z.preprocess(Number, z.number().min(0).max(1)).default(0.5),
    useAlbumWeight: z
      .preprocess((val) => val === "true", z.boolean())
      .default(false),
    parameterWeights: z
      .object({
        rating: weightSchema.default(10),
        ratingCount: weightSchema.default(5),
        primaryGenres: weightSchema.default(30),
        secondaryGenres: weightSchema.default(15),
        primaryCrossGenres: weightSchema.default(20),
        secondaryCrossGenres: weightSchema.default(10),
        descriptors: weightSchema.default(100),
      })
      .default({}),
  })
  .default({});

export type QuantileRankAssessmentSettings = z.infer<
  typeof quantileRankAssessmentSettingsSchema
>;

export type RecommendationFilter = z.infer<typeof recommendationFilterSchema>;

export interface RecommendationParameters {
  profileId: string;
  model: AssessmentModel.QuantileRank;
  settings: QuantileRankAssessmentSettings;
  filter: RecommendationFilter;
  count?: number;
}
