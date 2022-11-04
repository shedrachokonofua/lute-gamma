import { MongoClient } from "mongodb";
import { config } from "./config";
import { buildRedisClient, EventBus } from "./lib";
import { logger } from "./logger";
import { buildAlbumInteractor } from "./modules/albums";
import { buildArtistInteractor } from "./modules/artists";
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

  const eventBusRedisClient = await spawnRedisClient();
  const eventBus = new EventBus({ redisClient: eventBusRedisClient });

  const artistInteractor = buildArtistInteractor(mongoClient);
  const albumInteractor = buildAlbumInteractor({ eventBus, mongoClient });
  const chartInteractor = buildChartInteractor({ eventBus, mongoClient });
  const fileInteractor = buildFileInteractor({
    eventBus,
    redisClient,
    fileStorageClient,
  });
  const crawlerInteractor = buildCrawlerInteractor({
    redisClient,
    fileInteractor,
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
    eventBus,
  });
  const spotifyInteractor = buildSpotifyInteractor(redisClient);

  return {
    buildRedisClient: () => buildRedisClient({ logger, url: config.redis.url }),
    fileStorageClient,
    mongoClient,
    redisClient,
    eventBusRedisClient,
    eventBus,
    artistInteractor,
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

export const buildWorkerContext = async () => {
  const context = await buildContext();
  return {
    ...context,
    async terminate() {
      await context.mongoClient.close();
      await context.redisClient.quit();
      await context.eventBusRedisClient.quit();
    },
  };
};

export type WorkerContext = Awaited<ReturnType<typeof buildWorkerContext>>;
