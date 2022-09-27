import { buildControllerFactory } from "@lute/shared";
import { Db } from "mongodb";
import { buildProfileInteractor } from "./profile-interactor";
import { buildProfileRepo } from "./profile-repo";

export const buildProfileController = buildControllerFactory<{
  mongoDatabase: Db;
}>(({ mongoDatabase }) => {
  const profileInteractor = buildProfileInteractor({
    profileRepo: buildProfileRepo({ mongoDatabase }),
  });

  return {
    async getProfile(req, res) {
      const profile = await profileInteractor.getProfile(
        req.params.id as string
      );

      if (!profile) {
        return res.status(404).json({ ok: false, error: "Not found" });
      }

      return res.json({ ok: true, data: profile });
    },
    async addAlbumToProfile(req, res) {
      const id = req.params.id as string;
      const albumFileName = req.body.albumFileName as string;

      if (!albumFileName) {
        return res.status(400).json({ ok: false, error: "Bad request" });
      }

      const profile = await profileInteractor.addAlbumToProfile(
        id,
        albumFileName
      );

      if (!profile) {
        return res.status(404).json({ ok: false, error: "Not found" });
      }

      return res.json({ ok: true, data: profile });
    },
  };
});
