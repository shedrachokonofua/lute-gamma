import { buildContext } from "./context";
import { buildEventSubscribers } from "./event-subscribers";
import { startCrawler } from "./modules/crawler";
import { startServer } from "./server";

(async () => {
  const context = await buildContext();
  buildEventSubscribers(context);
  startServer(context);
  startCrawler(context);
})();
