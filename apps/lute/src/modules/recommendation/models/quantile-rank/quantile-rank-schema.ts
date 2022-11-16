import { z } from "zod";

export const quantileRankAssessableAlbumSchema = z
  .object({
    name: z.string(),
    artists: z
      .array(
        z.object({
          name: z.string(),
          fileName: z.string(),
        })
      )
      .nonempty(),
    fileName: z.string(),
    rating: z.number(),
    ratingCount: z.number(),
    primaryGenres: z.array(z.string()).nonempty(),
    secondaryGenres: z.array(z.string()),
    descriptors: z.array(z.string()).min(5),
  })
  .passthrough();

export type QuantileRankAssessableAlbum = z.infer<
  typeof quantileRankAssessableAlbumSchema
>;

const itemAndCountSchema = z.object({
  item: z.string(),
  count: z.number(),
});

export const quantileRankAssessableProfileDetailsSchema = z
  .object({
    artists: z.array(itemAndCountSchema),
    primaryGenres: z.array(itemAndCountSchema),
    secondaryGenres: z.array(itemAndCountSchema),
    descriptors: z.array(itemAndCountSchema),
  })
  .passthrough();

export type QuantileRankAssessableProfileDetails = z.infer<
  typeof quantileRankAssessableProfileDetailsSchema
>;

export const quantileRankAssessableProfileSchema = z
  .object({
    albums: z.array(itemAndCountSchema).min(10),
    details: quantileRankAssessableProfileDetailsSchema,
    weightedProfileDetails: quantileRankAssessableProfileDetailsSchema,
  })
  .passthrough();

export type QuantileRankAssessableProfile = z.infer<
  typeof quantileRankAssessableProfileSchema
>;

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
