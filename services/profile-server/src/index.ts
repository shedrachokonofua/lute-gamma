import { Queue } from "@lute/shared";
import { MongoClient } from "mongodb";
import { MONGO_URL, MONGO_DB_NAME } from "./config";
import { startServer } from "./profile-server";

type ItemAndCount = {
  item: string | number;
  count: number;
};

interface Profile {
  id: string;
  title: string;
  lastUpdatedAt: Date;
  summary: {
    topPrimaryGenres: string[];
    topSecondaryGenres: string[];
    topDescriptors: string[];
    topYears: number[];
    topDecade: number;
  };
  details: {
    albumFileNames: string[];
    primaryGenresAndCounts: ItemAndCount[];
    secondaryGenresAndCounts: ItemAndCount[];
    descriptorsAndCounts: ItemAndCount[];
    yearsAndCounts: ItemAndCount[];
    decadesAndCounts: ItemAndCount[];
  };
}

(async () => {
  const mongoClient = new MongoClient(MONGO_URL);

  await startServer({
    mongoDatabase: mongoClient.db(MONGO_DB_NAME),
  });
})();
