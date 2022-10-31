import { ArtistDocument } from "@lute/domain";
import { MongoClient } from "mongodb";

export const buildArtistRepo = (mongoClient: MongoClient) => {
  const collection = mongoClient
    .db("rym-data")
    .collection<ArtistDocument>("artists");

  return {
    async getArtist(fileName: string) {
      return collection.findOne({ fileName });
    },
  };
};
