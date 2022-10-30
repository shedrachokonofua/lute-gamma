import { buildControllerFactory } from "../../../lib";
import { Context } from "../../../context";

export const buildLibraryController = buildControllerFactory<Context>(
  ({ spotifyInteractor }) => {
    return {
      async getSavedTracks(req, res) {
        const { offset, limit } = req.query;
        const data = await spotifyInteractor.getTracks({
          offset: offset ? Number(offset) : undefined,
          limit: limit ? Number(limit) : undefined,
        });

        return res.success(data);
      },
      async getPlaylistTracks(req, res) {
        const { playlistId } = req.params;
        const { offset, limit } = req.query;

        if (!playlistId) {
          return res.json({
            ok: false,
            error: "Missing playlistId",
          });
        }

        const data = await spotifyInteractor.getPlaylistTracks({
          playlistId: playlistId as string,
          offset: offset ? Number(offset) : undefined,
          limit: limit ? Number(limit) : undefined,
        });

        return res.success(data);
      },
    };
  }
);
