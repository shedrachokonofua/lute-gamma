import { ChartDocument, PutChartPayload } from "@lute/domain";
import { MongoClient } from "mongodb";
import { EventBus, EventType } from "../../lib";
import { buildChartRepo } from "./chart-repo";

export const buildChartInteractor = ({
  mongoClient,
  eventBus,
}: {
  eventBus: EventBus;
  mongoClient: MongoClient;
}) => {
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
      await eventBus.publish({
        type: EventType.ChartSaved,
        data: {
          chart: data,
        },
      });
      return data;
    },
  };
};
