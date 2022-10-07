import { z } from "zod";

export const assessableAlbumSchema = z
  .object({
    name: z.string(),
    artists: z.array(z.string()).nonempty(),
    fileName: z.string(),
    rating: z.number(),
    ratingCount: z.number(),
    primaryGenres: z.array(z.string()).nonempty(),
    secondaryGenres: z.array(z.string()),
    descriptors: z.array(z.string()).min(5),
  })
  .passthrough();

export type AssessableAlbum = z.infer<typeof assessableAlbumSchema>;

const itemAndCountSchema = z.object({
  item: z.string(),
  count: z.number(),
});

export const assessableProfileDetailsSchema = z
  .object({
    artists: z.array(itemAndCountSchema),
    primaryGenres: z.array(itemAndCountSchema),
    secondaryGenres: z.array(itemAndCountSchema),
    descriptors: z.array(itemAndCountSchema),
  })
  .passthrough();

export type AssessableProfileDetails = z.infer<
  typeof assessableProfileDetailsSchema
>;

export const assessableProfileSchema = z
  .object({
    albums: z.array(itemAndCountSchema).min(10),
    details: assessableProfileDetailsSchema,
    weightedProfileDetails: assessableProfileDetailsSchema,
  })
  .passthrough();

export type AssessableProfile = z.infer<typeof assessableProfileSchema>;

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

export interface Assessment {
  albumFileName: string;
  ratingQuantile: number;
  ratingCountQuantile: number;
  averagePrimaryGenreQuantile: number;
  averageSecondaryGenreQuantile?: number;
  averagePrimaryCrossGenreQuantile: number;
  averageSecondaryCrossGenreQuantile?: number;
  averageDescriptorQuantile: number;
  averageQuantile: number;
}
