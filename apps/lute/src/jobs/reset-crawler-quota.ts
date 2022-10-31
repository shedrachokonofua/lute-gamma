import { parentPort } from "node:worker_threads";
import process from "node:process";
import { runWithTraceId } from "../lib";
import { buildContext } from "../context";
import { logger } from "../logger";

(async () => {
  await runWithTraceId(async () => {
    const context = await buildContext();
    logger.info("Reset crawler quota job started");
    await context.crawlerInteractor.resetQuota();
    logger.info("Reset crawler quota job finished");
  });
  parentPort?.postMessage("done");
  process.exit(0);
})();
