import {
  AssessmentModel,
  Assessment,
  RecommendationParameters,
  Recommendation,
} from "@lute/domain";
import { executeWithTimer } from "../../lib";
import { logger } from "../../logger";
import { AlbumInteractor } from "../albums";
import { ProfileInteractor } from "../profile";
import {
  buildQuantileRankAssessment,
  buildQuantileRankAssessmentContext,
} from "./models";
import { AssessmentParameters } from "./recommendation-schema";

const modelToContextBuilder = {
  [AssessmentModel.QuantileRank]: buildQuantileRankAssessmentContext,
} as const;

const modelToBuilder = {
  [AssessmentModel.QuantileRank]: buildQuantileRankAssessment,
} as const;

export const buildRecommendationInteractor = ({
  albumInteractor,
  profileInteractor,
}: {
  albumInteractor: AlbumInteractor;
  profileInteractor: ProfileInteractor;
}) => {
  const interactor = {
    async assessAlbum({
      albumId,
      profileId,
      model,
      settings,
    }: AssessmentParameters): Promise<Assessment> {
      const profile = await profileInteractor.getProfile(profileId);
      if (!profile) {
        logger.error({ profileId }, "Unknown profile");
        throw new Error("Unknown profile");
      }

      const album = await albumInteractor.getAlbum(albumId);
      if (!album) {
        logger.error({ albumId }, "Unknown album");
        throw new Error("Unknown album");
      }

      return modelToBuilder[model]({
        album,
        settings,
        assessmentContext: await modelToContextBuilder[model]({
          albumInteractor,
          profile,
          settings,
        }),
      });
    },
    async recommendAlbums({
      profileId,
      model,
      settings,
      filter,
      count = 50,
    }: RecommendationParameters): Promise<Recommendation[]> {
      const profile = await profileInteractor.getProfile(profileId);
      if (!profile) {
        logger.error({ profileId }, "Unknown profile");
        throw new Error("Unknown profile");
      }

      const [assessmentContext, assessmentContextElapsedTime] =
        await executeWithTimer(() =>
          modelToContextBuilder[model]({
            albumInteractor,
            profile,
            settings,
          })
        );
      logger.info(
        { elapsedTime: assessmentContextElapsedTime },
        "Built assessment context"
      );

      const [albums, albumsElapsedTime] = await executeWithTimer(() =>
        albumInteractor.findAlbums({
          primaryGenres: [...filter.primaryGenres],
          excludeArtists: [...filter.excludeArtists],
          excludePrimaryGenres: [...filter.excludePrimaryGenres],
          excludeKeys: [
            ...profile.albums.map((a) => a.item),
            ...filter.excludeAlbums,
          ],
        })
      );
      logger.info(
        { albums: albums.length, elapsedTime: albumsElapsedTime },
        "Got albums"
      );

      const [recommendations, recommendationElapsedTime] =
        await executeWithTimer(async () =>
          albums.map((album) => {
            try {
              return {
                album: album as any,
                assessment: modelToBuilder[model]({
                  album,
                  assessmentContext,
                  settings,
                }),
              };
            } catch {
              return undefined;
            }
          })
        );
      logger.info(
        {
          recommendations: recommendations.length,
          elapsedTime: recommendationElapsedTime,
        },
        "Built recommendation assessments"
      );

      const results = recommendations
        .filter((a): a is Recommendation => a !== undefined)
        .sort((a, b) => b.assessment.score - a.assessment.score)
        .slice(0, count);
      logger.info({ recommendations: results.length }, "Built recommendations");

      return results;
    },
  };

  return interactor;
};
