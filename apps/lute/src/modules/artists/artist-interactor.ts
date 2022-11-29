import { MongoClient } from "mongodb";
import { ArtistQuery, buildDbArtistQuery } from "./artist-query";
import { buildArtistRepo } from "./artist-repo";

export const buildArtistInteractor = (mongoClient: MongoClient) => {
  const artistRepo = buildArtistRepo(mongoClient);

  return {
    async getArtist(fileName: string) {
      return artistRepo.getArtist(fileName);
    },
    async findArtists(query: ArtistQuery) {
      return artistRepo.findArtist(buildDbArtistQuery(query));
    },
  };
};

export type ArtistInteractor = ReturnType<typeof buildArtistInteractor>;
