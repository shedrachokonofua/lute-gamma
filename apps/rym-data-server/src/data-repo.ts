import {
  AlbumDocument,
  ChartDocument,
  PutAlbumPayload,
  transformObject,
} from "@lute/shared";
import { Filter } from "mongodb";
import { logger } from "./logger";
import { ServerContext } from "./ServerContext";

const mergeArrays = <T>(
  existingArray: T[] | undefined,
  newArray: T[] | undefined
): T[] => [...new Set([...(existingArray || []), ...(newArray || [])])];

const mergeAlbumDocuments = (
  existingAlbum: AlbumDocument,
  newAlbum: Partial<AlbumDocument>
): AlbumDocument => {
  const artists = mergeArrays(existingAlbum.artists, newAlbum.artists);
  const descriptors = mergeArrays(
    existingAlbum.descriptors,
    newAlbum.descriptors
  );
  const primaryGenres = mergeArrays(
    existingAlbum.primaryGenres,
    newAlbum.primaryGenres
  );
  const secondaryGenres = mergeArrays(
    existingAlbum.secondaryGenres,
    newAlbum.secondaryGenres
  );

  return {
    ...existingAlbum,
    ...newAlbum,
    artists,
    descriptors,
    primaryGenres,
    secondaryGenres,
  };
};

const getPutAlbumKey = (album: PutAlbumPayload) =>
  album.fileName
    ? { fileName: album.fileName }
    : album.fileId
    ? { fileId: album.fileId }
    : undefined;

export const buildDataRepo = (serverContext: ServerContext) => ({
  async patchAlbum(album: PutAlbumPayload): Promise<AlbumDocument> {
    const key = getPutAlbumKey(album);
    if (!key) {
      throw new Error("No key provided");
    }

    const existingAlbum = await serverContext.mongoDatabase
      .collection("albums")
      .findOne<AlbumDocument>(key);

    const albumToSave = existingAlbum
      ? mergeAlbumDocuments(existingAlbum, album)
      : album;

    const transformedAlbum = transformObject(albumToSave, {
      releaseDate: (date) => new Date(date),
    });

    const result = await serverContext.mongoDatabase
      .collection<AlbumDocument>("albums")
      .findOneAndUpdate(
        key,
        { $set: transformedAlbum },
        { upsert: true, returnDocument: "after" }
      );

    if (!result.value || !result.ok) {
      throw new Error("Failed to save album");
    }

    return result.value;
  },
  async putChart(chart: ChartDocument): Promise<ChartDocument> {
    logger.info({ chart }, "Saving chart");
    const result = await serverContext.mongoDatabase
      .collection<ChartDocument>("charts")
      .findOneAndUpdate(
        { fileName: chart.fileName },
        { $set: chart as Partial<ChartDocument> },
        { upsert: true, returnDocument: "after" }
      );

    logger.info({ result }, "Attempted to save chart");
    if (!result.value || !result.ok) {
      logger.error(result, "Failed to save chart");
      throw new Error("Failed to save chart");
    }

    return result.value;
  },
  async getAlbum(key: string): Promise<AlbumDocument | null> {
    logger.info({ key }, "Getting album");
    return serverContext.mongoDatabase
      .collection<AlbumDocument>("albums")
      .findOne({ $or: [{ fileName: key }, { fileId: key }] });
  },
  async getAlbums(keys: string[]): Promise<AlbumDocument[]> {
    logger.info({ keys }, "Getting albums");
    return serverContext.mongoDatabase
      .collection<AlbumDocument>("albums")
      .find({ $or: [{ fileName: { $in: keys } }, { fileId: { $in: keys } }] })
      .toArray();
  },
  async findAlbums(query: Filter<AlbumDocument>): Promise<AlbumDocument[]> {
    logger.info({ query }, "Finding albums");
    return serverContext.mongoDatabase
      .collection<AlbumDocument>("albums")
      .find(query)
      .toArray();
  },
});

export type DataRepo = ReturnType<typeof buildDataRepo>;
