import {
  AlbumAssessment,
  AlbumRecommendation,
  ArtistAssessment,
  ArtistRecommendation,
  JaccardAssessmentSettings,
} from "@lute/domain";
import { getAlbumRecommendations } from "../helpers";
import { RecommendationModelInteractor } from "../recommendation-model-interactor";
import { buildJaccardAlbumAssessment } from "./jaccard-album";

export const jaccardInteractor: RecommendationModelInteractor<
  JaccardAssessmentSettings,
  JaccardAssessmentSettings
> = {
  assessAlbum({ album, profile, settings }): AlbumAssessment {
    return buildJaccardAlbumAssessment({
      album,
      profile,
      settings,
    });
  },
  recommendAlbums({
    profile,
    albums,
    settings,
    count,
  }): Promise<AlbumRecommendation[]> {
    return getAlbumRecommendations({
      albums,
      count,
      getAssessment: (album) =>
        buildJaccardAlbumAssessment({ album, profile, settings }),
    });
  },
  assessArtist({ artist, profile, settings }): Promise<ArtistAssessment> {
    throw new Error("Function not implemented.");
  },
  recommendArtists({ profile, settings }): Promise<ArtistRecommendation[]> {
    throw new Error("Function not implemented.");
  },
};
