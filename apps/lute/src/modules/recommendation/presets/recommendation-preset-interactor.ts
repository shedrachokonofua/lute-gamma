import { DeepPartial, RecommendationPreset } from "@lute/domain";
import { MongoClient } from "mongodb";
import { buildRecommendationPresetRepo } from "./recommendation-preset-repo";

export const buildRecommendationPresetInteractor = async ({
  mongoClient,
}: {
  mongoClient: MongoClient;
}) => {
  const presetRepo = await buildRecommendationPresetRepo(mongoClient);

  return {
    async createPreset(preset: RecommendationPreset) {
      await presetRepo.createPreset(preset);
    },
    async getPreset(id: string): Promise<RecommendationPreset | null> {
      return presetRepo.getPreset(id);
    },
    async getPresetsByType(type: RecommendationPreset["type"]) {
      return presetRepo.getPresetsByType(type);
    },
    async updatePreset(id: string, update: DeepPartial<RecommendationPreset>) {
      return presetRepo.updatePreset(id, update);
    },
  };
};

export type RecommendationPresetInteractor = ReturnType<
  typeof buildRecommendationPresetInteractor
>;
