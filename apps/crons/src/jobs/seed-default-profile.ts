import { parentPort } from "node:worker_threads";
import process from "node:process";
import { profileClient } from "../clients";
import { runWithTraceId } from "@lute/shared";
import { logger } from "../logger";

(async () => {
  await runWithTraceId(async () => {
    logger.info("Seed default profile job started");
    await profileClient.seedDefaultProfile();
    logger.info("Seed default profile job finished");
  });
  parentPort?.postMessage("done");
  process.exit(0);
})();
