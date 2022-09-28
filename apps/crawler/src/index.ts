import "newrelic";
import { PORT } from "./config";
import { startCrawler } from "./crawler";
import { startServer } from "./crawler-server";

(async () => {
  startCrawler();
  startServer({ port: PORT });
})();
