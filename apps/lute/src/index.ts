import { buildContext } from "./context";
import { startCrons } from "./cron";
import { buildEventSubscribers } from "./event-subscribers";
import { startCrawler } from "./modules/crawler";
import { startServer } from "./server";

(async () => {
  const context = await buildContext();
  buildEventSubscribers(context);
  startCrawler(context);
  startServer(context);
  startCrons();
})();
