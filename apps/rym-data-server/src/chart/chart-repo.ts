import { ChartDocument } from "@lute/domain";
import { logger } from "../logger";
import { ServerContext } from "../ServerContext";

export const buildChartRepo = (serverContext: ServerContext) => ({
  async putChart(chart: ChartDocument): Promise<ChartDocument> {
    logger.info({ chart }, "Saving chart");
    const result = await serverContext.mongoDatabase
      .collection<ChartDocument>("charts")
      .findOneAndUpdate(
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
});

export type ChartRepo = ReturnType<typeof buildChartRepo>;
