import { z } from "zod";

export const jaccardAssessableAlbumSchema = z
  .object({
    name: z.string(),
    fileName: z.string(),
    primaryGenres: z.array(z.string()).nonempty(),
    secondaryGenres: z.array(z.string()),
    descriptors: z.array(z.string()).min(5),
  })
  .passthrough();

export type JaccardAssessableAlbum = z.infer<
  typeof jaccardAssessableAlbumSchema
>;

const itemAndCountSchema = z.object({
  item: z.string(),
  count: z.number(),
});

export const jaccardAssessableProfileDetailsSchema = z
  .object({
    primaryGenres: z.array(itemAndCountSchema),
    secondaryGenres: z.array(itemAndCountSchema),
    descriptors: z.array(itemAndCountSchema),
  })
  .passthrough();

export type JaccardAssessableProfileDetails = z.infer<
  typeof jaccardAssessableProfileDetailsSchema
>;

export const jaccardAssessableProfileSchema = z
  .object({
    albums: z.array(itemAndCountSchema).min(10),
    details: jaccardAssessableProfileDetailsSchema,
  })
  .passthrough();

export type JaccardAssessableProfile = z.infer<
  typeof jaccardAssessableProfileSchema
>;
