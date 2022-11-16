import { AlbumDocument } from "@lute/domain";
import { z } from "zod";
import { QuantileRankAssessmentSettings } from "./models";

export enum AssessmentModel {
  QuantileRank = "quantile-rank",
}

export const isAssessmentModel = (value: unknown): value is AssessmentModel =>
  Object.values(AssessmentModel).includes(value as AssessmentModel);

export interface AssessmentParameters {
  albumId: string;
  profileId: string;
  model: AssessmentModel.QuantileRank;
  settings: QuantileRankAssessmentSettings;
}

export interface Assessment {
  albumId: string;
  score: number;
  metadata: Record<string, unknown>;
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

export type RecommendationFilter = z.infer<typeof recommendationFilterSchema>;

export const recommendationCountSchema = z
  .preprocess(Number, z.number().min(1).max(100))
  .default(20);

export interface RecommendationParameters {
  profileId: string;
  model: AssessmentModel.QuantileRank;
  settings: QuantileRankAssessmentSettings;
  filter: RecommendationFilter;
  count?: number;
}

export interface Recommendation {
  album: AlbumDocument;
  assessment: Assessment;
}
