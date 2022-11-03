import Bottleneck from "bottleneck";
import { config } from "../../config";
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
  itemKey: string;
  enqueueTime: Date;
  dedupeKey: string;
  priority: Priority;
};

export type ClaimedQueueItem = QueueItem & {
  claimTtlSeconds: number;
};

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
  const pushLimiter = new Bottleneck({ maxConcurrent: 1 });
  const claimLimiter = new Bottleneck({ maxConcurrent: 1 });

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
      await pushLimiter.schedule(async () => {
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
    async getItemByKey(itemKey: string): Promise<QueueItem | null> {
      const [enqueueTime, dedupeKey] = itemKey.split(delimeter);
      const itemData = await redisClient.hGet(itemsSetKey, dedupeKey);
      if (!itemData) return null;
      const { fileName, metadata } = JSON.parse(itemData);

      return {
        itemKey,
        fileName,
        enqueueTime: new Date(Number(enqueueTime)),
        priority: (await redisClient.zScore(key, itemKey)) || Priority.Standard,
        dedupeKey,
        metadata,
      };
    },
    async at(index: number): Promise<QueueItem | null> {
      const [itemKey] = await redisClient.zRange(key, index, index);
      if (!itemKey) return null;
      return queue.getItemByKey(itemKey);
    },
    async peek(): Promise<QueueItem | null> {
      return queue.at(0);
    },
    async empty(): Promise<void> {
      await redisClient.del(key);
    },
    async isClaimed(itemKey: string): Promise<boolean> {
      return (await redisClient.exists(`${key}:claimed:${itemKey}`)) === 1;
    },
    async getNextUnclaimedItem(): Promise<QueueItem | null> {
      let currentIndex = 0;
      while (true) {
        const item = await queue.at(currentIndex);
        if (!item) return null;
        if (await queue.isClaimed(item.itemKey)) {
          currentIndex++;
          continue;
        }
        return item;
      }
    },
    async claimItem(): Promise<QueueItem | null> {
      return claimLimiter.schedule(async () => {
        const item = await queue.getNextUnclaimedItem();
        if (!item) {
          logger.debug("No unclaimed items in queue");
          return null;
        }
        await redisClient.set(`${key}:claimed:${item.itemKey}`, "true", {
          EX: config.crawler.claimTtlMinutes * 60,
        });
        logger.info({ item }, "Claimed item");
        return item;
      });
    },
    async deleteItem(itemKey: string): Promise<void> {
      const [, dedupeKey] = itemKey.split(delimeter);
      await redisClient
        .multi()
        .zRem(key, itemKey)
        .hDel(itemsSetKey, dedupeKey)
        .del(`${key}:claimed:${itemKey}`)
        .exec();
      logger.debug({ itemKey }, "Deleted item");
    },
    async getClaimedItems(): Promise<ClaimedQueueItem[]> {
      const claimedKeysRedis = await redisClient.keys(`${key}:claimed:*`);
      const claimedKeys = claimedKeysRedis.map((redisKey) => {
        return redisKey.replace(`${key}:claimed:`, "");
      });
      const itemsOrNull = await Promise.all(
        claimedKeys.map(queue.getItemByKey)
      );
      const items = itemsOrNull.filter((item) => item !== null) as QueueItem[];
      const claimedItems = await Promise.all(
        items.map(async (item) => ({
          ...item,
          claimTtlSeconds: await redisClient.ttl(
            `${key}:claimed:${item.itemKey}`
          ),
        }))
      );
      return claimedItems;
    },
  };

  return queue;
};
