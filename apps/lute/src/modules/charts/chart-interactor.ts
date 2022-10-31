import { ChartDocument, PutChartPayload } from "@lute/domain";
import { MongoClient } from "mongodb";
import { buildChartRepo } from "./chart-repo";

export const buildChartInteractor = (mongoClient: MongoClient) => {
  const chartRepo = buildChartRepo(mongoClient);

  return {
    async putChart(chart: PutChartPayload): Promise<ChartDocument> {
      const chartDocument: ChartDocument = {
        ...chart,
        albums: chart.albums.map((album) => ({
          position: album.position,
          fileName: album.fileName,
        })),
      };
      const data = await chartRepo.putChart(chartDocument);
      return data;
    },
  };
};
