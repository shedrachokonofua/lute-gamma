import { buildRedisClient, buildLuteEventClient } from "@lute/shared";
import { MongoClient } from "mongodb";
import { config } from "./config";
import { logger } from "./logger";
import { buildAlbumInteractor } from "./modules/albums";
import { buildChartInteractor } from "./modules/charts";
import { buildCrawlerInteractor } from "./modules/crawler";
import { buildFileInteractor, buildFileStorageClient } from "./modules/files";

export const buildContext = async () => {
  const mongoClient = new MongoClient(config.mongo.url);
  const redisClient = await buildRedisClient({
    logger,
    url: config.redis.url,
  });
  const fileStorageClient = buildFileStorageClient();
  const eventClient = buildLuteEventClient(redisClient);

  const albumInteractor = buildAlbumInteractor(mongoClient);
  const chartInteractor = buildChartInteractor({
    albumInteractor,
    mongoClient,
  });
  const crawlerInteractor = buildCrawlerInteractor(redisClient);
  const fileInteractor = buildFileInteractor({
    eventClient,
    redisClient,
    fileStorageClient,
  });

  return {
    buildRedisClient: () => buildRedisClient({ logger, url: config.redis.url }),
    mongoClient,
    redisClient,
    fileStorageClient,
    albumInteractor,
    chartInteractor,
    crawlerInteractor,
    fileInteractor,
  };
};

export type Context = Awaited<ReturnType<typeof buildContext>>;