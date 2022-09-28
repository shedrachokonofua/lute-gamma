import "newrelic";
import { buildRedisClient } from "@lute/shared";
import { startServer } from "./catalog-server";
import { REDIS_URL } from "./config";
import { logger } from "./logger";

(async () => {
  const redisClient = await buildRedisClient({ logger, url: REDIS_URL });
  await startServer({ redisClient });
})();
