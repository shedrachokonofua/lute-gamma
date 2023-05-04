import "./tracing";
import { collectDefaultMetrics } from "prom-client";
import { buildContext } from "./context";
import { startCrons } from "./cron";
import { registerEventSubscribers } from "./event-subscribers";
import { Crawler } from "./modules/crawler";
import { startServer } from "./server";

collectDefaultMetrics();

(async () => {
  const context = await buildContext();
  const crawler = new Crawler(context);
  await registerEventSubscribers(context);
  crawler.start();
  startServer(context);
  startCrons();
  context.eventBus.listen(context);
})();
