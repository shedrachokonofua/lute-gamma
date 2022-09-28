import "newrelic";
import { buildLuteEventClient, buildRedisClient } from "@lute/shared";
import { PORT, REDIS_URL } from "./config";
import { startServer } from "./file-server";
import { logger } from "./logger";
import { buildFileStorageClient } from "./storage";

(async () => {
  const redisClient = await buildRedisClient({ url: REDIS_URL, logger });
  const fileStorageClient = buildFileStorageClient();

  await startServer({
    fileStorageClient,
    redisClient,
    eventClient: await buildLuteEventClient(redisClient),
    port: PORT,
  });
})();
