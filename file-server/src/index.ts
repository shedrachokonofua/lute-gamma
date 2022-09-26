import { buildLuteEventClient, buildRedisClient } from "@lute/shared";
import { PORT, REDIS_URL } from "./config";
import { startServer } from "./file-server";
import { logger } from "./logger";

(async () => {
  const redisClient = await buildRedisClient({ url: REDIS_URL, logger });
  await startServer({
    redisClient,
    eventClient: await buildLuteEventClient(redisClient),
    port: PORT,
  });
})();
