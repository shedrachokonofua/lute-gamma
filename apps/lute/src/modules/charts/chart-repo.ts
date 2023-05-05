import { ChartDocument } from "@lute/domain";
import { MongoClient } from "mongodb";
import { logger } from "../../logger";

export const buildChartRepo = (mongoClient: MongoClient) => {
  const collection = mongoClient.db("lute").collection<ChartDocument>("charts");

  return {
    async putChart(chart: ChartDocument): Promise<ChartDocument> {
      logger.info({ chart }, "Saving chart");
      const result = await collection.findOneAndUpdate(
        { fileName: chart.fileName },
        { $set: chart as Partial<ChartDocument> },
        { upsert: true, returnDocument: "after" }
      );

      logger.info({ result }, "Attempted to save chart");
      if (!result.value || !result.ok) {
        logger.error(result, "Failed to save chart");
        throw new Error("Failed to save chart");
      }

      return result.value;
    },
  };
};
export type ChartRepo = ReturnType<typeof buildChartRepo>;
