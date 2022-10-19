import { buildControllerFactory } from "@lute/shared";
import {
  albumQuerySchema,
  buildAlbumInteractor,
  buildAlbumRepo,
} from "./album";
import { buildChartRepo, buildChartInteractor } from "./chart";
import { ServerContext } from "./ServerContext";

export const buildDataController = buildControllerFactory(
  (serverContext: ServerContext) => {
    const albumInteractor = buildAlbumInteractor(buildAlbumRepo(serverContext));
    const chartInteractor = buildChartInteractor({
      chartRepo: buildChartRepo(serverContext),
      albumInteractor,
    });

    return {
      async putAlbum(req, res) {
        const album = await albumInteractor.putAlbum(req.body);
        return res.success(album);
      },
      async putChart(req, res) {
        const chart = await chartInteractor.putChart(req.body);
        return res.success(chart);
      },
      async getAlbum(req, res) {
        const album = await albumInteractor.getAlbum(req.params[0]);
        if (!album) {
          return res.status(404).json({ ok: false, error: "Not found" });
        }
        return res.success(album);
      },
      async query(req, res) {
        const query = albumQuerySchema.parse(req.body);
        const albums = await albumInteractor.findAlbums(query);
        return res.success(albums);
      },
    };
  }
);
