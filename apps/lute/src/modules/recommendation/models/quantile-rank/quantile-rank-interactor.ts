import {
  AlbumAssessment,
  AlbumRecommendation,
  ArtistAssessment,
  ArtistRecommendation,
  QuantileRankAssessmentSettings,
} from "@lute/domain";
import { AlbumInteractor } from "../../../albums";
import { getAlbumRecommendations } from "../helpers";
import { RecommendationModelInteractor } from "../recommendation-model-interactor";
import { buildQuantileRankAssessment } from "./quantile-rank-album";
import { buildQuantileRankAssessmentContext } from "./quantile-rank-assessment-context";

export const buildQuantileRankInteractor = (
  albumInteractor: AlbumInteractor
): RecommendationModelInteractor<
  QuantileRankAssessmentSettings,
  QuantileRankAssessmentSettings
> => ({
  async assessAlbum({ album, profile, settings }): Promise<AlbumAssessment> {
    const assessmentContext = await buildQuantileRankAssessmentContext({
      albumInteractor,
      profile,
      settings,
    });
    return buildQuantileRankAssessment({
      album,
      assessmentContext,
      settings,
    });
  },
  async recommendAlbums({
    profile,
    albums,
    settings,
    count,
  }): Promise<AlbumRecommendation[]> {
    const assessmentContext = await buildQuantileRankAssessmentContext({
      albumInteractor,
      profile,
      settings,
    });
    return getAlbumRecommendations({
      albums,
      count,
      getAssessment: (album) =>
        buildQuantileRankAssessment({
          album,
          assessmentContext,
          settings,
        }),
    });
  },
  assessArtist({ artist, profile, settings }): Promise<ArtistAssessment> {
    throw new Error("Function not implemented.");
  },
  recommendArtists({ profile, settings }): Promise<ArtistRecommendation[]> {
    throw new Error("Function not implemented.");
  },
});
