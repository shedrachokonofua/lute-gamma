import { parentPort } from "node:worker_threads";
import process from "node:process";
import { buildContext } from "../context";
import { logger } from "../logger";

(async () => {
  const context = await buildContext();
  logger.info("Reset crawler quota job started");
  await context.crawlerInteractor.resetQuota();
  await context.terminate();
  logger.info("Reset crawler quota job finished");
  parentPort?.postMessage("done");
  process.exit(0);
})();
