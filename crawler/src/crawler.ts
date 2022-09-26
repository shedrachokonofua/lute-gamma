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
import { FILE_SERVER_URL } from "./config";
import { buildCrawlerRepo } from "./crawler-repo";
import { logger } from "./logger";

interface CrawlerConfig {
  delaySeconds?: number;
}

export const startCrawler = async ({
  delaySeconds = 5,
}: CrawlerConfig = {}) => {
  const redisClient = await buildRedisClient({ logger });
  const network = axios.create({
    baseURL: "https://www.rateyourmusic.com",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    },
  });
  const fileServerClient = buildFileServerClient(FILE_SERVER_URL);
  const crawlerRepo = buildCrawlerRepo(redisClient);
  const queue = buildQueue<string>({
    redisClient,
    name: "crawler",
  });
  const wait = () => delay(delaySeconds);

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
        const response = await network.get(fileName);
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
      },
      async (error) => {
        console.log(error);
        logger.error({ error }, "Crawler error");
        await crawlerRepo.setStatus(CrawlerStatus.Error);
        await crawlerRepo.setError(error.message);
      }
    );
  }
};
