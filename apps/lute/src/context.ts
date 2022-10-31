import { MongoClient } from "mongodb";
import { config } from "./config";
import { buildRedisClient, EventBus } from "./lib";
import { logger } from "./logger";
import { buildAlbumInteractor } from "./modules/albums";
import { buildChartInteractor } from "./modules/charts";
import { buildCrawlerInteractor } from "./modules/crawler";
import { buildFileInteractor, buildFileStorageClient } from "./modules/files";
import { buildLookupInteractor } from "./modules/lookup";
import { buildProfileInteractor } from "./modules/profile";
import { buildSpotifyInteractor } from "./modules/spotify";

const spawnRedisClient = () =>
  buildRedisClient({
    logger,
    url: config.redis.url,
  });

export const buildContext = async () => {
  const mongoClient = new MongoClient(config.mongo.url);
  const redisClient = await spawnRedisClient();
  const fileStorageClient = buildFileStorageClient();

  const eventBus = new EventBus({
    redisClient: await spawnRedisClient(),
  });

  const albumInteractor = buildAlbumInteractor({ eventBus, mongoClient });
  const chartInteractor = buildChartInteractor(mongoClient);
  const crawlerInteractor = buildCrawlerInteractor(redisClient);
  const fileInteractor = buildFileInteractor({
    eventBus,
    redisClient,
    fileStorageClient,
  });
  const lookupInteractor = buildLookupInteractor({
    albumInteractor,
    crawlerInteractor,
    eventBus,
    redisClient,
  });
  const profileInteractor = buildProfileInteractor({
    mongoClient,
    albumInteractor,
  });
  const spotifyInteractor = buildSpotifyInteractor(redisClient);

  return {
    buildRedisClient: () => buildRedisClient({ logger, url: config.redis.url }),
    fileStorageClient,
    mongoClient,
    redisClient,
    eventBus,
    albumInteractor,
    chartInteractor,
    crawlerInteractor,
    fileInteractor,
    lookupInteractor,
    profileInteractor,
    spotifyInteractor,
  };
};

export type Context = Awaited<ReturnType<typeof buildContext>>;
