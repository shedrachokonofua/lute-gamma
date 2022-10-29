import { buildRedisClient, buildLuteEventClient } from "@lute/shared";
import { MongoClient } from "mongodb";
import { config } from "./config";
import { logger } from "./logger";
import { buildFileInteractor, buildFileStorageClient } from "./modules/files";

export const buildContext = async () => {
  const mongoClient = new MongoClient(config.mongo.url);
  const redisClient = await buildRedisClient({
    logger,
    url: config.redis.url,
  });
  const fileStorageClient = buildFileStorageClient();
  const eventClient = buildLuteEventClient(redisClient);

  const fileInteractor = buildFileInteractor({
    eventClient,
    redisClient,
  });

  return {
    mongoClient,
    redisClient,
    fileStorageClient,
    fileInteractor,
  };
};

export type Context = Awaited<ReturnType<typeof buildContext>>;
