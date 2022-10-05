import { ChartDocument, PutChartPayload } from "@lute/domain";
import { DataRepo } from "./data-repo";

export const buildChartInteractor = (dataRepo: DataRepo) => {
  return {
    async putChart(chart: PutChartPayload): Promise<ChartDocument> {
      const chartDocument: ChartDocument = {
        ...chart,
        albums: chart.albums.map((album) => ({
          position: album.position,
          fileName: album.fileName,
        })),
      };
      await dataRepo.putChart(chartDocument);
      await Promise.all(
        chart.albums.map((album) => dataRepo.patchAlbum(album.albumData))
      );

      return chartDocument;
    },
  };
};
