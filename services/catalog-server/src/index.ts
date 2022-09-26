import { buildRedisClient } from "@lute/shared";
import { startServer } from "./catalog-server";
import { logger } from "./logger";

(async () => {
  const redisClient = await buildRedisClient({ logger });
  await startServer({ redisClient });
})();
