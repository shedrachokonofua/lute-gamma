import "./lib/instrumentation";
import { collectDefaultMetrics } from "prom-client";
import { buildContext } from "./context";
import { startCrons } from "./cron";
import { registerEventSubscribers } from "./event-subscribers";
import { Crawler } from "./modules/crawler";
import { startServer } from "./server";

collectDefaultMetrics();

(async () => {
  const context = await buildContext();
  await registerEventSubscribers(context);
  Crawler.run(context);
  startServer(context);
  startCrons();
  context.eventBus.listen(context);
})();
