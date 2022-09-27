import {
  RedisClient,
  buildQueue,
  QueueItem,
  CrawlerStatus,
  CrawlerItem,
} from "@lute/shared";

export const isCrawlerStatus = (status: string): status is CrawlerStatus =>
  Object.values(CrawlerStatus).includes(status as CrawlerStatus);

export const CRAWLER_STATUS_KEY = "crawler:status";
export const CRAWLER_ERROR_KEY = "crawler:error";

export const buildCrawlerRepo = (redisClient: RedisClient) => {
  const queue = buildQueue<CrawlerItem>({
    redisClient,
    name: "crawler",
  });
  return {
    async schedule(item: CrawlerItem) {
      await queue.push(item);
    },
    async peek(): Promise<QueueItem<CrawlerItem> | null> {
      return queue.peek();
    },
    async getStatus(): Promise<CrawlerStatus> {
      const statusStr = await redisClient.get(CRAWLER_STATUS_KEY);
      return statusStr ? (statusStr as CrawlerStatus) : CrawlerStatus.Running;
    },
    async setStatus(status: CrawlerStatus) {
      await redisClient.set(CRAWLER_STATUS_KEY, status);
    },
    async getError(): Promise<string | null> {
      return await redisClient.get(CRAWLER_ERROR_KEY);
    },
    async setError(error: string) {
      await redisClient.set(CRAWLER_ERROR_KEY, error);
    },
    async clearError() {
      await redisClient.del(CRAWLER_ERROR_KEY);
    },
    async getQueueSize(): Promise<number> {
      return await queue.getSize();
    },
    async emptyQueue(): Promise<void> {
      return await queue.empty();
    },
  };
};

export type CrawlerRepo = ReturnType<typeof buildCrawlerRepo>;
