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
import { buildRecommendationInteractor } from "./modules/recommendation";
import { buildSpotifyInteractor } from "./modules/spotify";

const spawnRedisClient = () =>
  buildRedisClient({
    logger,
    url: config.redis.url,
  });

export const buildContext = async () => {
  const mongoClient = new MongoClient(config.mongo.url);
  await mongoClient.connect();
  const redisClient = await spawnRedisClient();
  const fileStorageClient = buildFileStorageClient();

  const eventBus = new EventBus({ redisClient: await spawnRedisClient() });

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
  const profileInteractor = await buildProfileInteractor({
    mongoClient,
    albumInteractor,
    eventBus,
  });
  const recommendationInteractor = buildRecommendationInteractor({
    albumInteractor,
    artistInteractor,
    profileInteractor,
  });
  const spotifyInteractor = buildSpotifyInteractor(redisClient);

  const terminate = async () => {
    await mongoClient.close();
    await redisClient.quit();
    await eventBus.terminate();
  };

  return {
    spawnRedisClient,
    fileStorageClient,
    mongoClient,
    redisClient,
    eventBus,
    artistInteractor,
    albumInteractor,
    chartInteractor,
    crawlerInteractor,
    fileInteractor,
    lookupInteractor,
    profileInteractor,
    recommendationInteractor,
    spotifyInteractor,
    terminate,
  };
};

export type Context = Awaited<ReturnType<typeof buildContext>>;
