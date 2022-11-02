import Bottleneck from "bottleneck";
import { RedisClient } from "../../lib";
import { logger } from "../../logger";

export enum Priority {
  Express = 0,
  High = 1,
  Standard = 2,
  Low = 3,
}

export interface QueuePushParams {
  fileName: string;
  priority?: Priority;
  dedupeKey?: string;
  metadata?: {
    correlationId?: string;
    [key: string]: any;
  };
}

export type QueueItem = QueuePushParams & {
  enqueueTime: Date;
  dedupeKey: string;
};

const limiter = new Bottleneck({ maxConcurrent: 1 });

export const buildPriorityQueue = ({
  redisClient,
  key,
  maxSize,
}: {
  redisClient: RedisClient;
  key: string;
  maxSize: number;
}) => {
  const itemsSetKey = `${key}:items`;
  const delimeter = ":DELIMETER:";

  const queue = {
    async contains(dedupeKey: string) {
      return redisClient.hExists(itemsSetKey, dedupeKey);
    },
    async getSize(): Promise<number> {
      return await redisClient.zCard(key);
    },
    async isFull() {
      return (await queue.getSize()) >= maxSize;
    },
    async push({
      fileName,
      priority = Priority.Standard,
      dedupeKey = fileName,
      metadata = {},
    }: QueuePushParams) {
      await limiter.schedule(async () => {
        if (await queue.contains(dedupeKey)) return;
        if (await queue.isFull()) {
          logger.warn({ key }, "Push failed, queue is full");
          throw new Error("Queue is full");
        }

        const transaction = redisClient.multi();
        transaction.hSet(
          itemsSetKey,
          dedupeKey,
          JSON.stringify({
            fileName,
            metadata,
          })
        );
        transaction.zAdd(key, {
          score: priority,
          value: `${Date.now()}${delimeter}${dedupeKey}`,
        });
        await transaction.exec();
      });
    },
    async peek(count = 1): Promise<QueueItem[]> {
      const items = await redisClient.zRange(key, 0, count - 1);
      return Promise.all(
        items.map(async (item) => {
          const [enqueueTime, dedupeKey] = item.split(delimeter);
          const { fileName, metadata } = JSON.parse(
            (await redisClient.hGet(itemsSetKey, dedupeKey)) as string
          );

          return {
            fileName,
            enqueueTime: new Date(Number(enqueueTime)),
            priority:
              (await redisClient.zScore(key, item)) || Priority.Standard,
            dedupeKey,
            metadata,
          };
        })
      );
    },
    async collect(count = 1): Promise<QueueItem[]> {
      const items = await queue.peek(count);
      const transaction = redisClient.multi();
      transaction.zRemRangeByRank(key, 0, count - 1);
      items.forEach((item) => {
        transaction.hDel(itemsSetKey, item.dedupeKey);
      });
      await transaction.exec();
      return items;
    },
    async collectAll(): Promise<QueueItem[]> {
      return this.collect(0);
    },
    async empty(): Promise<void> {
      await redisClient.del(key);
    },
  };

  return queue;
};
