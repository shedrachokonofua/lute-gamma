import { MongoClient } from "mongodb";
import { buildArtistRepo } from "./artist-repo";

export const buildArtistInteractor = (mongoClient: MongoClient) => {
  const artistRepo = buildArtistRepo(mongoClient);

  return {
    async getArtist(fileName: string) {
      return artistRepo.getArtist(fileName);
    },
  };
};
