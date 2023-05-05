import { ArtistDocument } from "@lute/domain";
import { Filter, MongoClient } from "mongodb";
import { logger } from "../../logger";

export const buildArtistRepo = (mongoClient: MongoClient) => {
  const collection = mongoClient
    .db("lute")
    .collection<ArtistDocument>("artists");

  return {
    async getArtist(fileName: string): Promise<ArtistDocument | null> {
      return collection.findOne({ fileName });
    },
    async findArtist(query: Filter<ArtistDocument>): Promise<ArtistDocument[]> {
      logger.info({ query }, "Finding artists");
      return collection.find(query).toArray();
    },
  };
};
