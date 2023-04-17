import { DeepPartial, RecommendationPreset } from "@lute/domain";
import { MongoClient } from "mongodb";
import deepMerge from "ts-deepmerge";

export const buildRecommendationPresetRepo = async (
  mongoClient: MongoClient
) => {
  const presetsCollection = mongoClient
    .db("profile")
    .collection<RecommendationPreset>("presets");

  await presetsCollection.createIndex({ id: 1 }, { unique: true });

  return {
    async createPreset(preset: RecommendationPreset) {
      await presetsCollection.insertOne(preset);
    },
    async getPreset(id: string): Promise<RecommendationPreset | null> {
      return presetsCollection.findOne({ id });
    },
    async getPresetsByType(type: RecommendationPreset["type"]) {
      return presetsCollection.find({ type }).toArray();
    },
    async updatePreset(id: string, update: DeepPartial<RecommendationPreset>) {
      const existingPreset = await presetsCollection.findOne({ id });
      if (!existingPreset) {
        return null;
      }
      const updatedPreset = deepMerge(
        existingPreset,
        update
      ) as RecommendationPreset;
      await presetsCollection.updateOne({ id }, { $set: updatedPreset });
      return updatedPreset;
    },
  };
};

export type RecommendationPresetRepo = ReturnType<
  typeof buildRecommendationPresetRepo
>;
