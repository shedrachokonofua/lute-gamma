import {
  AlbumAssessment,
  AlbumRecommendation,
  ArtistAssessment,
  ArtistRecommendation,
  QuantileRankAlbumAssessmentSettings,
  QuantileRankArtistAssessmentSettings,
} from "@lute/domain";
import { AlbumInteractor } from "../../../albums";
import { getAlbumRecommendations, getArtistRecommendations } from "../helpers";
import { RecommendationModelInteractor } from "../recommendation-model-interactor";
import {
  buildQuantileRankAlbumAssessment,
  buildQuantileRankAlbumAssessmentContext,
} from "./quantile-rank-album";
import { buildQuantileRankArtistAssessment } from "./quantile-rank-artist";

export const buildQuantileRankInteractor = (
  albumInteractor: AlbumInteractor
): RecommendationModelInteractor<
  QuantileRankAlbumAssessmentSettings,
  QuantileRankArtistAssessmentSettings
> => ({
  async assessAlbum({ album, profile, settings }): Promise<AlbumAssessment> {
    const assessmentContext = await buildQuantileRankAlbumAssessmentContext({
      albumInteractor,
      profile,
      settings,
    });
    return buildQuantileRankAlbumAssessment({
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
    const assessmentContext = await buildQuantileRankAlbumAssessmentContext({
      albumInteractor,
      profile,
      settings,
    });
    return getAlbumRecommendations({
      albums,
      count,
      getAssessment: (album) =>
        buildQuantileRankAlbumAssessment({
          album,
          assessmentContext,
          settings,
        }),
    });
  },
  async assessArtist({ artist, profile, settings }): Promise<ArtistAssessment> {
    return buildQuantileRankArtistAssessment({
      artist,
      profile,
      settings,
    });
  },
  recommendArtists({
    artists,
    profile,
    settings,
    count,
  }): Promise<ArtistRecommendation[]> {
    return getArtistRecommendations({
      artists,
      count,
      getAssessment: (artist) =>
        buildQuantileRankArtistAssessment({
          artist,
          profile,
          settings,
        }),
    });
  },
});
