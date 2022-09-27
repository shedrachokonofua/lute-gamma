import { buildControllerFactory, getSearchFileName } from "@lute/shared";
import { LookupRepo } from "./lookup-repo";
import { crawlerClient } from "./utils";

export const buildLookupController = buildControllerFactory(
  ({ lookupRepo }: { lookupRepo: LookupRepo }) => ({
    async getLookupByHash(req, res) {
      const { hash } = req.params;
      const lookup = await lookupRepo.getLookupByHash(hash);
      return res.json({ ok: true, data: lookup });
    },
    async putLookup(req, res) {
      const { hash } = req.params;
      const lookup = await lookupRepo.putLookup(hash, req.body);
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
      let lookup = await lookupRepo.getLookup(key);
      if (lookup) {
        return res.json({ ok: true, data: lookup });
      }
      const newLookup = await lookupRepo.createLookup(key);
      await crawlerClient.schedule({
        fileName: getSearchFileName(key.artist, key.album),
        lookupId: newLookup.keyHash,
      });
      return res.json({ ok: true, data: newLookup });
    },
  })
);
