import { AlbumDocument, PutAlbumPayload } from "@lute/domain";
import { transformObject } from "@lute/shared";
import { Filter, MongoClient } from "mongodb";
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

export const buildAlbumRepo = (mongoClient: MongoClient) => {
  const collection = mongoClient
    .db("rym-data")
    .collection<AlbumDocument>("albums");

  return {
    async putAlbum(album: PutAlbumPayload): Promise<AlbumDocument> {
      const key = getPutAlbumKey(album);
      if (!key) {
        throw new Error("No key provided");
      }

      const existingAlbum = await collection.findOne<AlbumDocument>(key);

      const albumToSave = transformPutAlbumPayload(
        existingAlbum
          ? {
              ...existingAlbum,
              ...album,
            }
          : album
      );

      const result = await collection.findOneAndUpdate(
        key,
        { $set: albumToSave },
        { upsert: true, returnDocument: "after" }
      );

      if (!result.value || !result.ok) {
        throw new Error("Failed to save album");
      }

      return result.value;
    },
    async getAlbum(key: string): Promise<AlbumDocument | null> {
      logger.info({ key }, "Getting album");
      return collection.findOne({ $or: [{ fileName: key }, { fileId: key }] });
    },
    async findAlbums(query: Filter<AlbumDocument>): Promise<AlbumDocument[]> {
      logger.info({ query }, "Finding albums");
      return collection.find(query).toArray();
    },
    async createAlbumIfNotExists(album: PutAlbumPayload): Promise<void> {
      const key = getPutAlbumKey(album);
      if (!key) {
        throw new Error("No key provided");
      }

      const existingAlbum = await collection.findOne<AlbumDocument>(key);

      if (existingAlbum) return;

      const albumToSave = transformPutAlbumPayload(album);

      await collection.insertOne(albumToSave as any);
    },
  };
};

export type AlbumRepo = ReturnType<typeof buildAlbumRepo>;
