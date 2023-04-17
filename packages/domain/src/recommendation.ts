import { z } from "zod";
import { ArtistDocument } from "./artists";
import { AlbumDocument } from "./rym";

export enum AssessmentModel {
  QuantileRank = "quantile-rank",
  JaccardIndex = "jaccard-index",
}

export const isAssessmentModel = (value: unknown): value is AssessmentModel =>
  Object.values(AssessmentModel).includes(value as AssessmentModel);

export type AlbumAssessment = {
  albumId: string;
  score: number;
  metadata: Record<string, unknown>;
};

export type AlbumRecommendation = {
  album: AlbumDocument;
  assessment: AlbumAssessment;
};

export type ArtistAssessment = {
  artistId: string;
  score: number;
  metadata: Record<string, unknown>;
};

export type ArtistRecommendation = {
  artist: ArtistDocument;
  assessment: ArtistAssessment;
};

export const albumRecommendationFilterSchema = z
  .object({
    excludeAlbums: z.array(z.string()).default([]),
    excludeArtists: z.array(z.string()).default([]),
    primaryGenres: z.array(z.string()).default([]),
    excludePrimaryGenres: z.array(z.string()).default([]),
    secondaryGenres: z.array(z.string()).default([]),
    excludeSecondaryGenres: z.array(z.string()).default([]),
  })
  .default({});

export type AlbumRecommendationFilter = z.infer<
  typeof albumRecommendationFilterSchema
>;

export const artistRecommendationFilterSchema = z
  .object({
    excludeArtists: z.array(z.string()).default([]),
    primaryGenres: z.array(z.string()).default([]),
    excludePrimaryGenres: z.array(z.string()).default([]),
    secondaryGenres: z.array(z.string()).default([]),
    excludeSecondaryGenres: z.array(z.string()).default([]),
  })
  .default({});

export type ArtistRecommendationFilter = z.infer<
  typeof artistRecommendationFilterSchema
>;

const weightSchema = z.preprocess(Number, z.number().min(0).max(100));

export const quantileRankAlbumAssessmentSettingsSchema = z
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

export type QuantileRankAlbumAssessmentSettings = z.infer<
  typeof quantileRankAlbumAssessmentSettingsSchema
>;

export const quantileRankArtistAssessmentSettingsSchema = z
  .object({
    noveltyFactor: z.preprocess(Number, z.number().min(0).max(1)).default(0.5),
    useArtistWeight: z
      .preprocess((val) => val === "true", z.boolean())
      .default(true),
    parameterWeights: z
      .object({
        primaryGenres: weightSchema.default(30),
        secondaryGenres: weightSchema.default(15),
        primaryCrossGenres: weightSchema.default(20),
        secondaryCrossGenres: weightSchema.default(10),
        descriptors: weightSchema.default(100),
      })
      .default({}),
  })
  .default({});

export type QuantileRankArtistAssessmentSettings = z.infer<
  typeof quantileRankArtistAssessmentSettingsSchema
>;

export const jaccardAssessmentSettingsSchema = z
  .object({
    parameterWeights: z
      .object({
        primaryGenres: weightSchema.default(3),
        secondaryGenres: weightSchema.default(2),
        primaryCrossGenres: weightSchema.default(1),
        secondaryCrossGenres: weightSchema.default(1),
        descriptors: weightSchema.default(5),
      })
      .default({}),
  })
  .default({});

export type JaccardAssessmentSettings = z.infer<
  typeof jaccardAssessmentSettingsSchema
>;

export type AlbumAssessmentParameters = {
  albumId: string;
  profileId: string;
} & (
  | {
      model: AssessmentModel.QuantileRank;
      settings: QuantileRankAlbumAssessmentSettings;
    }
  | {
      model: AssessmentModel.JaccardIndex;
      settings: JaccardAssessmentSettings;
    }
);

export type ArtistAssessmentParameters = {
  artistId: string;
  profileId: string;
} & (
  | {
      model: AssessmentModel.QuantileRank;
      settings: QuantileRankArtistAssessmentSettings;
    }
  | {
      model: AssessmentModel.JaccardIndex;
      settings: JaccardAssessmentSettings;
    }
);

export const recommendationCountSchema = z
  .preprocess(Number, z.number().min(1).max(100))
  .default(20);

export type AlbumRecommendationParameters = {
  profileId: string;
  filter: AlbumRecommendationFilter;
  count?: number;
} & (
  | {
      settings: QuantileRankAlbumAssessmentSettings;
      model: AssessmentModel.QuantileRank;
    }
  | {
      settings: JaccardAssessmentSettings;
      model: AssessmentModel.JaccardIndex;
    }
);

export type ArtistRecommendationParameters = {
  profileId: string;
  filter: ArtistRecommendationFilter;
  count?: number;
} & (
  | {
      settings: QuantileRankArtistAssessmentSettings;
      model: AssessmentModel.QuantileRank;
    }
  | {
      settings: JaccardAssessmentSettings;
      model: AssessmentModel.JaccardIndex;
    }
);

type BasePreset<T> = {
  id: string;
  name: string;
  type: T;
};

export type AlbumRecommendationPreset = BasePreset<"album"> & {
  filter: AlbumRecommendationFilter;
} & (
    | {
        settings: QuantileRankArtistAssessmentSettings;
        model: AssessmentModel.QuantileRank;
      }
    | {
        settings: JaccardAssessmentSettings;
        model: AssessmentModel.JaccardIndex;
      }
  );

export type ArtistRecommendationPreset = BasePreset<"artist"> & {
  filter: ArtistRecommendationFilter;
} & (
    | {
        settings: QuantileRankArtistAssessmentSettings;
        model: AssessmentModel.QuantileRank;
      }
    | {
        settings: JaccardAssessmentSettings;
        model: AssessmentModel.JaccardIndex;
      }
  );

export type RecommendationPreset =
  | AlbumRecommendationPreset
  | ArtistRecommendationPreset;

export type RecommendationPresetType = RecommendationPreset["type"];

export const isPresetType = (type: string): type is RecommendationPresetType =>
  ["album", "artist"].includes(type);

const settingsSchemaMap = {
  [AssessmentModel.JaccardIndex]: {
    album: jaccardAssessmentSettingsSchema,
    artist: jaccardAssessmentSettingsSchema,
  },
  [AssessmentModel.QuantileRank]: {
    album: quantileRankAlbumAssessmentSettingsSchema,
    artist: quantileRankArtistAssessmentSettingsSchema,
  },
};

export const getSettingsSchema = (
  type: RecommendationPresetType,
  model: AssessmentModel
) => {
  const schema = settingsSchemaMap[model]?.[type];
  if (!schema) {
    throw new Error("Invalid preset type or model");
  }
  return schema;
};

export const getFilterSchema = (type: RecommendationPresetType) => {
  switch (type) {
    case "album":
      return albumRecommendationFilterSchema;
    case "artist":
      return artistRecommendationFilterSchema;
  }
};
