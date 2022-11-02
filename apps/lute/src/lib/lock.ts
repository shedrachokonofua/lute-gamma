import { RedisClient } from "./db";

export const buildLock = ({
  redisClient,
  key: lockKey,
}: {
  redisClient: RedisClient;
  key: string;
}) => {
  const key = `lock:${lockKey}`;

  return {
    async acquireLock() {
      const result = await redisClient.set(key, "lock", {
        NX: true,
        EX: 1,
      });
      return result === "OK";
    },
    async releaseLock() {
      await redisClient.del(key);
    },
  };
};
