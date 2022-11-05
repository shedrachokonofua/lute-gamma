import Bottleneck from "bottleneck";
import { CrawlerStatus } from "@lute/domain";
import { config } from "../../config";
import { RedisClient } from "../../lib";
import { logger } from "../../logger";
import { FileInteractor } from "../files";
import { buildCrawlerRepo } from "./crawler-repo";
import {
  buildPriorityQueue,
  ClaimedQueueItem,
  Priority,
  QueueItem,
  QueuePushParams,
} from "./priority-queue";

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

export const buildCrawlerInteractor = ({
  redisClient,
  fileInteractor,
}: {
  redisClient: RedisClient;
  fileInteractor: FileInteractor;
}) => {
  const crawlerRepo = buildCrawlerRepo(redisClient);
  const queue = buildPriorityQueue({
    redisClient,
    key: "crawler:queue",
    maxSize: config.crawler.maxSize,
  });
  const dlq = buildPriorityQueue({
    redisClient,
    key: "crawler:dlq",
    maxSize: config.crawler.dlqMaxSize,
  });
  const quotaLimiter = new Bottleneck({ maxConcurrent: 1 });

  const interactor = {
    queue,
    dlq,
    async setStatus(status: CrawlerStatus) {
      await crawlerRepo.setStatus(status);
    },
    async getStatus() {
      return crawlerRepo.getStatus();
    },
    async schedule(params: QueuePushParams) {
      await queue.push(params);
    },
    async cachedSchedule(params: QueuePushParams) {
      if (!(await fileInteractor.getDoesFileExist(params.fileName))) {
        await queue.push(params);
      }
    },
    async batchCachedSchedule(params: QueuePushParams[]) {
      for (const item of params) {
        if (!(await fileInteractor.getDoesFileExist(item.fileName))) {
          await queue.push(item);
        }
      }
    },
    async pushToDLQ(item: QueueItem) {
      await dlq.push(item);
    },
    async clearError() {
      await crawlerRepo.clearError();
    },
    async getError() {
      return crawlerRepo.getError();
    },
    async getMonitor(): Promise<CrawlerMonitor> {
      const status = await crawlerRepo.getStatus();
      const error = await crawlerRepo.getError();
      const claimedItems = (await queue.getClaimedItems()).map((item) => ({
        ...item,
        priorityText: priorityToText[item.priority],
      }));
      const claimedItemsCount = claimedItems.length;
      const queueSize = await queue.getSize();
      const remainingQuota =
        config.crawler.quota.maxRequests -
        (await crawlerRepo.getQuotaWindowHits());

      return {
        status,
        error,
        claimedItems,
        claimedItemsCount,
        queueSize,
        remainingQuota,
      };
    },
    async emptyQueue() {
      await queue.empty();
    },
    async getQuotaWindowHits() {
      return crawlerRepo.getQuotaWindowHits();
    },
    async incrementQuotaWindowHits() {
      return crawlerRepo.incrementQuotaWindowHits();
    },
    async isQuotaEnforced() {
      return (
        (await crawlerRepo.getStatus()) === CrawlerStatus.Stopped &&
        (await crawlerRepo.getError()) === QUOTA_REACHED
      );
    },
    async resetQuota() {
      logger.info("Resetting quota");
      await crawlerRepo.resetQuotaWindowHits();
      if (await interactor.isQuotaEnforced()) {
        await crawlerRepo.clearError();
        await crawlerRepo.setStatus(CrawlerStatus.Running);
      }
    },
    async hasReachedQuota() {
      const hits =
        (await crawlerRepo.getQuotaWindowHits()) +
        (await queue.getClaimedItems()).length;
      return hits >= config.crawler.quota.maxRequests;
    },
    async enforceQuota() {
      await quotaLimiter.schedule(async () => {
        if (
          !(await interactor.hasReachedQuota()) ||
          (await interactor.isQuotaEnforced())
        )
          return;
        await crawlerRepo.setStatus(CrawlerStatus.Stopped);
        await crawlerRepo.setError(QUOTA_REACHED);
      });
    },
    async setError(error: string) {
      await crawlerRepo.setError(error);
    },
  };

  return interactor;
};

export type CrawlerInteractor = ReturnType<typeof buildCrawlerInteractor>;
