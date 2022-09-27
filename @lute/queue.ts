import { nanoid } from "nanoid";
import rTracer from "cls-rtracer";
import { RedisClient } from "./db";

export interface QueueItem<T> {
  id: string;
  enqueueTime: number;
  data: T;
  traceId?: string;
}

export const buildQueue = <T = any>({
  redisClient,
  name,
}: {
  redisClient: RedisClient;
  name: string;
}) => {
  const queueKey = `queue:${name}`;

  return {
    async push(data: T) {
      await redisClient.rPush(
        queueKey,
        JSON.stringify({
          id: nanoid(),
          enqueueTime: Date.now(),
          data,
          traceId: rTracer.id(),
        })
      );
    },
    async pop(): Promise<QueueItem<T> | null> {
      const message = await redisClient.lPop(queueKey);
      return message ? JSON.parse(message) : undefined;
    },
    async peek(): Promise<QueueItem<T> | null> {
      const message = await redisClient.lIndex(queueKey, 0);
      return message ? JSON.parse(message) : undefined;
    },
    async getSize(): Promise<number> {
      return await redisClient.lLen(queueKey);
    },
    async empty(): Promise<void> {
      await redisClient.del(queueKey);
    },
  };
};

export type Queue<T> = ReturnType<typeof buildQueue>;
