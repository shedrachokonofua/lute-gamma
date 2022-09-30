import https from "https";
import {
  buildQueue,
  CrawlerStatus,
  retry,
  buildFileServerClient,
  delay,
  buildRedisClient,
  runWithTraceId,
} from "@lute/shared";
import axios from "axios";
import {
  FILE_SERVER_URL,
  PROXY_HOST,
  PROXY_PORT,
  PROXY_USERNAME,
  PROXY_PASSWORD,
  REDIS_URL,
  COOL_DOWN_SECONDS,
} from "./config";
import { buildCrawlerRepo } from "./crawler-repo";
import { logger } from "./logger";

interface CrawlerConfig {
  coolDownSeconds?: number;
}

export const startCrawler = async ({
  coolDownSeconds = COOL_DOWN_SECONDS,
}: CrawlerConfig = {}) => {
  const redisClient = await buildRedisClient({ logger, url: REDIS_URL });
  const network = axios.create({
    baseURL: "https://www.rateyourmusic.com",
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    proxy: {
      host: PROXY_HOST,
      port: PROXY_PORT,
      auth: {
        username: PROXY_USERNAME,
        password: PROXY_PASSWORD,
      },
    },
  });
  const fileServerClient = buildFileServerClient(FILE_SERVER_URL);
  const crawlerRepo = buildCrawlerRepo(redisClient);
  const queue = buildQueue<string>({
    redisClient,
    name: "crawler",
  });
  const wait = () => delay(coolDownSeconds);

  while (true) {
    const status = await crawlerRepo.getStatus();
    if (status === CrawlerStatus.Stopped || status === CrawlerStatus.Error) {
      await wait();
      continue;
    }

    await retry(
      async () => {
        const queueItem = await crawlerRepo.peek();
        if (!queueItem) {
          await wait();
          return;
        }
        const {
          data: { fileName, lookupId },
          traceId,
        } = queueItem;
        const response = await network.get(encodeURI(fileName));
        const html = response.data;
        await runWithTraceId(async () => {
          await fileServerClient.uploadFile({
            name: fileName,
            file: html,
            lookupId,
          });
        }, traceId);
        await crawlerRepo.clearError();
        await queue.pop();
        await wait();
      },
      async (error) => {
        logger.error({ error }, "Crawler error");
        await crawlerRepo.setStatus(CrawlerStatus.Error);
        await crawlerRepo.setError(error.message);
      }
    );
  }
};
