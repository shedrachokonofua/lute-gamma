import https from "https";
import { retry, delay, executeWithTimer } from "../../lib";
import { CrawlerStatus } from "@lute/domain";
import axios from "axios";
import { logger } from "../../logger";
import { Context } from "../../context";
import { config } from "../../config";
import { QueueItem } from "./priority-queue";

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

const stall = () => delay(config.crawler.coolDownSeconds);

const crawlerLogger = logger.child({ module: "crawler" });

const crawl = async (context: Context, { fileName, metadata }: QueueItem) => {
  crawlerLogger.info({ fileName }, "Fetching page");
  const [response, elapsedTime] = await executeWithTimer(() =>
    network.get(encodeURI(fileName))
  );
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

export const startCrawler = async (context: Context) => {
  while (true) {
    await context.crawlerInteractor.enforceQuota();

    const status = await context.crawlerInteractor.getStatus();
    if (status === CrawlerStatus.Stopped || status === CrawlerStatus.Error) {
      await stall();
      continue;
    }

    const items = await context.crawlerInteractor.peek();
    if (!items.length) {
      await stall();
      continue;
    }

    crawlerLogger.info({ items }, "Crawling batch");
    const [, elapsedTime] = await executeWithTimer(() =>
      Promise.all(
        items.map((item) =>
          retry(
            () => crawl(context, item),
            async (error) => {
              crawlerLogger.error({ error }, "Crawler error");
              await context.crawlerInteractor.pushToDLQ(item);
            }
          )
        )
      )
    );
    crawlerLogger.info(
      { elapsedTime, concurrency: config.crawler.concurrency },
      "Batch crawled"
    );

    await context.crawlerInteractor.collect();
  }
};
