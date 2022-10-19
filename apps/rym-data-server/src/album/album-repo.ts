import { AlbumDocument, PutAlbumPayload } from "@lute/domain";
import { transformObject } from "@lute/shared";
import { Filter } from "mongodb";
import { logger } from "../logger";
import { ServerContext } from "../ServerContext";

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

export const buildAlbumRepo = (serverContext: ServerContext) => ({
  async putAlbum(album: PutAlbumPayload): Promise<AlbumDocument> {
    const key = getPutAlbumKey(album);
    if (!key) {
      throw new Error("No key provided");
    }

    const existingAlbum = await serverContext.mongoDatabase
      .collection("albums")
      .findOne<AlbumDocument>(key);

    const albumToSave = transformPutAlbumPayload(
      existingAlbum
        ? {
            ...existingAlbum,
            ...album,
          }
        : album
    );

    const result = await serverContext.mongoDatabase
      .collection<AlbumDocument>("albums")
      .findOneAndUpdate(
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
    return serverContext.mongoDatabase
      .collection<AlbumDocument>("albums")
      .findOne({ $or: [{ fileName: key }, { fileId: key }] });
  },
  async findAlbums(query: Filter<AlbumDocument>): Promise<AlbumDocument[]> {
    logger.info({ query }, "Finding albums");
    return serverContext.mongoDatabase
      .collection<AlbumDocument>("albums")
      .find(query)
      .toArray();
  },
  async createAlbumIfNotExists(album: PutAlbumPayload): Promise<void> {
    const key = getPutAlbumKey(album);
    if (!key) {
      throw new Error("No key provided");
    }

    const existingAlbum = await serverContext.mongoDatabase
      .collection("albums")
      .findOne<AlbumDocument>(key);

    if (existingAlbum) return;

    const albumToSave = transformPutAlbumPayload(album);

    await serverContext.mongoDatabase
      .collection<Partial<AlbumDocument>>("albums")
      .insertOne(albumToSave);
  },
});

export type AlbumRepo = ReturnType<typeof buildAlbumRepo>;
