import { buildRedisClient } from "@lute/shared";
import { startServer } from "./catalog-server";
import { PORT } from "./config";
import { logger } from "./logger";

(async () => {
  const redisClient = await buildRedisClient({ logger });
  await startServer({ port: PORT, redisClient });
})();
