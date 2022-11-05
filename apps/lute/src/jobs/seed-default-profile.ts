import { parentPort } from "node:worker_threads";
import process from "node:process";
import { buildWorkerContext } from "../context";
import { runWithTraceId } from "../lib";
import { logger } from "../logger";
import { seedDefaultProfile } from "../modules/profile/seeders";

(async () => {
  await runWithTraceId(async () => {
    const context = await buildWorkerContext();
    logger.info("Seed default profile job started");
    await seedDefaultProfile(context);
    await context.terminate();
    logger.info("Seed default profile job finished");
  });
  parentPort?.postMessage("done");
  process.exit(0);
})();
