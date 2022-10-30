import { buildControllerFactory } from "@lute/shared";
import { Context } from "../../context";
import { albumQuerySchema } from "./album-query";

export const buildAlbumController = buildControllerFactory(
  ({ albumInteractor }: Context) => {
    return {
      async putAlbum(req, res) {
        const album = await albumInteractor.putAlbum(req.body);
        return res.success(album);
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
