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

export const quantileRankAssessableArtistSchema = z
  .object({
    name: z.string(),
    fileName: z.string(),
    albumFileNames: z.array(z.string()).min(3),
    primaryGenres: z.array(z.string()).nonempty(),
    secondaryGenres: z.array(z.string()),
    descriptors: z.array(z.string()).min(8),
  })
  .passthrough();

export type QuantileRankAssessableArtist = z.infer<
  typeof quantileRankAssessableArtistSchema
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
