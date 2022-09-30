import { buildControllerFactory } from "@lute/shared";
import { Db } from "mongodb";
import { assessmentSettingsSchema } from "./assessment";
import { buildProfileInteractor } from "./profile-interactor";
import { buildProfileRepo } from "./profile-repo";
import { seedDefaultProfile } from "./seeders";

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
    async putAlbumOnProfile(req, res) {
      const profileId = req.params.id as string;
      const albumFileName = req.body.fileName as string;

      if (!albumFileName) {
        return res.status(400).json({ ok: false, error: "Bad request" });
      }

      const profile = await profileInteractor.putAlbumOnProfile({
        profileId,
        albumFileName,
      });

      if (!profile) {
        return res.status(404).json({ ok: false, error: "Not found" });
      }

      return res.json({ ok: true, data: profile });
    },
    async createProfile(req, res) {
      const { id, title } = req.body;
      if (!id || !title) {
        return res.status(400).json({ ok: false, error: "Bad request" });
      }
      const profile = await profileInteractor.createProfile(id, title);
      return res.json({ ok: true, data: profile });
    },
    async seedDefaultProfile(req, res) {
      seedDefaultProfile({ profileInteractor });
      return res.json({ ok: true });
    },
    async getAlbumAssessment(req, res) {
      const { id: profileId, albumFileId } = req.params;
      const settings = assessmentSettingsSchema.parse(req.query);

      if (!profileId || !albumFileId) {
        return res.status(400).json({ ok: false, error: "Bad request" });
      }

      const assessment = await profileInteractor.getAlbumAssessment({
        profileId,
        albumFileId,
        settings,
      });
      return res.json({ ok: true, data: assessment });
    },
  };
});
