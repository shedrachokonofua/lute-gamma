import { Context } from "../../context";
import { buildControllerFactory } from "../../lib";

export const buildArtistController = buildControllerFactory<Context>(
  (context) => ({
    async getArtist(req, res) {
      const artist = await context.artistInteractor.getArtist(req.params[0]);
      if (!artist) {
        return res.notFound();
      }
      res.success(artist);
    },
  })
);
