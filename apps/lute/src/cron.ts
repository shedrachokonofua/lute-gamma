import Graceful from "@ladjs/graceful";
import Bree from "bree";
import breeTsWorker from "@breejs/ts-worker";
import * as path from "node:path";
import { logger } from "./logger";
import { config } from "./config";

Bree.extend(breeTsWorker);

const bree = new Bree({
  logger,
  root: path.join(__dirname, "jobs"),
  defaultExtension: config.cron.isTsNode ? "ts" : "js",
  jobs: [
    {
      name: "seed-default-profile",
      interval: "every 6 hours",
    },
    {
      name: "reset-crawler-quota",
      interval: `every ${config.crawler.quota.windowDays} days`,
    },
  ],
  errorHandler(error, workerMetadata) {
    logger.error(
      {
        error,
        workerMetadata,
      },
      "worker error"
    );
  },
});

new Graceful({ brees: [bree] }).listen();

export const startCrons = async () => {
  await bree.start();
};
