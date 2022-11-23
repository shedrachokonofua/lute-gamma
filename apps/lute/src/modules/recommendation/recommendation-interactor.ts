import {
  AssessmentModel,
  Assessment,
  RecommendationParameters,
  Recommendation,
  AlbumDocument,
} from "@lute/domain";
import { executeWithTimer } from "../../lib";
import { logger } from "../../logger";
import { AlbumInteractor } from "../albums";
import { ProfileInteractor } from "../profile";
import {
  buildJaccardAssessment,
  buildQuantileRankAssessment,
  buildQuantileRankAssessmentContext,
} from "./models";
import { AssessmentParameters } from "./recommendation-schema";

const assessAlbums = async (
  albums: AlbumDocument[],
  assess: (album: AlbumDocument) => Promise<Assessment>
) =>
  Promise.all(
    albums.map(async (album) => {
      try {
        return {
          album,
          assessment: await assess(album),
        };
      } catch (error) {
        logger.error({ albumId: album.fileName }, "Failed to assess album");
        return undefined;
      }
    })
  );

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

      switch (model) {
        case AssessmentModel.JaccardIndex:
          return buildJaccardAssessment({
            album,
            profile,
            settings,
          });
        case AssessmentModel.QuantileRank:
          return buildQuantileRankAssessment({
            album,
            settings,
            assessmentContext: await buildQuantileRankAssessmentContext({
              albumInteractor,
              profile,
              settings,
            }),
          });
      }
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
        await executeWithTimer(async () => {
          switch (model) {
            case AssessmentModel.JaccardIndex:
              return assessAlbums(albums, async (album) =>
                buildJaccardAssessment({
                  album,
                  profile,
                  settings,
                })
              );
            case AssessmentModel.QuantileRank:
              const assessmentContext =
                await buildQuantileRankAssessmentContext({
                  albumInteractor,
                  profile,
                  settings,
                });
              return assessAlbums(
                albums,
                async (album) =>
                  await buildQuantileRankAssessment({
                    album,
                    settings,
                    assessmentContext,
                  })
              );
          }
        });
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
