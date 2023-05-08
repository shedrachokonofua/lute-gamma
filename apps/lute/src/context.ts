import { MongoClient } from "mongodb";
import { config } from "./config";
import { buildRedisClient, EventBus } from "./lib";
import { logger } from "./logger";
import { AlbumInteractor } from "./modules/albums";
import { buildArtistInteractor } from "./modules/artists";
import { buildChartInteractor } from "./modules/charts";
import { CrawlerInteractor } from "./modules/crawler";
import { FileInteractor, buildFileStorageClient } from "./modules/files";
import { LookupInteractor } from "./modules/lookup";
import { buildProfileInteractor } from "./modules/profile";
import {
  buildRecommendationInteractor,
  buildRecommendationPresetInteractor,
} from "./modules/recommendation";
import { buildSpotifyInteractor } from "./modules/spotify";

const spawnRedisClient = () =>
  buildRedisClient({
    logger,
    url: config.redis.url,
  });

export const buildContext = async () => {
  const redisClient = await spawnRedisClient();
  const mongoClient = await MongoClient.connect(config.mongo.url);
  const fileStorageClient = buildFileStorageClient();

  const eventBus = new EventBus({ redisClient: await spawnRedisClient() });

  const artistInteractor = buildArtistInteractor(mongoClient);
  const albumInteractor = await AlbumInteractor.create(eventBus, mongoClient);
  const chartInteractor = buildChartInteractor({ eventBus, mongoClient });
  const fileInteractor = new FileInteractor(
    redisClient,
    eventBus,
    fileStorageClient
  );
  const crawlerInteractor = new CrawlerInteractor(redisClient, fileInteractor);
  const lookupInteractor = new LookupInteractor({
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
  const recommendationPresetInteractor =
    await buildRecommendationPresetInteractor({
      mongoClient,
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
    recommendationPresetInteractor,
    spotifyInteractor,
    terminate,
  };
};

export type Context = Awaited<ReturnType<typeof buildContext>>;
