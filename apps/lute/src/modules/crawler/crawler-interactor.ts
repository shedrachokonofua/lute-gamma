import { CrawlerStatus } from "@lute/domain";
import { config } from "../../config";
import { RedisClient } from "../../lib";
import { logger } from "../../logger";
import { buildCrawlerRepo } from "./crawler-repo";

const QUOTA_REACHED = "QUOTA_REACHED";

export const buildCrawlerInteractor = (redisClient: RedisClient) => {
  const crawlerRepo = buildCrawlerRepo(redisClient);

  const interactor = {
    async setStatus(status: CrawlerStatus) {
      await crawlerRepo.setStatus(status);
    },
    async getStatus() {
      return crawlerRepo.getStatus();
    },
    async peek() {
      return crawlerRepo.peek();
    },
    async schedule(fileName: string, eventCorrelationId?: string) {
      await crawlerRepo.schedule({ fileName, eventCorrelationId });
    },
    async clearError() {
      await crawlerRepo.clearError();
    },
    async getError() {
      return crawlerRepo.getError();
    },
    async getMonitor() {
      const status = await crawlerRepo.getStatus();
      const error = await crawlerRepo.getError();
      const current = await crawlerRepo.peek();
      const queueSize = await crawlerRepo.getQueueSize();
      const remainingQuota =
        config.crawler.quota.maxRequests -
        (await crawlerRepo.getQuotaWindowHits());

      return {
        status,
        error,
        current,
        queueSize,
        remainingQuota,
      };
    },
    async emptyQueue() {
      await crawlerRepo.emptyQueue();
    },
    async getQuotaWindowHits() {
      return crawlerRepo.getQuotaWindowHits();
    },
    async incrementQuotaWindowHits() {
      return crawlerRepo.incrementQuotaWindowHits();
    },
    async getIsQuotaEnforced() {
      return (
        (await crawlerRepo.getStatus()) === CrawlerStatus.Stopped &&
        (await crawlerRepo.getError()) === QUOTA_REACHED
      );
    },
    async resetQuota() {
      logger.info("Resetting quota");
      await crawlerRepo.resetQuotaWindowHits();
      if (await interactor.getIsQuotaEnforced()) {
        await crawlerRepo.clearError();
        await crawlerRepo.setStatus(CrawlerStatus.Running);
      }
    },
    async getIsQuotaReached() {
      const hits = await crawlerRepo.getQuotaWindowHits();
      return hits >= config.crawler.quota.maxRequests;
    },
    async enforceQuota() {
      if (
        !(await interactor.getIsQuotaReached()) ||
        (await interactor.getIsQuotaEnforced())
      )
        return;
      await crawlerRepo.setStatus(CrawlerStatus.Stopped);
      await crawlerRepo.setError(QUOTA_REACHED);
    },
    async setError(error: string) {
      await crawlerRepo.setError(error);
    },
  };

  return interactor;
};

export type CrawlerInteractor = ReturnType<typeof buildCrawlerInteractor>;
