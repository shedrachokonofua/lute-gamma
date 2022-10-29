import https from "https";
import { buildQueue, retry, delay, runWithTraceId } from "@lute/shared";
import { CrawlerStatus } from "@lute/domain";
import axios from "axios";
import { buildCrawlerRepo } from "./crawler-repo";
import { logger } from "../../logger";
import { Context } from "../../context";
import { config } from "../../config";

export const startCrawler = async (context: Context) => {
  const redisClient = await context.buildRedisClient();
  const network = axios.create({
    baseURL: "https://www.rateyourmusic.com",
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    proxy: {
      host: config.proxy.host,
      port: config.proxy.port,
      auth: {
        username: config.proxy.username,
        password: config.proxy.password,
      },
    },
  });
  const crawlerRepo = buildCrawlerRepo(redisClient);
  const queue = buildQueue<string>({
    redisClient,
    name: "crawler",
  });
  const wait = () => delay(config.crawler.coolDownSeconds);

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
        logger.info({ queueItem }, "Crawling");
        const {
          data: { fileName, lookupId },
          traceId,
        } = queueItem;
        const response = await network.get(encodeURI(fileName));
        logger.info({ fileName, lookupId, traceId }, "Page fetched");
        const html = response.data;
        await runWithTraceId(async () => {
          await context.fileInteractor.saveFile({
            name: fileName,
            data: html,
            lookupId,
          });
          await logger.info({ fileName, lookupId }, "Page uploaded");
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
