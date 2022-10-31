import https from "https";
import { buildQueue, retry, delay, runWithTraceId } from "../../lib";
import { CrawlerStatus } from "@lute/domain";
import axios from "axios";
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
  const queue = buildQueue<string>({
    redisClient,
    name: "crawler",
  });
  const wait = () => delay(config.crawler.coolDownSeconds);

  while (true) {
    await context.crawlerInteractor.enforceQuota();
    const status = await context.crawlerInteractor.getStatus();
    if (status === CrawlerStatus.Stopped || status === CrawlerStatus.Error) {
      await wait();
      continue;
    }

    await retry(
      async () => {
        const queueItem = await context.crawlerInteractor.peek();
        if (!queueItem) {
          await wait();
          return;
        }
        logger.info({ queueItem }, "Crawling");
        const {
          data: { fileName, eventCorrelationId },
          traceId,
        } = queueItem;
        const response = await network.get(encodeURI(fileName));
        logger.info({ fileName, eventCorrelationId, traceId }, "Page fetched");
        await context.crawlerInteractor.incrementQuotaWindowHits();
        const html = response.data;
        await runWithTraceId(async () => {
          await context.fileInteractor.saveFile({
            name: fileName,
            data: html,
            eventCorrelationId,
          });
          await logger.info({ fileName, eventCorrelationId }, "Page uploaded");
        }, traceId);
        await context.crawlerInteractor.clearError();
        await queue.pop();
        await wait();
      },
      async (error) => {
        logger.error({ error }, "Crawler error");
        await context.crawlerInteractor.setStatus(CrawlerStatus.Error);
        await context.crawlerInteractor.setError(error.message);
      }
    );
  }
};
