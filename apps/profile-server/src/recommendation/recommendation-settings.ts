import { z } from "zod";
import { assessmentSettingsSchema } from "../assessment";

export const recommendationSettingsSchema = z.object({
  assessmentSettings: assessmentSettingsSchema.default({}),
  count: z.number().min(1).max(100).default(20),
  filter: z
    .object({
      excludeAlbums: z.array(z.string()).default([]),
      excludeArtists: z.array(z.string()).default([]),
      excludePrimaryGenres: z.array(z.string()).default([]),
      excludeSecondaryGenres: z.array(z.string()).default([]),
    })
    .default({}),
});

export type RecommendationSettings = z.infer<
  typeof recommendationSettingsSchema
>;
