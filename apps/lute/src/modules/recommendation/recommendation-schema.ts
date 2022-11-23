import {
  AssessmentModel,
  JaccardAssessmentSettings,
  QuantileRankAssessmentSettings,
} from "@lute/domain";
import { z } from "zod";

export type AssessmentParameters = {
  albumId: string;
  profileId: string;
} & (
  | {
      model: AssessmentModel.QuantileRank;
      settings: QuantileRankAssessmentSettings;
    }
  | {
      model: AssessmentModel.JaccardIndex;
      settings: JaccardAssessmentSettings;
    }
);

export const recommendationCountSchema = z
  .preprocess(Number, z.number().min(1).max(100))
  .default(20);
