import Bottleneck from "bottleneck";
import { config } from "../../config";
import { RedisClient } from "../../lib";
import { logger } from "../../logger";
import { span } from "../../lib/decorators";

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

const delimeter = ":DELIMETER:";
export class PriorityQueue {
  private readonly pushLimiter = new Bottleneck({ maxConcurrent: 1 });
  private readonly claimLimiter = new Bottleneck({ maxConcurrent: 1 });
  private readonly itemsSetKey: string;

  constructor(
    private readonly redisClient: RedisClient,
    private readonly queueKey: string,
    private readonly maxSize: number
  ) {
    this.itemsSetKey = `${queueKey}:items`;
  }

  async contains(dedupeKey: string) {
    return this.redisClient.hExists(this.itemsSetKey, dedupeKey);
  }

  async getSize(): Promise<number> {
    return await this.redisClient.zCard(this.queueKey);
  }

  async isFull() {
    return (await this.getSize()) >= this.maxSize;
  }

  @span
  async push({
    fileName,
    priority = Priority.Standard,
    dedupeKey = fileName,
    metadata = {},
  }: QueuePushParams) {
    await this.pushLimiter.schedule(async () => {
      if (await this.contains(dedupeKey)) return;
      if (await this.isFull()) {
        logger.warn({ key: this.queueKey }, "Push failed, queue is full");
        throw new Error("Queue is full");
      }

      const transaction = this.redisClient.multi();
      transaction.hSet(
        this.itemsSetKey,
        dedupeKey,
        JSON.stringify({
          fileName,
          metadata,
        })
      );
      transaction.zAdd(this.queueKey, {
        score: priority,
        value: `${Date.now()}${delimeter}${dedupeKey}`,
      });
      await transaction.exec();
    });
  }

  async getItemByKey(itemKey: string): Promise<QueueItem | null> {
    const [enqueueTime, dedupeKey] = itemKey.split(delimeter);
    const itemData = await this.redisClient.hGet(this.itemsSetKey, dedupeKey);
    if (!itemData) return null;
    const { fileName, metadata } = JSON.parse(itemData);

    return {
      itemKey,
      fileName,
      enqueueTime: new Date(Number(enqueueTime)),
      priority:
        (await this.redisClient.zScore(this.queueKey, itemKey)) ||
        Priority.Standard,
      dedupeKey,
      metadata,
    };
  }

  async at(index: number): Promise<QueueItem | null> {
    const [itemKey] = await this.redisClient.zRange(
      this.queueKey,
      index,
      index
    );
    if (!itemKey) return null;
    return this.getItemByKey(itemKey);
  }

  async peek(): Promise<QueueItem | null> {
    return this.at(0);
  }

  async empty(): Promise<void> {
    await this.redisClient.del(this.queueKey);
  }

  async isClaimed(itemKey: string): Promise<boolean> {
    return (
      (await this.redisClient.exists(`${this.queueKey}:claimed:${itemKey}`)) ===
      1
    );
  }

  async getNextUnclaimedItem(): Promise<QueueItem | null> {
    let currentIndex = 0;
    while (true) {
      const item = await this.at(currentIndex);
      if (!item) return null;
      if (await this.isClaimed(item.itemKey)) {
        currentIndex++;
        continue;
      }
      return item;
    }
  }

  @span
  async claimItem(): Promise<QueueItem | null> {
    return this.claimLimiter.schedule(async () => {
      const item = await this.getNextUnclaimedItem();
      if (!item) {
        logger.debug("No unclaimed items in queue");
        return null;
      }
      await this.redisClient.set(
        `${this.queueKey}:claimed:${item.itemKey}`,
        "true",
        {
          EX: config.crawler.claimTtlMinutes * 60,
        }
      );
      logger.info({ item }, "Claimed item");
      return item;
    });
  }

  async deleteItem(itemKey: string): Promise<void> {
    const [, dedupeKey] = itemKey.split(delimeter);
    await this.redisClient
      .multi()
      .zRem(this.queueKey, itemKey)
      .hDel(this.itemsSetKey, dedupeKey)
      .del(`${this.queueKey}:claimed:${itemKey}`)
      .exec();
    logger.debug({ itemKey }, "Deleted item");
  }

  @span
  async getClaimedItems(): Promise<ClaimedQueueItem[]> {
    const claimedKeysRedis = await this.redisClient.keys(
      `${this.queueKey}:claimed:*`
    );
    const claimedKeys = claimedKeysRedis.map((redisKey) => {
      return redisKey.replace(`${this.queueKey}:claimed:`, "");
    });
    const itemsOrNull = await Promise.all(
      claimedKeys.map((key) => this.getItemByKey(key))
    );
    const items = itemsOrNull.filter((item) => item !== null) as QueueItem[];
    const claimedItems = await Promise.all(
      items.map(async (item) => ({
        ...item,
        claimTtlSeconds: await this.redisClient.ttl(
          `${this.queueKey}:claimed:${item.itemKey}`
        ),
      }))
    );
    return claimedItems;
  }
}
