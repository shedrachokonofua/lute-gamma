import https from "https";
import { retry, delay } from "../../lib";
import { CrawlerStatus } from "@lute/domain";
import axios from "axios";
import { logger } from "../../logger";
import { Context } from "../../context";
import { config } from "../../config";
import { QueueItem } from "./priority-queue";
import { crawlerMetrics } from "./crawler-metrics";
import { span } from "../../lib/decorators";

const stall = () => delay(config.crawler.stallSeconds);

export class Crawler {
  private readonly network = axios.create({
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

  constructor(private readonly context: Context) {}

  @span
  async downloadFile(fileName: string) {
    return this.network.get(encodeURI(fileName));
  }

  @span
  async storeFile({ fileName, metadata }: QueueItem) {
    const response = await this.downloadFile(fileName);
    await this.context.crawlerInteractor.incrementQuotaWindowHits();
    await this.context.fileInteractor.saveFile({
      name: fileName,
      data: response.data,
      eventCorrelationId: metadata?.correlationId,
    });
    await this.context.crawlerInteractor.clearError();
  }

  @span
  async execute() {
    await this.context.crawlerInteractor.enforceQuota();

    const status = await this.context.crawlerInteractor.getStatus();
    if (status === CrawlerStatus.Stopped || status === CrawlerStatus.Error) {
      return false;
    }

    const item = await this.context.crawlerInteractor.queue.claimItem();
    if (!item) {
      return false;
    }

    await retry(
      async () => {
        await this.storeFile(item);
        await this.context.crawlerInteractor.queue.deleteItem(item.itemKey);
      },
      async (error) => {
        logger.error({ error }, "Crawler error");
        await this.context.crawlerInteractor.queue.deleteItem(item.itemKey);
        await this.context.crawlerInteractor.dlq.push(item);
      }
    );
    await this.context.crawlerInteractor.reportCrawlerQueueLengthMetric();
    return true;
  }

  async listen() {
    logger.info(this);
    while (true) {
      const didWork = await this.execute();
      if (!didWork) {
        await stall();
      }
    }
  }

  async start() {
    crawlerMetrics.setQueueLength(
      await this.context.crawlerInteractor.queue.getSize()
    );

    for (let i = 0; i < config.crawler.concurrency; i++) {
      this.listen();
    }
  }
}
