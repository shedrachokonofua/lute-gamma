import {
  isAssessmentModel,
  albumRecommendationFilterSchema,
  artistRecommendationFilterSchema,
} from "@lute/domain";
import { Context } from "../../context";
import { buildControllerFactory } from "../../lib";

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
      async getArtistAssessment(req, res) {
        const { artistId, profileId, model, settings = {} } = req.query;

        if (!artistId || !profileId || !isAssessmentModel(model)) {
          return res.status(400).json({ ok: false, error: "Bad request" });
        }

        const assessment = await recommendationInteractor.assessArtist({
          artistId: artistId as string,
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

        const filter = albumRecommendationFilterSchema.parse(inputFilters);
        const recommendations = await recommendationInteractor.recommendAlbums({
          filter,
          model,
          profileId: profileId as string,
          count: count ? Number(count) : undefined,
          settings: settings as any,
        });

        return res.json({ ok: true, data: recommendations });
      },
      async getArtistRecommendations(req, res) {
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

        const filter = artistRecommendationFilterSchema.parse(inputFilters);
        const recommendations = await recommendationInteractor.recommendArtists(
          {
            filter,
            model,
            profileId: profileId as string,
            count: count ? Number(count) : undefined,
            settings: settings as any,
          }
        );

        return res.json({ ok: true, data: recommendations });
      },
    };
  }
);
