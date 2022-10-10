import "newrelic";
import { buildRedisClient, Queue } from "@lute/shared";
import { MongoClient } from "mongodb";
import { MONGO_URL, MONGO_DB_NAME, REDIS_URL } from "./config";
import { startServer } from "./profile-server";
import { logger } from "./logger";
import { buildProfileInteractor } from "./profile-interactor";
import { buildProfileRepo } from "./profile-repo";
import {
  buildSeedLookupInteractor,
  buildSeedLookupRepo,
  buildSeedersEventSubscribers,
} from "./seeders";

(async () => {
  const mongoClient = new MongoClient(MONGO_URL);
  const mongoDatabase = mongoClient.db(MONGO_DB_NAME);
  const redisClient = await buildRedisClient({
    logger,
    url: REDIS_URL,
  });

  const profileInteractor = buildProfileInteractor({
    profileRepo: buildProfileRepo({ mongoDatabase }),
  });
  const seedLookupInteractor = buildSeedLookupInteractor({
    seedLookupRepo: buildSeedLookupRepo(redisClient),
    profileInteractor,
  });

  startServer({
    mongoDatabase: mongoClient.db(MONGO_DB_NAME),
    redisClient,
    profileInteractor,
    seedLookupInteractor,
  });

  buildSeedersEventSubscribers(seedLookupInteractor);
})();
