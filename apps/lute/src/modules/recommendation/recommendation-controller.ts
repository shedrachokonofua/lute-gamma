import { Context } from "../../context";
import { buildControllerFactory } from "../../lib";
import {
  isAssessmentModel,
  recommendationFilterSchema,
} from "./recommendation-schema";

export const buildRecommendationController = buildControllerFactory<Context>(
  (context) => {
    const { recommendationInteractor } = context;

    return {
      async getAlbumAssessment(req, res) {
        const { albumId, profileId, model, settings = {} } = req.query;

        if (!albumId || !profileId || !isAssessmentModel(model)) {
          return res.status(400).json({ ok: false, error: "Bad request" });
        }

        const assessment = await recommendationInteractor.assessAlbum({
          albumId: albumId as string,
          profileId: profileId as string,
          model,
          settings: settings as any,
        });

        return res.json({ ok: true, data: assessment });
      },
      async getAlbumRecommendations(req, res) {
        const {
          profileId,
          model,
          count,
          settings = {},
          filter: inputFilters = {},
        } = req.query;

        if (!profileId || !isAssessmentModel(model)) {
          return res.status(400).json({ ok: false, error: "Bad request" });
        }

        const filter = recommendationFilterSchema.parse(inputFilters);
        const recommendations = await recommendationInteractor.recommendAlbums({
          filter,
          model,
          profileId: profileId as string,
          count: count ? Number(count) : undefined,
          settings: settings as any,
        });

        return res.json({ ok: true, data: recommendations });
      },
    };
  }
);
