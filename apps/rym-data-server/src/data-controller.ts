import { buildControllerFactory } from "@lute/shared";
import { Request, Response } from "express";
import { buildChartInteractor } from "./chart-interactor";
import { buildDataRepo } from "./data-repo";
import { albumQuerySchema, buildQueryInteractor } from "./query-interactor";
import { ServerContext } from "./ServerContext";

export const buildDataController = buildControllerFactory(
  (serverContext: ServerContext) => {
    const dataRepo = buildDataRepo(serverContext);
    const chartInteractor = buildChartInteractor(dataRepo);
    const queryInteractor = buildQueryInteractor(dataRepo);

    return {
      async patchAlbum(req: Request, res: Response) {
        const album = await dataRepo.patchAlbum(req.body);
        return res.json({ ok: true, data: album });
      },
      async putChart(req: Request, res: Response) {
        const chart = await chartInteractor.putChart(req.body);
        return res.json({ ok: true, data: chart });
      },
      async getAlbum(req: Request, res: Response) {
        const album = await dataRepo.getAlbum(req.params[0]);
        if (!album) {
          return res.status(404).json({ ok: false, error: "Not found" });
        }
        return res.json({ ok: true, data: album });
      },
      async query(req: Request, res: Response) {
        const query = albumQuerySchema.parse(req.body);
        const albums = await queryInteractor.getAlbums(query);

        return res.json({ ok: true, data: albums });
      },
    };
  }
);
