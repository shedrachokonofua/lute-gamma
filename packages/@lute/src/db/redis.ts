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

  await redisClient.connect();
  logger.debug("Connected to redis");

  return redisClient;
};
