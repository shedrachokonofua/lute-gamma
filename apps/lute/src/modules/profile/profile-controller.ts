import { buildControllerFactory } from "../../lib";
import { seedDefaultProfile, seedProfileWithPlaylist } from "./seeders";
import { Context } from "../../context";

export const buildProfileController = buildControllerFactory<Context>(
  (context) => {
    const { profileInteractor } = context;

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
        seedDefaultProfile(context);
        return res.json({ ok: true });
      },
      async seedProfileWithPlaylist(req, res) {
        const { id, playlistId } = req.params;
        if (!id || !playlistId) {
          return res.status(400).json({ ok: false, error: "Bad request" });
        }
        if (!(await profileInteractor.getProfile(id))) {
          return res
            .status(404)
            .json({ ok: false, error: "Profile not found" });
        }

        seedProfileWithPlaylist(context, {
          profileId: id,
          playlistId,
        });
        return res.json({ ok: true });
      },
    };
  }
);
