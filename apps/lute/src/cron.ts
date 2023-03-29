import Graceful from "@ladjs/graceful";
import Bree from "bree";
import * as path from "node:path";
import { logger } from "./logger";
import { config } from "./config";

Bree.extend(require("@breejs/ts-worker"));

const bree = new Bree({
  logger,
  root: path.join(__dirname, "jobs"),
  defaultExtension: config.cron.isTsNode ? "ts" : "js",
  jobs: [
    {
      name: "seed-default-profile",
      interval: `every ${config.cron.profileSeedIntervalHours} hours`,
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
