import "newrelic";
import Graceful from "@ladjs/graceful";
import Bree from "bree";
import breeTsWorker from "@breejs/ts-worker";
import * as path from "node:path";
import { logger } from "./logger";
import { IS_TS_NODE } from "./config";

Bree.extend(breeTsWorker);

const bree = new Bree({
  logger,
  root: path.join(__dirname, "jobs"),
  defaultExtension: IS_TS_NODE ? "ts" : "js",
  jobs: [
    {
      name: "seed-default-profile",
      interval: "every 6 hours",
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

(async () => {
  await bree.start();
})();
