import { z } from "zod";

export const assessableAlbumSchema = z
  .object({
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
