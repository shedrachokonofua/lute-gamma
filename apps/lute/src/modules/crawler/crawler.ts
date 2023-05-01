import https from "https";
import { retry, delay, executeWithTimer } from "../../lib";
import { CrawlerStatus } from "@lute/domain";
import axios from "axios";
import { logger } from "../../logger";
import { Context } from "../../context";
import { config } from "../../config";
import { QueueItem } from "./priority-queue";
import { crawlerMetrics } from "./crawler-metrics";

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

const stall = () => delay(config.crawler.stallSeconds);

const crawlerLogger = logger.child({ module: "crawler" });

const crawl = async (context: Context, { fileName, metadata }: QueueItem) => {
  crawlerLogger.info({ fileName }, "Fetching page");
  const [response, elapsedTime] = await executeWithTimer(() =>
    network.get(encodeURI(fileName))
  );
  crawlerMetrics.observeFileDownloadDuration(elapsedTime);
  crawlerLogger.info({ fileName, elapsedTime }, "Page fetched");

  await context.crawlerInteractor.incrementQuotaWindowHits();
  await context.fileInteractor.saveFile({
    name: fileName,
    data: response.data,
    eventCorrelationId: metadata?.correlationId,
  });
  crawlerLogger.info({ fileName }, "Page uploaded");
  await context.crawlerInteractor.clearError();
};

const startCrawlerWorker = async (context: Context) => {
  const { crawlerInteractor } = context;
  while (true) {
    await crawlerInteractor.enforceQuota();

    const status = await crawlerInteractor.getStatus();
    if (status === CrawlerStatus.Stopped || status === CrawlerStatus.Error) {
      await stall();
      continue;
    }

    const item = await crawlerInteractor.queue.claimItem();
    if (!item) {
      await stall();
      continue;
    }

    await retry(
      async () => {
        await crawl(context, item);
        await crawlerInteractor.queue.deleteItem(item.itemKey);
      },
      async (error) => {
        crawlerLogger.error({ error }, "Crawler error");
        await crawlerInteractor.queue.deleteItem(item.itemKey);
        await crawlerInteractor.dlq.push(item);
      }
    );
    await crawlerInteractor.reportCrawlerQueueLengthMetric();
  }
};

export const startCrawler = async (context: Context) => {
  crawlerMetrics.setQueueLength(
    await context.crawlerInteractor.queue.getSize()
  );

  for (let i = 0; i < config.crawler.concurrency; i++) {
    startCrawlerWorker(context);
  }
};
