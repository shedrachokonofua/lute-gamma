import {
  AlbumAssessment,
  AlbumDocument,
  AlbumRecommendation,
  ArtistAssessment,
  ArtistDocument,
  ArtistRecommendation,
  Profile,
} from "@lute/domain";
import { MaybePromise } from "./helpers";

export interface RecommendationModelInteractor<
  AlbumAssessmentSettings extends {},
  ArtistAssessmentSettings extends {}
> {
  assessAlbum: (params: {
    album: AlbumDocument;
    profile: Profile;
    settings: AlbumAssessmentSettings;
  }) => MaybePromise<AlbumAssessment>;
  recommendAlbums: (params: {
    albums: AlbumDocument[];
    profile: Profile;
    settings: AlbumAssessmentSettings;
    count: number;
  }) => MaybePromise<AlbumRecommendation[]>;
  assessArtist: (params: {
    artist: ArtistDocument;
    profile: Profile;
    settings: ArtistAssessmentSettings;
  }) => MaybePromise<ArtistAssessment>;
  recommendArtists: (params: {
    artists: ArtistDocument[];
    profile: Profile;
    settings: ArtistAssessmentSettings;
    count: number;
  }) => MaybePromise<ArtistRecommendation[]>;
}
