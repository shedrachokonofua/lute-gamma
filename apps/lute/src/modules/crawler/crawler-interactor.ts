import { CrawlerStatus } from "@lute/domain";
import { RedisClient } from "@lute/shared";
import { buildCrawlerRepo } from "./crawler-repo";

export const buildCrawlerInteractor = (redisClient: RedisClient) => {
  const crawlerRepo = buildCrawlerRepo(redisClient);

  return {
    async setStatus(status: CrawlerStatus) {
      await crawlerRepo.setStatus(status);
    },
    async getStatus() {
      return crawlerRepo.getStatus();
    },
    async peek() {
      return crawlerRepo.peek();
    },
    async schedule(fileName: string, lookupId?: string) {
      await crawlerRepo.schedule({ fileName, lookupId });
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

      return {
        status,
        error,
        current,
        queueSize,
      };
    },
    async emptyQueue() {
      await crawlerRepo.emptyQueue();
    },
  };
};

export type CrawlerInteractor = ReturnType<typeof buildCrawlerInteractor>;
