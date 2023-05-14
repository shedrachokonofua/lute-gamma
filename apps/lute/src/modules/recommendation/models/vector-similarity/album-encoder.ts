import { AlbumDocument } from "@lute/domain";

const maybeArray = <T>(value: T[] | undefined | null): T[] => value ?? [];

export class AlbumEncoder {
  private static hash(str: string): number {
    let hash = 5381;
    let i = str.length;
    while (i) {
      hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    // Convert to unsigned 32-bit integer
    return hash >>> 0;
  }

  private static shouldEncodeAlbum(album: AlbumDocument): boolean {
    const featureCount =
      maybeArray(album.artists).length +
      maybeArray(album.primaryGenres).length +
      maybeArray(album.secondaryGenres).length +
      maybeArray(album.descriptors).length;
    return featureCount > 15;
  }

  private static readonly weights = {
    rating: 0.05,
    ratingCount: 0.025,
    primaryGenre: 1,
    relatedPrimaryGenre: 0.1,
    secondaryGenre: 0.75,
    relatedSecondaryGenre: 0.075,
    descriptors: 0.5,
  };

  private static getRelatedGenres(genres: string[] | undefined): string[] {
    const relatedGenres: string[] = maybeArray(genres)
      .map((genre) => genre.toLowerCase().split(" "))
      .filter((genre) => genre.length > 1)
      .flat();
    return [...new Set(relatedGenres)];
  }

  constructor(private readonly dimensions: number = 512) {}

  private fitDimensions(vector: number[]): number[] {
    const currentDimensions = vector.length;
    if (currentDimensions < this.dimensions) {
      return [
        ...vector,
        ...Array.from({ length: this.dimensions - currentDimensions }).map(
          () => 0
        ),
      ];
    } else if (currentDimensions > this.dimensions) {
      return vector.slice(0, this.dimensions);
    }
    return vector;
  }
  private get featureDimensions(): Record<
    keyof typeof AlbumEncoder.weights,
    number
  > {
    const weightsSum = Object.values(AlbumEncoder.weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    const normalizedWeights = Object.keys(AlbumEncoder.weights).reduce(
      (normalizedWeights, key) => ({
        ...normalizedWeights,
        [key]:
          AlbumEncoder.weights[key as keyof typeof AlbumEncoder.weights] /
          weightsSum,
      }),
      {} as Record<keyof typeof AlbumEncoder.weights, number>
    );
    const featureDimensions = Object.keys(normalizedWeights).reduce(
      (featureDimensions, key) => ({
        ...featureDimensions,
        [key]: Math.floor(
          normalizedWeights[key as keyof typeof AlbumEncoder.weights] *
            this.dimensions
        ),
      }),
      {} as Record<keyof typeof AlbumEncoder.weights, number>
    );

    return featureDimensions;
  }

  private encodeCategoricalFeature(
    feature: keyof typeof AlbumEncoder.weights,
    categories: string[] | undefined
  ): number[] {
    const featureDimensions = this.featureDimensions[feature];
    const featureVector = Array(featureDimensions).fill(0);
    for (const category of maybeArray(categories)) {
      const categoryIndex = AlbumEncoder.hash(category) % featureDimensions;
      featureVector[categoryIndex] = 1;
    }
    return featureVector;
  }

  private encodeNumericalFeature(
    feature: keyof typeof AlbumEncoder.weights,
    normalizedValue: number
  ): number[] {
    return Array(this.featureDimensions[feature]).fill(normalizedValue);
  }

  private encodeRating(rating: number | undefined): number[] {
    const normalizedRating = (rating ?? 0) / 5;
    return this.encodeNumericalFeature("rating", normalizedRating);
  }

  private encodeRatingCount(ratingCount: number | undefined): number[] {
    const normalizedRatingCount = Math.min((ratingCount || 0) / 100000, 1);
    return this.encodeNumericalFeature("ratingCount", normalizedRatingCount);
  }

  public async encode(album: AlbumDocument): Promise<number[]> {
    if (!AlbumEncoder.shouldEncodeAlbum(album)) {
      throw new Error("Album should not be encoded");
    }
    return this.fitDimensions([
      ...this.encodeRating(album.rating),
      ...this.encodeRatingCount(album.ratingCount),
      ...this.encodeCategoricalFeature("primaryGenre", album.primaryGenres),
      ...this.encodeCategoricalFeature(
        "relatedPrimaryGenre",
        AlbumEncoder.getRelatedGenres(album.primaryGenres)
      ),
      ...this.encodeCategoricalFeature("secondaryGenre", album.secondaryGenres),
      ...this.encodeCategoricalFeature(
        "relatedSecondaryGenre",
        AlbumEncoder.getRelatedGenres(album.secondaryGenres)
      ),
      ...this.encodeCategoricalFeature("descriptors", album.descriptors),
    ]);
  }
}
