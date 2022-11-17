import { AssessmentModel, QuantileRankAssessmentSettings } from "@lute/domain";
import { z } from "zod";

export interface AssessmentParameters {
  albumId: string;
  profileId: string;
  model: AssessmentModel.QuantileRank;
  settings: QuantileRankAssessmentSettings;
}

export const recommendationCountSchema = z
  .preprocess(Number, z.number().min(1).max(100))
  .default(20);
