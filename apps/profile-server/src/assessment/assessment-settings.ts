import { z } from "zod";

const weightSchema = z.preprocess(Number, z.number().min(0).max(100));

export const assessmentSettingsSchema = z.object({
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
});

export type AssessmentSettings = z.infer<typeof assessmentSettingsSchema>;
