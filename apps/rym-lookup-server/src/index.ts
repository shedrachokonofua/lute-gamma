import "newrelic";
import { PORT } from "./config";
import { buildLookupEventSubscribers } from "./lookup-event-subscribers";
import { startServer } from "./lookup-server";

(async () => {
  startServer({ port: PORT });
  buildLookupEventSubscribers();
})();
