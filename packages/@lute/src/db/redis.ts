import { createClient } from "redis";
import { Logger } from "pino";

export type RedisClient = ReturnType<typeof createClient>;

export const buildRedisClient = async ({
  url = "redis://redis:6379",
  logger,
}: {
  url?: string;
  logger: Logger;
}): Promise<RedisClient> => {
  const redisClient = createClient({ url });

  redisClient.on("error", (error) => {
    logger.error({ error: error?.message }, "Redis error");
  });
  redisClient.on("connect", () => {
    logger.info("Redis connected");
  });
  redisClient.on("reconnecting", () => {
    logger.info("Redis reconnecting");
  });
  redisClient.on("end", () => {
    logger.info("Redis disconnected");
  });

  await redisClient.connect();
  logger.debug("Connected to redis");

  return redisClient;
};
