import { z } from "zod";
import { AlbumDocument } from "./rym";

export enum AssessmentModel {
  QuantileRank = "quantile-rank",
  JaccardIndex = "jaccard-index",
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

export const jaccardAssessmentSettingsSchema = z
  .object({
    parameterWeights: z
      .object({
        primaryGenres: weightSchema.default(3),
        secondaryGenres: weightSchema.default(2),
        primaryCrossGenres: weightSchema.default(1),
        secondaryCrossGenres: weightSchema.default(1),
        descriptors: weightSchema.default(5),
      })
      .default({}),
  })
  .default({});

export type JaccardAssessmentSettings = z.infer<
  typeof jaccardAssessmentSettingsSchema
>;

export type RecommendationFilter = z.infer<typeof recommendationFilterSchema>;

export type RecommendationParameters = {
  profileId: string;
  filter: RecommendationFilter;
  count?: number;
} & (
  | {
      settings: QuantileRankAssessmentSettings;
      model: AssessmentModel.QuantileRank;
    }
  | {
      settings: JaccardAssessmentSettings;
      model: AssessmentModel.JaccardIndex;
    }
);

export interface _AsessementParameters<T extends {}> {
  albumId: string;
  profileId: string;
  model: AssessmentModel;
  settings: T;
}

export type _QuantileRankAssessmentParameters =
  _AsessementParameters<QuantileRankAssessmentSettings>;

export type _JaccardAssessmentParameters =
  _AsessementParameters<JaccardAssessmentSettings>;
