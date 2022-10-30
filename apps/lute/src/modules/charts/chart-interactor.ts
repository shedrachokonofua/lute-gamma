import { ChartDocument, PutChartPayload } from "@lute/domain";
import { MongoClient } from "mongodb";
import { AlbumInteractor } from "../albums";
import { buildChartRepo } from "./chart-repo";

export const buildChartInteractor = ({
  albumInteractor,
  mongoClient,
}: {
  albumInteractor: AlbumInteractor;
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
      await chartRepo.putChart(chartDocument);
      await Promise.all(
        chart.albums.map((album) =>
          albumInteractor.createAlbumIfNotExists(album.albumData)
        )
      );

      return chartDocument;
    },
  };
};
