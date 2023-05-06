import { parentPort } from "node:worker_threads";
import process from "node:process";
import { buildContext } from "../context";
import { logger } from "../logger";
import { seedDefaultProfile } from "../modules/profile/seeders";

(async () => {
  const context = await buildContext();
  logger.info("Seed default profile job started");
  await seedDefaultProfile(context);
  await context.terminate();
  logger.info("Seed default profile job finished");
  parentPort?.postMessage("done");
  process.exit(0);
})();
