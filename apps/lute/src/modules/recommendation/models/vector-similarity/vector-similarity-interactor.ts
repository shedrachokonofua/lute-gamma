import {
  AlbumDocument,
  Profile,
  AlbumAssessment,
  AlbumRecommendation,
  ArtistDocument,
  ArtistAssessment,
  ArtistRecommendation,
} from "@lute/domain";
import { MaybePromise } from "../helpers";
import { RecommendationModelInteractor } from "../recommendation-model-interactor";
import { VectorSimilarityRepository } from "./vector-similarity-repository";
import { RedisClient, span } from "../../../../lib";
import { logger } from "../../../../logger";
import { AlbumEncoder } from "./album-encoder";

export interface VectorSimilarityAlbumAssessmentSettings {
  weights: {
    rating: number;
    ratingCount: number;
    primaryGenre: number;
    secondaryGenre: number;
    descriptors: number;
  };
}

export interface VectorSimilarityArtistAssessmentSettings {}

export class VectorSimilarityInteractor
  implements
    RecommendationModelInteractor<
      VectorSimilarityAlbumAssessmentSettings,
      VectorSimilarityArtistAssessmentSettings
    >
{
  private constructor(
    private readonly vectorSimilarityRepository: VectorSimilarityRepository
  ) {}

  private static readonly encoder = new AlbumEncoder();

  static async create(redisClient: RedisClient) {
    const vectorSimilarityRepository =
      await VectorSimilarityRepository.createWithIndexes(redisClient);
    return new VectorSimilarityInteractor(vectorSimilarityRepository);
  }

  @span
  static async encodeAlbum(
    album: AlbumDocument,
    weights: VectorSimilarityAlbumAssessmentSettings["weights"] = {
      rating: 1,
      ratingCount: 1,
      primaryGenre: 1,
      secondaryGenre: 1,
      descriptors: 1,
    }
  ): Promise<number[]> {
    return VectorSimilarityInteractor.encoder.encode(album);
  }

  async saveAlbumVector(album: AlbumDocument) {
    await this.vectorSimilarityRepository.putAlbumVector(
      album.fileName,
      await VectorSimilarityInteractor.encodeAlbum(album)
    );
  }

  async getSimilarAlbums(album: AlbumDocument) {
    const vector = await VectorSimilarityInteractor.encodeAlbum(album);

    const similarAlbums =
      await this.vectorSimilarityRepository.getSimilarAlbums(vector, 50);

    return similarAlbums;
  }

  assessAlbum(params: {
    album: AlbumDocument;
    profile: Profile;
    settings: VectorSimilarityAlbumAssessmentSettings;
  }): MaybePromise<AlbumAssessment> {
    throw new Error("Method not implemented.");
  }

  recommendAlbums(params: {
    albums: AlbumDocument[];
    profile: Profile;
    settings: VectorSimilarityAlbumAssessmentSettings;
    count: number;
  }): MaybePromise<AlbumRecommendation[]> {
    throw new Error("Method not implemented.");
  }

  assessArtist(params: {
    artist: ArtistDocument;
    profile: Profile;
    settings: VectorSimilarityArtistAssessmentSettings;
  }): MaybePromise<ArtistAssessment> {
    throw new Error("Method not implemented.");
  }

  recommendArtists(params: {
    artists: ArtistDocument[];
    profile: Profile;
    settings: VectorSimilarityArtistAssessmentSettings;
    count: number;
  }): MaybePromise<ArtistRecommendation[]> {
    throw new Error("Method not implemented.");
  }
}
