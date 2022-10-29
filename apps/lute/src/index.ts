import { buildContext } from "./context";
import { startCrawler } from "./modules/crawler/crawler";
import { startServer } from "./server";

(async () => {
  const context = await buildContext();
  startServer(context);
  startCrawler(context);
})();
