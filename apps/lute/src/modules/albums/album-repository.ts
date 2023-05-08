import { AlbumDocument, PutAlbumPayload } from "@lute/domain";
import { span, transformObject } from "../../lib";
import { Collection, Filter, MongoClient } from "mongodb";
import { logger } from "../../logger";

const getPutAlbumKey = (album: PutAlbumPayload) =>
  album.fileName
    ? { fileName: album.fileName }
    : album.fileId
    ? { fileId: album.fileId }
    : undefined;

const transformPutAlbumPayload = (album: PutAlbumPayload) =>
  transformObject(album, {
    releaseDate: (date) => new Date(date),
  });

export class AlbumRepository {
  private readonly collection: Collection<AlbumDocument>;

  private constructor(mongoClient: MongoClient) {
    this.collection = mongoClient
      .db("lute")
      .collection<AlbumDocument>("albums");
  }

  async ensureIndexes() {
    await this.collection.createIndex({ fileName: 1 }, { unique: true });
    await this.collection.createIndex({ fileId: 1 }, { unique: true });
    await this.collection.createIndex({ "artists.name": 1 });
    await this.collection.createIndex({ primaryGenres: 1 });
    await this.collection.createIndex({ secondaryGenres: 1 });
    await this.collection.createIndex({ descriptors: 1 });
    await this.collection.createIndex({ rating: 1 });
  }

  static async createWithIndexes(mongoClient: MongoClient) {
    const repository = new AlbumRepository(mongoClient);
    await repository.ensureIndexes();
    return repository;
  }

  @span
  async putAlbum(album: PutAlbumPayload): Promise<AlbumDocument> {
    const key = getPutAlbumKey(album);
    if (!key) {
      throw new Error("No key provided");
    }

    const existingAlbum = await this.collection.findOne<AlbumDocument>(key);

    const albumToSave = transformPutAlbumPayload(
      existingAlbum
        ? {
            ...existingAlbum,
            ...album,
          }
        : album
    );

    const result = await this.collection.findOneAndUpdate(
      key,
      { $set: albumToSave },
      { upsert: true, returnDocument: "after" }
    );

    if (!result.value || !result.ok) {
      throw new Error("Failed to save album");
    }

    return result.value;
  }

  @span
  async getAlbum(key: string): Promise<AlbumDocument | null> {
    logger.info({ key }, "Getting album");
    return this.collection.findOne({
      $or: [{ fileName: key }, { fileId: key }],
    });
  }

  @span
  async findAlbums(query: Filter<AlbumDocument>): Promise<AlbumDocument[]> {
    logger.info({ query }, "Finding albums");
    return this.collection.find(query).toArray();
  }

  @span
  async createAlbumIfNotExists(album: PutAlbumPayload): Promise<void> {
    const key = getPutAlbumKey(album);
    if (!key) {
      throw new Error("No key provided");
    }

    const existingAlbum = await this.collection.findOne<AlbumDocument>(key);

    if (existingAlbum) return;

    const albumToSave = transformPutAlbumPayload(album);

    await this.collection.insertOne(albumToSave as any);
  }

  @span
  async getGenres(): Promise<string[]> {
    const docs = await this.collection.aggregate([
      {
        $project: {
          genres: {
            $concatArrays: ["$primaryGenres", "$secondaryGenres"],
          },
        },
      },
      {
        $unwind: {
          path: "$genres",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$genres",
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    return (await docs.toArray()).map((doc) => doc._id);
  }
}
