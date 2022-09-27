import { Queue } from "@lute/shared";
import { MongoClient } from "mongodb";
import { MONGO_URL, MONGO_DB_NAME } from "./config";
import { startServer } from "./profile-server";

(async () => {
  const mongoClient = new MongoClient(MONGO_URL);

  await startServer({
    mongoDatabase: mongoClient.db(MONGO_DB_NAME),
  });
})();
