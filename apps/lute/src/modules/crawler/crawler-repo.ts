import { RedisClient } from "../../lib";
import { CrawlerStatus } from "@lute/domain";

export const isCrawlerStatus = (status: string): status is CrawlerStatus =>
  Object.values(CrawlerStatus).includes(status as CrawlerStatus);

const keys = {
  status: "crawler:status",
  error: "crawler:error",
  quotaWindowHits: "crawler:quota:hits",
};

export const buildCrawlerRepo = (redisClient: RedisClient) => {
  return {
    async getStatus(): Promise<CrawlerStatus> {
      const statusStr = await redisClient.get(keys.status);
      return statusStr ? (statusStr as CrawlerStatus) : CrawlerStatus.Running;
    },
    async setStatus(status: CrawlerStatus) {
      await redisClient.set(keys.status, status);
    },
    async getError(): Promise<string | null> {
      return await redisClient.get(keys.error);
    },
    async setError(error: string) {
      await redisClient.set(keys.error, error);
    },
    async clearError() {
      await redisClient.del(keys.error);
    },
    async getQuotaWindowHits(): Promise<number> {
      const hitsStr = await redisClient.get(keys.quotaWindowHits);
      return hitsStr ? Number(hitsStr) : 0;
    },
    async incrementQuotaWindowHits(): Promise<number> {
      return await redisClient.incr(keys.quotaWindowHits);
    },
    async resetQuotaWindowHits(): Promise<void> {
      await redisClient.del(keys.quotaWindowHits);
    },
  };
};

export type CrawlerRepo = ReturnType<typeof buildCrawlerRepo>;
