import { ChartDocument, PutChartPayload } from "@lute/domain";
import { AlbumInteractor } from "../album";
import { ChartRepo } from "./chart-repo";

export const buildChartInteractor = ({
  chartRepo,
  albumInteractor,
}: {
  chartRepo: ChartRepo;
  albumInteractor: AlbumInteractor;
}) => {
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
        chart.albums.map((album) => albumInteractor.putAlbum(album.albumData))
      );

      return chartDocument;
    },
  };
};
