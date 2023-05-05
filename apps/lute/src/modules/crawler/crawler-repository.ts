import { RedisClient } from "../../lib";
import { CrawlerStatus } from "@lute/domain";

export const isCrawlerStatus = (status: string): status is CrawlerStatus =>
  Object.values(CrawlerStatus).includes(status as CrawlerStatus);

const keys = {
  status: "crawler:status",
  error: "crawler:error",
  quotaWindowHits: "crawler:quota:hits",
};

export class CrawlerRepository {
  constructor(private readonly redisClient: RedisClient) {}

  async getStatus(): Promise<CrawlerStatus> {
    const statusStr = await this.redisClient.get(keys.status);
    return statusStr ? (statusStr as CrawlerStatus) : CrawlerStatus.Running;
  }

  async setStatus(status: CrawlerStatus) {
    await this.redisClient.set(keys.status, status);
  }

  async getError(): Promise<string | null> {
    return await this.redisClient.get(keys.error);
  }

  async setError(error: string) {
    await this.redisClient.set(keys.error, error);
  }

  async clearError() {
    await this.redisClient.del(keys.error);
  }

  async getQuotaWindowHits(): Promise<number> {
    const hitsStr = await this.redisClient.get(keys.quotaWindowHits);
    return hitsStr ? Number(hitsStr) : 0;
  }

  async incrementQuotaWindowHits(): Promise<number> {
    return await this.redisClient.incr(keys.quotaWindowHits);
  }

  async resetQuotaWindowHits(): Promise<void> {
    await this.redisClient.del(keys.quotaWindowHits);
  }
}
