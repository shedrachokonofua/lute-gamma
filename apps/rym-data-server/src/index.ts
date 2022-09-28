import "newrelic";
import { MongoClient } from "mongodb";
import { MONGO_DB_NAME, MONGO_URL, PORT } from "./config";
import { startServer } from "./data-server";

(async () => {
  const mongoClient = new MongoClient(MONGO_URL);

  await startServer({
    mongoClient,
    mongoDatabase: mongoClient.db(MONGO_DB_NAME),
    port: PORT,
  });
})();
