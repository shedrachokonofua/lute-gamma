import Bottleneck from "bottleneck";
import { CrawlerStatus } from "@lute/domain";
import { config } from "../../config";
import { RedisClient } from "../../lib";
import { logger } from "../../logger";
import { FileInteractor } from "../files";
import { CrawlerRepository } from "./crawler-repository";
import {
  PriorityQueue,
  ClaimedQueueItem,
  Priority,
  QueuePushParams,
} from "./priority-queue";
import { crawlerMetrics } from "./crawler-metrics";
import { span } from "../../lib/decorators";

const QUOTA_REACHED = "QUOTA_REACHED";

const priorityToText = {
  [Priority.Express]: "express",
  [Priority.High]: "high",
  [Priority.Standard]: "standard",
  [Priority.Low]: "low",
};

interface CrawlerMonitor {
  status: CrawlerStatus;
  error: string | null;
  claimedItems: (ClaimedQueueItem & {
    priorityText: string;
  })[];
  claimedItemsCount: number;
  queueSize: number;
  remainingQuota: number;
}

export class CrawlerInteractor {
  private readonly quotaLimiter = new Bottleneck({ maxConcurrent: 1 });
  private readonly crawlerRepo: CrawlerRepository;
  private readonly queue: PriorityQueue;

  constructor(
    private readonly redisClient: RedisClient,
    private readonly fileInteractor: FileInteractor
  ) {
    this.crawlerRepo = new CrawlerRepository(redisClient);
    this.queue = new PriorityQueue(
      redisClient,
      "crawler:queue",
      config.crawler.maxSize
    );
  }

  async reportCrawlerQueueLengthMetric() {
    crawlerMetrics.setQueueLength(await this.queue.getSize());
  }

  async setStatus(status: CrawlerStatus) {
    await this.crawlerRepo.setStatus(status);
    await this.reportCrawlerQueueLengthMetric();
  }

  async getStatus() {
    return this.crawlerRepo.getStatus();
  }

  async schedule(params: QueuePushParams) {
    if ((await this.getStatus()) === CrawlerStatus.Draining) {
      throw new Error("Crawler is draining");
    }
    await this.queue.push(params);
    await this.reportCrawlerQueueLengthMetric();
  }

  @span
  async cachedSchedule(params: QueuePushParams) {
    if (!(await this.fileInteractor.isFileStale(params.fileName))) {
      await this.schedule(params);
    }
  }

  async clearError() {
    await this.crawlerRepo.clearError();
  }

  async getError() {
    return this.crawlerRepo.getError();
  }

  @span
  async getMonitor(): Promise<CrawlerMonitor> {
    const status = await this.crawlerRepo.getStatus();
    const error = await this.crawlerRepo.getError();
    const claimedItems = (await this.queue.getClaimedItems()).map((item) => ({
      ...item,
      priorityText: priorityToText[item.priority],
    }));
    const claimedItemsCount = claimedItems.length;
    const queueSize = await this.queue.getSize();
    const remainingQuota =
      config.crawler.quota.maxRequests -
      (await this.crawlerRepo.getQuotaWindowHits());

    return {
      status,
      error,
      queueSize,
      remainingQuota,
      claimedItemsCount,
      claimedItems,
    };
  }

  async emptyQueue() {
    await this.queue.empty();
    await this.reportCrawlerQueueLengthMetric();
  }

  async getQuotaWindowHits() {
    return this.crawlerRepo.getQuotaWindowHits();
  }

  async incrementQuotaWindowHits() {
    return this.crawlerRepo.incrementQuotaWindowHits();
  }

  async isQuotaEnforced() {
    return (
      (await this.crawlerRepo.getStatus()) === CrawlerStatus.Stopped &&
      (await this.crawlerRepo.getError()) === QUOTA_REACHED
    );
  }

  async resetQuota() {
    logger.info("Resetting quota");
    await this.crawlerRepo.resetQuotaWindowHits();
    if (await this.isQuotaEnforced()) {
      await this.crawlerRepo.clearError();
      await this.crawlerRepo.setStatus(CrawlerStatus.Running);
    }
  }

  async hasReachedQuota() {
    const hits =
      (await this.crawlerRepo.getQuotaWindowHits()) +
      (await this.queue.getClaimedItems()).length;
    return hits >= config.crawler.quota.maxRequests;
  }

  async enforceQuota() {
    await this.quotaLimiter.schedule(async () => {
      if (!(await this.hasReachedQuota()) || (await this.isQuotaEnforced()))
        return;
      await this.crawlerRepo.setStatus(CrawlerStatus.Stopped);
      await this.crawlerRepo.setError(QUOTA_REACHED);
    });
  }

  async setError(error: string) {
    await this.crawlerRepo.setError(error);
  }

  async peek() {
    return this.queue.peek();
  }

  async claimItem() {
    return this.queue.claimItem();
  }

  async releaseItem(itemKey: string) {
    return this.queue.deleteItem(itemKey);
  }

  async getQueueSize() {
    return this.queue.getSize();
  }
}
