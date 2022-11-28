import {
  AssessmentModel,
  RecommendationParameters,
  AlbumAssessment,
  AlbumRecommendation,
} from "@lute/domain";
import { executeWithTimer } from "../../lib";
import { logger } from "../../logger";
import { AlbumInteractor } from "../albums";
import { ProfileInteractor } from "../profile";
import { buildQuantileRankInteractor, jaccardInteractor } from "./models";
import { AssessmentParameters } from "./recommendation-schema";

export const buildRecommendationInteractor = ({
  albumInteractor,
  profileInteractor,
}: {
  albumInteractor: AlbumInteractor;
  profileInteractor: ProfileInteractor;
}) => {
  const quantileRankInteractor = buildQuantileRankInteractor(albumInteractor);

  return {
    async assessAlbum({
      albumId,
      profileId,
      model,
      settings,
    }: AssessmentParameters): Promise<AlbumAssessment> {
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
          return jaccardInteractor.assessAlbum({
            album,
            profile,
            settings,
          });
        case AssessmentModel.QuantileRank:
          return quantileRankInteractor.assessAlbum({
            album,
            profile,
            settings,
          });
      }
    },
    async recommendAlbums({
      profileId,
      model,
      settings,
      filter,
      count = 50,
    }: RecommendationParameters): Promise<AlbumRecommendation[]> {
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

      switch (model) {
        case AssessmentModel.JaccardIndex:
          return jaccardInteractor.recommendAlbums({
            profile,
            albums,
            settings,
            count,
          });
        case AssessmentModel.QuantileRank:
          return quantileRankInteractor.recommendAlbums({
            profile,
            albums,
            settings,
            count,
          });
      }
    },
  };
};
