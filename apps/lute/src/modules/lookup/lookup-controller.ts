import { buildControllerFactory } from "../../lib";
import { Context } from "../../context";

export const buildLookupController = buildControllerFactory(
  ({ lookupInteractor }: Context) => {
    return {
      async getLookupByHash(req, res) {
        const { hash } = req.params;
        const lookup = await lookupInteractor.getLookupByHash(hash);
        return res.json({ ok: true, data: lookup });
      },
      async putLookup(req, res) {
        const { hash } = req.params;
        const lookup = await lookupInteractor.putLookup(hash, req.body);
        return res.json({ ok: true, data: lookup });
      },
      async getOrCreateLookup(req, res) {
        const { artist, album } = req.query;
        if (!artist || !album) {
          return res.status(400).json({
            ok: false,
            error: "Missing artist or album query param",
          });
        }
        const key = {
          artist: artist as string,
          album: album as string,
        };
        const lookup = await lookupInteractor.getOrCreateLookup(key);
        return res.json({ ok: true, data: lookup });
      },
      async deleteLookup(req, res) {
        const { hash } = req.params;
        await lookupInteractor.deleteLookup(hash);
        return res.json({ ok: true });
      },
    };
  }
);
