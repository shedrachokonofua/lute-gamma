import { SchemaFieldTypes } from "redis";
import { RedisClient } from "../../../../lib";
import { logger } from "../../../../logger";
import { VectorAlgorithms } from "redis";

export class VectorSimilarityRepository {
  private constructor(private readonly redisClient: RedisClient) {}

  private static readonly albumVectorIndexName: string = "album-vector-idx";
  private static readonly albumVectorPrefix: string = "vector:album";
  private static getAlbumVectorKey = (fileName: string) =>
    `${VectorSimilarityRepository.albumVectorPrefix}:${fileName}`;

  private static float32Buffer = (vector: number[]) =>
    Buffer.from(new Float32Array(vector).buffer);

  private async createIndexes() {
    try {
      await this.redisClient.ft.create(
        VectorSimilarityRepository.albumVectorIndexName,
        {
          v: {
            type: SchemaFieldTypes.VECTOR,
            ALGORITHM: VectorAlgorithms.HNSW,
            TYPE: "FLOAT32",
            DIM: 512,
            DISTANCE_METRIC: "COSINE",
          },
        },
        {
          ON: "HASH",
        }
      );
    } catch (error: any) {
      if (error.message === "Index already exists") {
        logger.info("Index already exists, skipping creation");
      } else {
        logger.error({ error }, "Error creating index");
        throw error;
      }
    }
  }

  static async createWithIndexes(redisClient: RedisClient) {
    const repository = new VectorSimilarityRepository(redisClient);
    await repository.createIndexes();
    return repository;
  }

  async putAlbumVector(fileName: string, vector: number[]) {
    await this.redisClient.hSet(
      VectorSimilarityRepository.getAlbumVectorKey(fileName),
      {
        v: VectorSimilarityRepository.float32Buffer(vector),
      }
    );
  }

  async getSimilarAlbums(vector: number[], limit: number) {
    const results = await this.redisClient.ft.search(
      VectorSimilarityRepository.albumVectorIndexName,
      `*=>[KNN ${limit} @v $BLOB as distance]`,
      {
        PARAMS: {
          BLOB: VectorSimilarityRepository.float32Buffer(vector),
        },
        SORTBY: "distance",
        DIALECT: 2,
        RETURN: "distance",
        LIMIT: {
          from: 0,
          size: limit,
        },
      }
    );

    return results;
  }
}
